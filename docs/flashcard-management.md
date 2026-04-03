# 闪卡管理

## 概述

闪卡（Flashcard）是应用的基础学习单元，包含正面（问题/提示）和背面（答案），支持创建、编辑、删除和按牌组分类。

---

## 闪卡数据结构

```typescript
Card {
  id:          string     // 唯一 ID (cuid)
  cardType:    'FLASHCARD' | 'ARTICLE'

  // 闪卡内容
  front:       string     // 正面（问题/词语）
  back:        string     // 背面（答案/解释）
  note:        string?    // 提示/助记词（可选）

  // SM-2 算法字段
  nextReviewAt: DateTime  // 下次复习时间
  interval:     number    // 当前间隔（天）
  easeFactor:   number    // 难度系数（默认 2.5）
  repetitions:  number    // 连续答对次数（被动识别）
  outputRepetitions: number // 连续输出练习答对次数（主动产出）
  state:        CardState // NEW | LEARNING | REVIEW | RELEARNING

  // 关联
  cardDecks:   CardDeck[] // 所属牌组
  outputExercise: OutputExercise? // 关联的输出练习数据
  outputPracticeLogs: OutputPracticeLog[] // 输出练习记录
  userId:      string     // 所有者
  logs:        ReviewLog[] // 复习记录

  createdAt:   DateTime
  updatedAt:   DateTime
}
```

---

## 创建闪卡

**入口**：仪表盘右上角 "创建" 下拉菜单 → "新建闪卡"

**组件**：`/workspace/app/(pages)/dashboard/components/create-card-modal.tsx`

**Server Action**：`createCard()` in `/workspace/app/lib/actions.ts`

### 创建流程

```
用户打开 Modal
      │
      ▼
填写表单内容:
┌─────────────────────────────┐
│  标题（正面）   [必填]       │
│  ────────────────────────   │
│  背面内容      [富文本编辑]  │
│  ────────────────────────   │
│  提示/助记词   [可选]        │
│  ────────────────────────   │
│  难度选择      ⭐⭐⭐⭐ [默认] │
│  ────────────────────────   │
│  所属牌组      [可选下拉]    │
└─────────────────────────────┘
      │
      ▼
提交 FormData
      │
      ▼
Server Action: createCard()
      │
      ├── Zod 验证输入
      │
      ├── 计算初始 easeFactor（根据难度）
      │
      ├── 写入 Card 记录（state=NEW, nextReviewAt=now()）
      │
      ├── 若选了牌组 → 写入 CardDeck 关联
      │
      ├── revalidatePath('/dashboard')  ← 刷新页面数据
      │
      └── 返回 { success: true } 或 { error: string }
```

### 表单字段验证（Zod Schema）

```typescript
createCardSchema = z.object({
  front:     z.string().min(1),   // 不能为空
  back:      z.string().min(1),   // 不能为空
  note:      z.string().optional(),
  quality:   z.number().min(3).max(5),  // 初始难度
  deckId:    z.string().optional(),
})
```

### 初始难度对照

| 选择 | quality | easeFactor | 说明 |
|------|---------|------------|------|
| ⭐⭐⭐ | 3 | 2.36 | 较难内容，频繁复习 |
| ⭐⭐⭐⭐ | 4 | 2.50 | 普通内容（默认） |
| ⭐⭐⭐⭐⭐ | 5 | 2.60 | 容易内容，间隔更快拉长 |

### 富文本编辑器（背面内容）

背面内容使用 **TipTap** 编辑器，支持：
- 加粗 / 斜体 / 下划线
- 有序列表 / 无序列表
- 插入链接

---

## 编辑闪卡

**Server Action**：`updateCard()` in `/workspace/app/lib/actions.ts`

- 可修改：`front`、`back`、`note`、`deckId`
- **不会修改** SM-2 算法字段（`interval`、`easeFactor` 等）
- 修改后 `revalidatePath('/dashboard')` 刷新列表

---

## 删除闪卡

**API**：`DELETE /api/cards/[id]`

- **硬删除**：从数据库中永久删除
- 级联删除关联的 `ReviewLog` 和 `CardDeck` 记录
- 操作不可撤销

---

## 卡片状态标签

仪表盘列表中每张卡片显示当前状态标签：

**组件**：`/workspace/app/(pages)/dashboard/components/card-status-badge.tsx`

| 状态 | 标签颜色 | 说明 |
|------|----------|------|
| NEW | 蓝色 | 从未复习 |
| LEARNING | 黄色 | 初次学习中 |
| REVIEW | 绿色 | 正常间隔复习 |
| RELEARNING | 红色 | 遗忘后重新学习 |

---

## 数据库索引优化

```sql
-- 支持高效查询"今日待复习"
INDEX (userId, nextReviewAt)

-- 支持按创建时间排序
INDEX (userId, createdAt)

-- 支持按难度系数排序
INDEX (userId, easeFactor)
```

---

## 与牌组的关系

卡片与牌组通过 `CardDeck` 关联表实现多对多关系（目前一张卡通常只属于一个牌组）：

```
Card ←──── CardDeck ────▶ Deck
 id            cardId       id
               deckId       title
                            color
```

- 创建卡片时可选择牌组（也可不选）
- 删除牌组不会删除卡片（只删除 CardDeck 关联）
- 删除卡片会级联删除 CardDeck 关联
