# 牌组管理

## 概述

牌组（Deck）是卡片的分类容器，类似标签/文件夹，用于将相关内容归类整理。每个牌组有名称、颜色和描述，用户可以在创建卡片时选择所属牌组。

> **注意**：代码中 `Tag` 接口与 `Deck` 模型字段有映射关系：`id→id`、`name→title`、`color→color`

---

## 牌组数据结构

```typescript
Deck {
  id:          string    // 唯一 ID (cuid)
  title:       string    // 牌组名称（用户内唯一）
  description: string?   // 描述（可选）
  color:       string    // 十六进制颜色，默认 #137fec
  isPublic:    boolean   // 是否公开（预留字段，默认 false）
  deletedAt:   DateTime? // 软删除时间戳（null 表示未删除）

  userId:      string    // 所有者
  cardDecks:   CardDeck[] // 关联卡片

  createdAt:   DateTime
  updatedAt:   DateTime
}
```

**唯一约束**：`(userId, title)` — 同一用户下牌组名称不能重复。

---

## 创建牌组

**API**：`POST /api/decks`

**入口**：侧边栏底部"新建牌组"按钮

### 创建流程

```
用户点击"新建牌组"
      │
      ▼
填写牌组信息:
┌─────────────────────────┐
│  牌组名称  [必填]         │
│  描述      [可选]         │
│  颜色      [色彩选择器]   │
└─────────────────────────┘
      │
      ▼
POST /api/decks {
  title:       "...",
  description: "...",
  color:       "#137fec",
  isPublic:    false
}
      │
      ▼
服务端处理:
  ┌─────────────────────────────────────────┐
  │  1. requireAuth() 验证身份               │
  │                                         │
  │  2. Zod 验证输入                         │
  │                                         │
  │  3. 检查是否存在同名软删除牌组             │
  │     → 若有，先永久删除旧记录              │
  │                                         │
  │  4. 事务中创建新 Deck 记录               │
  │                                         │
  │  5. 唯一约束检查 (userId, title)         │
  │     → 已存在则返回 409 冲突错误           │
  └─────────────────────────────────────────┘
      │
      ▼
返回 { deck } 或错误
```

### 重建同名牌组的处理

当用户创建与已软删除牌组同名的新牌组时，系统会先清除旧的软删除记录，再创建新记录，保持命名唯一性。

---

## 软删除牌组

**API**：`DELETE /api/decks/[id]`

```typescript
// 软删除：仅更新 deletedAt 字段，数据保留
await prisma.deck.update({
  where: { id, userId },
  data:  { deletedAt: new Date() }
});
```

**软删除的好处**：
- 卡片数据不会丢失（卡片与牌组是多对多关系）
- 可以通过重建同名牌组恢复结构
- 删除后牌组不再出现在侧边栏和选择器中

```
删除前:
  Deck { id: "xyz", title: "英语词汇", deletedAt: null }
  CardDeck { cardId: "abc", deckId: "xyz" }

删除后:
  Deck { id: "xyz", title: "英语词汇", deletedAt: 2026-04-02 }
  CardDeck { cardId: "abc", deckId: "xyz" }  ← 关联保留
  Card "abc" ← 卡片保留，仍可在仪表盘中看到
```

---

## 获取牌组列表

### 基础列表

**API**：`GET /api/decks`

- 仅返回 `deletedAt = null` 的牌组
- 用于侧边栏展示、创建卡片时的下拉选择

### 带卡片数量

**API**：`GET /api/decks/with-count`

返回每个牌组的卡片数量，用于侧边栏显示：

```json
[
  {
    "id": "cld...",
    "title": "英语词汇",
    "color": "#137fec",
    "cardCount": 42
  },
  ...
]
```

---

## 侧边栏展示

**组件**：`/workspace/app/(pages)/components/sidebar-tags-section.tsx`

```
侧边栏牌组区域:
┌─────────────────────────────┐
│  牌组                         │
│  ─────────────────────────  │
│  ● 英语词汇          42 张    │
│  ● 数学公式          18 张    │
│  ● 历史笔记           7 张    │
│  ─────────────────────────  │
│  + 新建牌组                   │
└─────────────────────────────┘
```

- 牌组颜色以圆点显示（使用 `color` 字段）
- 显示该牌组下的卡片数量
- 点击牌组可过滤仪表盘卡片列表

---

## 仪表盘过滤

用户可以在仪表盘通过牌组筛选卡片：

**URL**：`/dashboard?deckId=<deckId>`

```
GET /api/dashboard/cards?deckId=cld...
      │
      ▼
WHERE userId = current_user
  AND CardDeck.deckId = deckId   ← 按牌组过滤
```

---

## 卡片与牌组的关系

```
       Card                 CardDeck              Deck
┌──────────────┐        ┌────────────┐       ┌──────────┐
│ id: "card1"  │◀──────▶│ cardId     │──────▶│ id       │
│ front: "..."  │        │ deckId     │       │ title    │
│ ...          │        └────────────┘       │ color    │
└──────────────┘                             └──────────┘

约束:
- 一张卡可属于多个牌组（多对多）
- 实际使用中通常一张卡只属于一个牌组
- 删除牌组时，CardDeck 记录级联删除，Card 本身保留
- 删除卡片时，CardDeck 记录级联删除
```

---

## API 汇总

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/decks` | 获取所有牌组（未删除） |
| POST | `/api/decks` | 创建牌组 |
| GET | `/api/decks/with-count` | 获取牌组及卡片数量 |
| DELETE | `/api/decks/[id]` | 软删除牌组 |
