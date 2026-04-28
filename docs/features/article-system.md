# 文章系统

## 概述

文章系统支持将长篇内容（文章、笔记、知识点）以 Markdown 格式录入，通过**召回块（Recall Blocks）**设置主动回忆问题，并使用 SM-2 算法调度文章复习。

---

## 核心概念：召回块（Recall Block）

召回块是嵌入在文章中的**主动回忆问题**，帮助用户在阅读文章时测试自己对关键知识点的掌握程度。

```
文章内容示例:
┌─────────────────────────────────────────────┐
│  ## 艾宾浩斯遗忘曲线                          │
│                                              │
│  赫尔曼·艾宾浩斯发现，人类记忆会随时间...      │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │ 📝 召回块（主动回忆）                  │   │
│  │ 问：第一次复习应在学习后几天进行？      │   │
│  │ 答：[隐藏，点击显示] → 1天后           │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  SM-2 算法的核心是根据...                     │
└─────────────────────────────────────────────┘
```

### 召回块数据结构

```typescript
RecallBlock {
  id:       string   // 唯一标识
  question: string   // 问题内容
  answer:   string   // 答案内容（复习时隐藏，点击显示）
  position: number   // 在文章中的位置
}
```

---

## 文章编辑器

**路由**：`/article-editor`

**组件**：`/workspace/app/(pages)/article-editor/components/article-editor.tsx`

### 编辑器界面布局

```
┌─────────────────────────────────────────────────────┐
│  标题输入框                                           │
├──────────────┬──────────────────────────────────────┤
│              │  工具栏: B I U Link List              │
│   指标面板    ├──────────────────────────────────────┤
│              │                                       │
│ ┌──────────┐ │  TipTap 富文本编辑区                  │
│ │可读性评分 │ │                                       │
│ │  78/100  │ │  (编辑模式 / Markdown 预览模式 切换)   │
│ └──────────┘ │                                       │
│ ┌──────────┐ │                                       │
│ │预计学习时间│ │                                       │
│ │  12 分钟  │ │                                       │
│ └──────────┘ ├──────────────────────────────────────┤
│ ┌──────────┐ │  召回块列表                            │
│ │召回块数量 │ │  + 添加召回块按钮                      │
│ │    3 个   │ │                                       │
│ └──────────┘ │                                       │
├──────────────┴──────────────────────────────────────┤
│  牌组选择      [保存文章]                              │
└─────────────────────────────────────────────────────┘
```

### 文章指标（实时计算）

**文件**：`/workspace/app/lib/text-analysis.ts`

#### 字数统计

```typescript
function calculateWordCount(text: string): number
```

处理步骤：
1. 移除代码块（` ``` ... ``` `）
2. 移除行内代码（`` `code` ``）
3. 移除 Markdown 链接语法（`[text](url)`）
4. 移除图片语法
5. 移除 Markdown 标点符号
6. 按空格分割，计数非空词

#### 预计学习时间

```
学习时间（分钟）= ⌈字数 / 220⌉
```

（平均阅读速度：220 词/分钟）

#### 可读性评分（Flesch Reading Ease）

```
可读性 = 206.835
       - 1.015  × (总词数 / 总句数)
       - 84.6   × (总音节数 / 总词数)
```

**评分范围**：0-100（钳制），分数越高越易读

| 分数范围 | 阅读难度 | 对应水平 |
|----------|----------|----------|
| 90-100 | 极易 | 5年级 |
| 70-90 | 较易 | 6年级 |
| 60-70 | 标准 | 7-8年级 |
| 50-60 | 中等 | 高中 |
| 30-50 | 较难 | 大学 |
| 0-30 | 极难 | 专业级 |

### TipTap 编辑器扩展

使用的 TipTap 扩展：
- **StarterKit**：加粗、斜体、标题、列表、引用等基础格式
- **Underline**：下划线
- **Placeholder**：占位符提示文字

---

## 创建文章卡片

**API**：`POST /api/article-cards`

```
用户在编辑器中完成编辑
      │
      ▼
选择牌组（可选）
      │
      ▼
点击"保存文章"
      │
      ▼
POST /api/article-cards {
  articleTitle:   "...",
  articleContent: "...(markdown)",
  deckId:         "...(可选)",
  recallBlocks:   [...(可选)]
}
      │
      ▼
服务端处理:
  - Zod 验证
  - 计算 wordCount
  - 计算 readTimeMins
  - 初始化 SM-2 值（state=NEW, easeFactor=2.5）
  - 写入 Card 记录（cardType=ARTICLE）
  - 若有牌组 → 写入 CardDeck
      │
      ▼
返回新创建的卡片
```

### 请求体验证

```typescript
createArticleCardSchema = z.object({
  articleTitle:   z.string().min(1),
  articleContent: z.string().min(1),
  deckId:         z.string().optional(),
  recallBlocks:   z.array(recallBlockSchema).optional(),
})

recallBlockSchema = z.object({
  id:       z.string(),
  question: z.string(),
  answer:   z.string(),
  position: z.number(),
})
```

---

## 更新召回块

**API**：`POST /api/article-cards/[id]/recall-blocks`

允许在文章创建后单独更新召回块列表，不影响其他文章字段。

```json
请求体:
{
  "recallBlocks": [
    { "id": "...", "question": "...", "answer": "...", "position": 0 },
    { "id": "...", "question": "...", "answer": "...", "position": 1 }
  ]
}
```

---

## 文章复习流程

**组件**：`/workspace/app/(pages)/review/components/article-review-container.tsx`

**API**：`GET /api/article-review`

### 获取待复习文章

```typescript
// 查询条件
WHERE userId = current_user
AND (
  state = 'NEW'
  OR nextReviewAt <= now()
)
ORDER BY state = 'NEW' DESC, nextReviewAt ASC
LIMIT 100
```

- NEW 状态的文章优先显示
- 超期文章按时间排序

### 文章学习视图

**组件**：`ArticleStudyView`

```
┌─────────────────────────────────────────────┐
│  文章标题                                     │
│  字数: 1200 | 预计 6 分钟                    │
├─────────────────────────────────────────────┤
│                                              │
│  [文章 Markdown 内容渲染]                     │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │ 召回块 1                              │   │
│  │ 问：...                               │   │
│  │ ▶ 点击查看答案                         │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │ 召回块 2                              │   │
│  │ 问：...                               │   │
│  │ 答：[已展开] ...                       │   │
│  └──────────────────────────────────────┘   │
│                                              │
├─────────────────────────────────────────────┤
│  [ 忘了 ] [ 记不清 ] [ 记得 ] [ 完全掌握 ]   │
│                 ▲ 评分后进入下一篇              │
└─────────────────────────────────────────────┘
```

### 学习时间追踪

系统自动追踪用户在每篇文章上花费的时间：
- 进入文章时记录开始时间
- 提交评分时计算 `studyTimeMs`
- 累计更新 `totalStudyTimeMs` 字段

### 文章评分 API

**API**：`POST /api/article-review`

```json
请求体:
{
  "cardId": "...",
  "quality": 4,
  "studyTimeMs": 480000
}
```

**处理逻辑**（与闪卡相同的 SM-2 算法）：
1. 运行 `calculateReview()` 更新间隔/难度系数
2. 累加 `totalStudyTimeMs`
3. 更新 `lastStudyAt`
4. 写入 `ReviewLog`

---

## 文章卡片数据结构（完整）

```typescript
Card (cardType = ARTICLE) {
  // 文章内容
  articleTitle:    string    // 文章标题
  articleContent:  string    // Markdown 格式内容（@db.Text）
  recallBlocks:    Json?     // RecallBlock[] 数组
  wordCount:       number?   // 字数
  readTimeMins:    number?   // 预计学习分钟数

  // 学习统计
  totalStudyTimeMs: number   // 累计学习时长（毫秒）
  lastStudyAt:      DateTime? // 最近学习时间

  // SM-2 字段（与闪卡共用）
  nextReviewAt: DateTime
  interval:     number
  easeFactor:   number
  repetitions:  number
  state:        CardState
}
```

---

## 文章系统 API 汇总

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/article-cards` | 创建文章卡片 |
| GET | `/api/article-cards` | 获取文章列表（分页） |
| GET | `/api/article-cards/[id]` | 获取单篇文章（含召回块） |
| POST | `/api/article-cards/[id]/recall-blocks` | 更新召回块 |
| GET | `/api/article-cards/[id]/recall-blocks` | 获取召回块 |
| GET | `/api/article-review` | 获取待复习文章 |
| POST | `/api/article-review` | 提交文章评分 |
| GET | `/api/article-review/[id]` | 获取单篇待复习文章 |
