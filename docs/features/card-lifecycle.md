# 卡片流转流程

## 概述

本文档详细描述了卡片从创建到复习、再到长期记忆管理的完整生命周期流转。Ebbinghaus Memory 应用支持两种卡片类型：闪卡（Flashcard）和文章（Article），每种类型都有其独特的复习流程。

---

## 卡片类型与状态

### 卡片类型（CardType）

```typescript
enum CardType {
  FLASHCARD, // 闪卡：正反面问答形式
  ARTICLE, // 文章：包含召回块（Recall Blocks）的长文本
}
```

### 卡片状态（CardState）

```typescript
enum CardState {
  NEW, // 新创建，从未复习过
  LEARNING, // 初次学习中（interval < 6天）
  REVIEW, // 正常间隔复习（interval >= 6天）
  RELEARNING, // 遗忘后重新学习
}
```

---

## 完整流转图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          卡片生命周期流转图                                  │
└─────────────────────────────────────────────────────────────────────────────┘

创建阶段
    │
    ▼
┌──────────────┐
│   创建卡片   │ ◀── 用户通过仪表盘或 API 创建
└──────────────┘
    │
    ├── 初始状态: state = NEW
    ├── 初始间隔: interval = 0
    ├── 初始系数: easeFactor = 2.36/2.50/2.60 (根据难度选择)
    ├── 连续次数: repetitions = 0
    └── 下次复习: nextReviewAt = now() (立即可复习)
    │
    ▼
┌──────────────────────────────────────────────┐
│              进入复习队列                    │
│   (nextReviewAt <= 当前时间)                 │
└──────────────────────────────────────────────┘
    │
    ├───┬────────────────────────────────────────┐
    │   │                                        │
    ▼   ▼                                        ▼
┌──────────────┐                          ┌──────────────┐
│   闪卡复习   │                          │   文章复习   │
│  FLASHCARD   │                          │   ARTICLE    │
└──────────────┘                          └──────────────┘
    │                                           │
    │                                           │
▶ 闪卡复习流程                              ▶ 文章复习流程
    │                                           │
    ▼                                           ▼
┌───────────────────────────────────────────────────────────────┐
│                    评分后更新算法状态                         │
│                                                               │
│  调用 calculateReview({ interval, repetitions,               │
│                         easeFactor, quality })               │
│                                                               │
│  返回: { newInterval, newRepetitions,                        │
│          newEaseFactor, nextReviewDate }                     │
└───────────────────────────────────────────────────────────────┘
    │
    ├─── quality < 3 ──▶ state = RELEARNING, interval = 1
    │
    └─── quality >= 3 ──▶ state = REVIEW, interval 增长
    │
    ▼
┌───────────────────────────────────────────────────────────────┐
│                   输出练习阶段（可选）                        │
│                                                               │
│  Level 1: 填空题 ──▶ 自动判断                                 │
│  Level 2: 连词成句 ──▶ 自动判断                               │
│  Level 3: 中译英 ──▶ AI 评估 + 用户自评                      │
│  Level 4: 情景造句 ──▶ AI 评估 + 用户自评                    │
│                                                               │
│  outputRepetitions: 连续输出正确次数                         │
└───────────────────────────────────────────────────────────────┘
    │
    ▼
┌───────────────────────────────────────────────────────────────┐
│                      记录复习日志                            │
│                                                               │
│  ReviewLog {                                                  │
│    rating, reviewTime, reviewedAt,                           │
│    scheduledDays, elapsedDays,                               │
│    lastEaseFactor, newEaseFactor                             │
│  }                                                            │
│                                                               │
│  OutputPracticeLog { (如果做了输出练习)                      │
│    level, isCorrect, userAnswer,                             │
│    aiVocabScore?, aiGrammarScore?, aiNativeScore?,           │
│    aiFeedback?, aiSuggestedAnswer?                           │
│  }                                                            │
└───────────────────────────────────────────────────────────────┘
    │
    ▼
┌───────────────────────────────────────────────────────────────┐
│                     等待下次复习                              │
│                                                               │
│   卡片进入"休眠"状态，直到 nextReviewAt 到期                  │
│                                                               │
│   间隔增长规律:                                               │
│   - 第1次正确: 1 天                                           │
│   - 第2次正确: 6 天                                           │
│   - 第3次正确: 6 × easeFactor ≈ 15 天                        │
│   - 第4次正确: 15 × easeFactor ≈ 37 天                       │
│   - 以此类推...                                               │
└───────────────────────────────────────────────────────────────┘
    │
    │   当 nextReviewAt 到期时
    ▼
返回复习队列，循环继续
```

---

## 详细流程说明

### 一、卡片创建流程

#### 1.1 创建入口

```
用户操作路径:
┌─────────────────────────────────────────────────────────────┐
│ 仪表盘 → 点击"创建"按钮 → 选择"新建闪卡"或"新建文章"        │
└─────────────────────────────────────────────────────────────┘
```

#### 1.2 闪卡创建

**组件**: `app/(pages)/dashboard/components/create-card-modal.tsx`

**Server Action**: `createCard()` in `app/lib/actions.ts`

**表单字段**:

```typescript
{
  front: string,      // 正面（问题/词语）- 必填
  back: string,       // 背面（答案/解释）- 必填
  note?: string,      // 提示/助记词 - 可选
  quality: number,    // 初始难度 3-5 - 默认 4
  deckId?: string     // 所属牌组 - 可选
}
```

**初始难度映射**:
| 难度选择 | Quality | EaseFactor | 说明 |
|---------|---------|------------|------|
| ⭐⭐⭐ | 3 | 2.36 | 较难内容，频繁复习 |
| ⭐⭐⭐⭐ | 4 | 2.50 | 普通内容（默认） |
| ⭐⭐⭐⭐⭐ | 5 | 2.60 | 容易内容，间隔更快拉长 |

**创建后初始状态**:

```typescript
{
  state: "NEW",
  interval: 0,
  repetitions: 0,
  outputRepetitions: 0,
  nextReviewAt: new Date(),  // 立即可复习
  easeFactor: 2.36 | 2.50 | 2.60
}
```

#### 1.3 文章创建

**API**: `POST /api/articles`

文章卡片包含特殊的召回块（Recall Blocks）结构：

```typescript
{
  articleTitle: string,     // 文章标题
  articleContent: string,   // 文章内容（Markdown）
  recallBlocks: [          // 召回块数组
    {
      id: "rb_xxx",
      question: "SM-2 算法的最小 easeFactor 是多少？",
      answer: "1.3",
      startIndex: 150,     // 在文章中的位置
      endIndex: 180
    }
  ],
  wordCount: number,       // 字数统计
  readTimeMins: number    // 预计阅读时长
}
```

---

### 二、闪卡复习流程

#### 2.1 复习入口

```
URL: /review

Query 参数:
  - type=flashcard: 仅复习闪卡
  - type=article: 仅复习文章
  - 无 type: 先闪卡后文章
  - single=true&id=xxx: 单卡复习模式
```

#### 2.2 卡片加载

**API**: `GET /api/review?cursor=xxx`

**加载策略**: 批量分页，每批 10 张

```typescript
Response {
  cards: Card[],        // 当前批次（最多10张）
  total: number,        // 全部待复习数量
  hasMore: boolean,     // 是否还有更多
  nextCursor: string    // 下一批次游标
}
```

**查询条件**:

```typescript
where: {
  userId,
  cardType: 'FLASHCARD',
  nextReviewAt: { lte: new Date() }  // 到期待复习
}
orderBy: { nextReviewAt: 'asc' }  // 按到期时间排序
```

#### 2.3 评分交互

**组件**: `app/(pages)/review/components/flashcard-review-container.tsx`

```
┌─────────────────────────────────────────────────────────────┐
│                       闪卡复习交互                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 显示卡片正面（问题）                                    │
│     │                                                       │
│     ▼                                                       │
│  2. 用户思考（想起了吗？）                                  │
│     │                                                       │
│     ▼                                                       │
│  3. 点击/空格 翻转卡片                                      │
│     │                                                       │
│     ▼                                                       │
│  4. 显示卡片背面（答案）+ 评分按钮                          │
│     │                                                       │
│     ▼                                                       │
│  5. 用户选择评分 1-4（或键盘 1-4）                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**评分选项**（统一的 4 级评分标准）：

| 按钮 | Emoji | 显示     | Quality | SM-2 效果   | EF 变化 |
| ---- | ----- | -------- | ------- | ----------- | ------- |
| 1    | 😰    | 忘了     | 1       | ❌ 重置 rep | -0.14   |
| 2    | 🤔    | 记不清   | 2       | ❌ 重置 rep | -0.02   |
| 3    | 👍    | 模糊记得 | 3       | ✅ +1 rep   | +0.10   |
| 4    | 😊    | 记得     | 4       | ✅ +1 rep   | +0.18   |

**说明**：

- **Quality ≥ 3**：表示"记住了"，`repetitions` +1，间隔增长
- **Quality < 3**：表示"忘记了"，`repetitions` 重置为 0，从 1 天间隔重新开始
- **EF（EaseFactor）**：难度系数，控制间隔增长速度，范围 [1.3, ∞)

#### 2.4 提交评分

**API**: `POST /api/review`

**请求体**:

```json
{
  "cardId": "clxxx...",
  "quality": 4
}
```

**服务端处理**:

```typescript
// 1. 获取当前卡片状态
const card = await prisma.card.findUnique({ where: { id: cardId } });

// 2. 运行 SM-2 算法
const result = calculateReview({
  interval: card.interval,
  repetitions: card.repetitions,
  easeFactor: card.easeFactor,
  quality: quality,
});

// 3. 事务更新
await prisma.$transaction([
  // 更新卡片
  prisma.card.update({
    where: { id: cardId },
    data: {
      interval: result.interval,
      repetitions: result.repetitions,
      easeFactor: result.easeFactor,
      nextReviewAt: result.nextReviewDate,
      state: quality < 3 ? "RELEARNING" : "REVIEW",
    },
  }),
  // 插入复习日志
  prisma.reviewLog.create({
    data: {
      cardId,
      userId,
      rating: quality,
      reviewTime: 0,
      scheduledDays: card.interval,
      elapsedDays: result.interval,
      lastEaseFactor: card.easeFactor,
      newEaseFactor: result.easeFactor,
    },
  }),
]);
```

---

### 三、文章复习流程

#### 3.1 加载文章

**API**: `GET /api/article-review`

**组件**: `app/(pages)/review/components/article-review-container.tsx`

#### 3.2 学习交互

**组件**: `app/(pages)/review/components/article-study-view.tsx`

```
┌─────────────────────────────────────────────────────────────┐
│                      文章学习交互                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 显示文章标题和内容                                      │
│     │                                                       │
│     ▼                                                       │
│  2. Recall Blocks 部分被遮挡 (显示为 ████)                  │
│     │                                                       │
│     ▼                                                       │
│  3. 用户点击遮挡块，逐步揭示答案                            │
│     │                                                       │
│     ▼                                                       │
│  4. 完成所有召回块后显示评分选项                            │
│     │                                                       │
│     ▼                                                       │
│  5. 用户选择 Hard (2) / Good (3) / Easy (4)                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 3.3 提交评分

**API**: `POST /api/article-review`

**请求体**:

```json
{
  "cardId": "clxxx...",
  "quality": 3,
  "studyTimeMs": 120000
}
```

---

### 四、输出练习流程

**设计理念**：输出练习采用与闪卡**完全一致**的 4 级评分标准，确保：

1. **用户体验一致性**：无论被动识别（闪卡）还是主动产出（输出练习），评分语义完全相同
2. **算法逻辑统一性**：所有 `quality` 值对 SM-2 算法（`repetitions`、`easeFactor`）的影响完全一致
3. **难度匹配性**：输出练习（主动产出）比闪卡更难，因此评分选项应该同样丰富甚至更多细分

#### 4.1 练习触发时机

```
传统评分完成后 ──▶ 自动触发输出练习
```

#### 4.2 练习生成

**API**: `POST /api/output-exercises/generate`

```typescript
Request { cardId: string }

Response {
  exercise: {
    id, cardId,
    targetWord: "ephemeral",
    englishSentence: "The ephemeral beauty of cherry blossoms...",
    chineseSentence: "樱花短暂的美...",
    fillBlankTemplate: "The _____ beauty of...",
    wordList: ["The", "ephemeral", "beauty", "of", ...],
    standardAnswer: "The ephemeral beauty of cherry blossoms...",
    contextPrompt: "描述一个短暂而美好的事物..."
  }
}
```

**生成逻辑**:

- 首先检查是否已有缓存（`OutputExercise` 表）
- 如无缓存，调用智谱 GLM-4 生成
- 生成后缓存，后续直接使用

#### 4.3 四级练习

**组件目录**: `app/(pages)/review/components/exercises/`

| 等级    | 组件                           | 形式     | 评分方式                  |
| ------- | ------------------------------ | -------- | ------------------------- |
| Level 1 | `level1-fill-blanks.tsx`       | 填空题   | 前端自动判断（精确匹配）  |
| Level 2 | `level2-word-scramble.tsx`     | 连词成句 | 前端自动判断（顺序匹配）  |
| Level 3 | `level3-free-translation.tsx`  | 中译英   | AI 评估 + 用户自评（4级） |
| Level 4 | `level4-contextual-prompt.tsx` | 情景造句 | AI 评估 + 用户自评（4级） |

**统一的 4 级评分标准**（所有练习类型保持一致）：

| 按钮 | Emoji | 闪卡显示 | Level 3-4 显示 | Quality | SM-2 效果   | EF 变化 |
| ---- | ----- | -------- | -------------- | ------- | ----------- | ------- |
| 1    | 😰    | 忘了     | 完全不会       | 1       | ❌ 重置 rep | -0.14   |
| 2    | 🤔    | 记不清   | 有难度         | 2       | ❌ 重置 rep | -0.02   |
| 3    | 👍    | 模糊记得 | 基本掌握       | 3       | ✅ +1 rep   | +0.10   |
| 4    | 😊    | 记得     | 完全掌握       | 4       | ✅ +1 rep   | +0.18   |

#### 4.4 AI 评估（Level 3-4）

**API**: `POST /api/output-exercises/evaluate`

```typescript
Request {
  targetWord: string,
  standardAnswer: string,
  userAnswer: string,
  level: 3 | 4
}

Response {
  evaluation: {
    vocabScore: number,      // 词汇使用评分 (0-100)
    grammarScore: number,    // 语法正确性评分 (0-100)
    nativeScore: number,     // 地道表达评分 (0-100)
    feedback: string,        // AI 反馈意见
    suggestedAnswer: string  // 建议答案
  }
}
```

#### 4.5 练习提交

**扩展的** `POST /api/review` **请求体**:

```json
{
  "cardId": "clxxx...",
  "quality": 4,
  "exerciseId": "clyyy...",
  "isOutputCorrect": true,
  "outputLevel": 1,
  "userAnswer": "ephemeral",
  "aiVocabScore": 90,
  "aiGrammarScore": 85,
  "aiNativeScore": 80,
  "aiFeedback": "表达自然，词汇使用准确",
  "aiSuggestedAnswer": "..."
}
```

**outputRepetitions 更新逻辑**:

```typescript
const newOutputRepetitions = isOutputCorrect
  ? (card.outputRepetitions || 0) + 1 // 正确: +1
  : 0; // 错误: 重置为 0
```

**重要：repetitions 与 outputRepetitions 的独立更新**

输出练习提交时，`repetitions` 保持不变，只有 `outputRepetitions` 更新：

```typescript
if (exerciseId && typeof isOutputCorrect === 'boolean') {
  // 输出练习：不更新 repetitions（被动识别能力）
  result = {
    interval: card.interval,        // 保持不变
    repetitions: card.repetitions,  // 保持不变
    easeFactor: efResult.easeFactor, // 根据用户自评更新
    nextReviewDate: card.nextReviewAt, // 保持不变
  };
} else {
  // 闪卡评分：正常更新所有字段
  result = calculateReview({...});
}
```

---

### 五、核心字段转换关系详解

#### 5.1 字段定义与职责

| 字段                | 类型  | 默认值 | 职责                       | 更新时机                    |
| ------------------- | ----- | ------ | -------------------------- | --------------------------- |
| `easeFactor`        | Float | 2.5    | 难度系数，控制间隔增长速度 | 每次评分后（闪卡+输出练习） |
| `repetitions`       | Int   | 0      | 被动识别连续正确次数       | **仅在闪卡评分时**          |
| `outputRepetitions` | Int   | 0      | 输出练习连续正确次数       | **仅在输出练习时**          |
| `quality`           | Int   | -      | 用户评分（1-4）            | 用户操作                    |
| `interval`          | Int   | 0      | 当前复习间隔（天）         | **仅在闪卡评分时**          |

#### 5.2 Quality（评分）对 EaseFactor 的影响

**公式**：

```typescript
newEaseFactor = oldEaseFactor + (0.1 - (5 - quality) × (0.08 + (5 - quality) × 0.02))
```

**Quality 对 EaseFactor 的影响值**：

| Quality | 显示     | EF 变化      | 说明                   |
| ------- | -------- | ------------ | ---------------------- |
| 1       | 忘了     | -0.14 - 0.16 | 大幅降低，间隔增长变慢 |
| 2       | 记不清   | -0.02        | 略微降低               |
| 3       | 模糊记得 | +0.10        | 标准增长               |
| 4       | 记得     | +0.18        | 较快增长               |

**EF 下限保护**：`easeFactor` 永远不会低于 **1.3**

#### 5.3 Repetitions（被动识别）更新规则

```typescript
if (quality >= 3) {
  // 记住了：连续正确次数 +1
  repetitions += 1;
} else {
  // 忘记了：重置为 0
  repetitions = 0;
}
```

#### 5.4 OutputRepetitions（主动产出）更新规则

```typescript
if (isOutputCorrect) {
  // 输出练习正确：连续 +1
  outputRepetitions += 1;
} else {
  // 输出练习错误：重置为 0
  outputRepetitions = 0;
}
```

**关键区别**：

- `repetitions` 由 **闪卡评分 quality ≥ 3** 触发（被动识别能力）
  - **只在闪卡评分时更新**，输出练习不影响此值
- `outputRepetitions` 由 **输出练习 isOutputCorrect = true** 触发（主动产出能力）
  - **只在输出练习时更新**，闪卡评分不影响此值
- 两者**完全独立计数**，互不影响

**为什么独立？**

- 被动识别（看到认识）≠ 主动产出（能用出来）
- 一个人可能"认识"很多词，但只能"使用"其中一部分
- 系统需要分别追踪这两种能力，给出合适的难度和间隔

#### 5.5 Interval（间隔）计算规则

```typescript
if (quality >= 3) {
  if (repetitions === 0) {
    interval = 1;      // 第一次正确：1天
  } else if (repetitions === 1) {
    interval = 6;      // 第二次正确：6天
  } else {
    interval = Math.round(interval × easeFactor);  // 之后：× EF
  }
} else {
  // 忘记了
  repetitions = 0;
  interval = 1;        // 明天必须复习
}
```

#### 5.6 输出练习的特殊处理

**为什么输出练习的自评不影响 `repetitions`？**

设计理念：

1. **能力独立性**：
   - 被动识别（闪卡翻转）：看到认识 → 更新 `repetitions`
   - 主动产出（输出练习）：能用出来 → 更新 `outputRepetitions`
   - 两者是**不同的能力维度**，应独立追踪

2. **间隔计算逻辑**：
   - 复习间隔由 `repetitions` 决定（基于被动识别能力）
   - 输出练习级别由 `outputRepetitions` 决定（基于主动产出能力）
   - 这样可以避免："能用出来"推高复习间隔，导致"认识"的词也复习间隔过长

3. **EaseFactor 的更新**：
   - 输出练习的自评 `quality` **仍然会影响 `easeFactor`**
   - 因为主观自评反映了整体掌握程度，应该调整卡片难度
   - 但不会改变 `repetitions` 或 `interval`

**代码实现**：

```typescript
if (exerciseId && typeof isOutputCorrect === "boolean") {
  // 输出练习：保持 repetitions 和 interval 不变
  result = {
    interval: card.interval, // ← 不变
    repetitions: card.repetitions, // ← 不变
    easeFactor: efResult.easeFactor, // ← 根据自评更新
    nextReviewDate: card.nextReviewAt, // ← 不变
  };
}
```

```typescript
if (quality >= 3) {
  if (repetitions === 0) {
    interval = 1;      // 第一次正确：1天
  } else if (repetitions === 1) {
    interval = 6;      // 第二次正确：6天
  } else {
    interval = Math.round(interval × easeFactor);  // 之后：× EF
  }
} else {
  // 忘记了
  repetitions = 0;
  interval = 1;        // 明天必须复习
}
```

---

### 六、完整场景示例

#### 场景一：理想学习路径（持续记得）

**初始状态**（创建卡片，选择难度 ⭐⭐⭐⭐）：

```typescript
{
  state: "NEW",
  interval: 0,
  repetitions: 0,
  outputRepetitions: 0,
  easeFactor: 2.50
}
```

**复习历程**：

| 日期   | Quality  | 计算                                       | 结果状态                       |
| ------ | -------- | ------------------------------------------ | ------------------------------ |
| Day 0  | -        | 创建                                       | `interval=0, EF=2.50, rep=0`   |
| Day 1  | 4 (记得) | `rep=0→1, interval=0→1, EF=2.50+0.18=2.68` | `interval=1, rep=1, EF=2.68`   |
| Day 7  | 4 (记得) | `rep=1→2, interval=1→6, EF=2.68+0.18=2.86` | `interval=6, rep=2, EF=2.86`   |
| Day 13 | 4 (记得) | `rep=2→3, interval=6×2.86≈17, EF=3.04`     | `interval=17, rep=3, EF=3.04`  |
| Day 30 | 4 (记得) | `rep=3→4, interval=17×3.04≈52, EF=3.22`    | `interval=52, rep=4, EF=3.22`  |
| Day 82 | 4 (记得) | `rep=4→5, interval=52×3.22≈167, EF=3.40`   | `interval=167, rep=5, EF=3.40` |

**输出练习配合**（假设每次都做输出练习）：

| 日期   | 输出级别 | 是否正确 | outputRepetitions |
| ------ | -------- | -------- | ----------------- |
| Day 1  | Level 1  | ✅       | 0→1               |
| Day 7  | Level 2  | ✅       | 1→2               |
| Day 13 | Level 3  | ✅       | 2→3               |
| Day 30 | Level 4  | ✅       | 3→4               |
| Day 82 | Level 4  | ✅       | 4→5               |

**特点**：

- EF 持续上升（2.50 → 3.40）
  - 闪卡评分（quality=4）和输出练习自评（quality=4）都会提升 EF
- 间隔快速增长（1天 → 167天）
  - 间隔只由 `repetitions` 决定，而 `repetitions` 只在闪卡评分时更新
- 连续正确，没有中断
- **输出练习不影响 `repetitions`**，只影响 `outputRepetitions` 和 `easeFactor`

---

#### 场景二：遗忘后重新学习

**初始状态**：

```typescript
{
  state: "REVIEW",
  interval: 52,
  repetitions: 4,
  outputRepetitions: 3,
  easeFactor: 3.04
}
```

**复习历程**：

| 日期   | Quality  | 计算                                       | 结果状态                                       |
| ------ | -------- | ------------------------------------------ | ---------------------------------------------- |
| Day 0  | -        | 当前状态                                   | `interval=52, rep=4, EF=3.04, outputRep=3`     |
| Day 52 | 1 (忘了) | `rep=4→0, interval=1, EF=3.04-0.16=2.88`   | `state=RELEARNING, interval=1, rep=0, EF=2.88` |
| Day 53 | 3 (模糊) | `rep=0→1, interval=0→1, EF=2.88+0.10=2.98` | `state=LEARNING, interval=1, rep=1, EF=2.98`   |
| Day 54 | 4 (记得) | `rep=1→2, interval=1→6, EF=2.98+0.18=3.16` | `interval=6, rep=2, EF=3.16`                   |
| Day 60 | 4 (记得) | `rep=2→3, interval=6×3.16≈19, EF=3.34`     | `interval=19, rep=3, EF=3.34`                  |

**输出练习影响**：

| 日期   | 输出级别 | 是否正确 | outputRepetitions |
| ------ | -------- | -------- | ----------------- |
| Day 52 | Level 4  | ❌       | 3→0（重置）       |
| Day 53 | Level 1  | ✅       | 0→1               |
| Day 54 | Level 1  | ✅       | 1→2               |
| Day 60 | Level 2  | ✅       | 2→3               |

**特点**：

- 一次遗忘导致 `repetitions` 归零
- EF 略微下降但保护在 1.3 以上
- `outputRepetitions` 独立重置
- 需要重新累积连续正确次数

---

#### 场景三：波动式学习（时好时坏）

**初始状态**：

```typescript
{
  state: "NEW",
  interval: 0,
  repetitions: 0,
  easeFactor: 2.50
}
```

**复习历程**：

| 日期   | Quality    | 计算                                   | 结果状态                                       |
| ------ | ---------- | -------------------------------------- | ---------------------------------------------- |
| Day 0  | -          | 创建                                   | `interval=0, rep=0, EF=2.50`                   |
| Day 1  | 4 (记得)   | `rep=0→1, interval=1, EF=2.68`         | `interval=1, rep=1, EF=2.68`                   |
| Day 7  | 2 (记不清) | `rep=1→0, interval=1, EF=2.66`         | `state=RELEARNING, interval=1, rep=0, EF=2.66` |
| Day 8  | 3 (模糊)   | `rep=0→1, interval=1, EF=2.76`         | `state=LEARNING, interval=1, rep=1, EF=2.76`   |
| Day 9  | 4 (记得)   | `rep=1→2, interval=6, EF=2.94`         | `interval=6, rep=2, EF=2.94`                   |
| Day 15 | 1 (忘了)   | `rep=2→0, interval=1, EF=2.78`         | `state=RELEARNING, interval=1, rep=0, EF=2.78` |
| Day 16 | 4 (记得)   | `rep=0→1, interval=1, EF=2.96`         | `interval=1, rep=1, EF=2.96`                   |
| Day 17 | 4 (记得)   | `rep=1→2, interval=6, EF=3.14`         | `interval=6, rep=2, EF=3.14`                   |
| Day 23 | 4 (记得)   | `rep=2→3, interval=6×3.14≈19, EF=3.32` | `interval=19, rep=3, EF=3.32`                  |

**特点**：

- EF 波动上升（2.50 → 3.32）
- 多次遗忘导致进度反复
- 每次遗忘后都从 interval=1 重新开始
- 最终还是进入长期记忆

---

#### 场景四：高难度卡片（持续困难）

**初始状态**（创建卡片，选择难度 ⭐⭐⭐）：

```typescript
{
  state: "NEW",
  interval: 0,
  repetitions: 0,
  easeFactor: 2.36  // 较低的初始值
}
```

**复习历程**：

| 日期   | Quality    | 计算                                   | 结果状态                                       |
| ------ | ---------- | -------------------------------------- | ---------------------------------------------- |
| Day 0  | -          | 创建                                   | `interval=0, rep=0, EF=2.36`                   |
| Day 1  | 3 (模糊)   | `rep=0→1, interval=1, EF=2.46`         | `interval=1, rep=1, EF=2.46`                   |
| Day 7  | 2 (记不清) | `rep=1→0, interval=1, EF=2.44`         | `state=RELEARNING, interval=1, rep=0, EF=2.44` |
| Day 8  | 3 (模糊)   | `rep=0→1, interval=1, EF=2.54`         | `interval=1, rep=1, EF=2.54`                   |
| Day 9  | 3 (模糊)   | `rep=1→2, interval=6, EF=2.64`         | `interval=6, rep=2, EF=2.64`                   |
| Day 15 | 3 (模糊)   | `rep=2→3, interval=6×2.64≈16, EF=2.74` | `interval=16, rep=3, EF=2.74`                  |
| Day 31 | 2 (记不清) | `rep=3→0, interval=1, EF=2.72`         | `state=RELEARNING, interval=1, rep=0, EF=2.72` |
| Day 32 | 3 (模糊)   | `rep=0→1, interval=1, EF=2.82`         | `interval=1, rep=1, EF=2.82`                   |

**输出练习配合**（多次失败）：

| 日期   | 输出级别 | 是否正确 | outputRepetitions |
| ------ | -------- | -------- | ----------------- |
| Day 1  | Level 1  | ✅       | 0→1               |
| Day 7  | Level 1  | ❌       | 1→0（重置）       |
| Day 8  | Level 1  | ✅       | 0→1               |
| Day 9  | Level 2  | ❌       | 1→0（重置）       |
| Day 15 | Level 2  | ✅       | 0→1               |
| Day 31 | Level 2  | ❌       | 1→0（重置）       |
| Day 32 | Level 1  | ✅       | 0→1               |

**特点**：

- EF 增长缓慢（2.36 → 2.82）
- 间隔增长受限，频繁复习
- 输出练习反复失败，始终停留在低级别
- 系统自动识别为"困难卡片"

---

#### 场景五：简单卡片（快速进阶）

**初始状态**（创建卡片，选择难度 ⭐⭐⭐⭐⭐）：

```typescript
{
  state: "NEW",
  interval: 0,
  repetitions: 0,
  easeFactor: 2.60  // 较高的初始值
}
```

**复习历程**：

| 日期    | Quality  | 计算                                      | 结果状态                       |
| ------- | -------- | ----------------------------------------- | ------------------------------ |
| Day 0   | -        | 创建                                      | `interval=0, rep=0, EF=2.60`   |
| Day 1   | 4 (记得) | `rep=0→1, interval=1, EF=2.78`            | `interval=1, rep=1, EF=2.78`   |
| Day 7   | 4 (记得) | `rep=1→2, interval=6, EF=2.96`            | `interval=6, rep=2, EF=2.96`   |
| Day 13  | 4 (记得) | `rep=2→3, interval=6×2.96≈18, EF=3.14`    | `interval=18, rep=3, EF=3.14`  |
| Day 31  | 4 (记得) | `rep=3→4, interval=18×3.14≈57, EF=3.32`   | `interval=57, rep=4, EF=3.32`  |
| Day 88  | 4 (记得) | `rep=4→5, interval=57×3.32≈189, EF=3.50`  | `interval=189, rep=5, EF=3.50` |
| Day 277 | 4 (记得) | `rep=5→6, interval=189×3.50≈662, EF=3.68` | `interval=662, rep=6, EF=3.68` |

**输出练习配合**（快速通关）：

| 日期    | 输出级别 | 是否正确 | outputRepetitions |
| ------- | -------- | -------- | ----------------- |
| Day 1   | Level 1  | ✅       | 0→1               |
| Day 7   | Level 2  | ✅       | 1→2               |
| Day 13  | Level 3  | ✅       | 2→3               |
| Day 31  | Level 4  | ✅       | 3→4               |
| Day 88  | Level 4  | ✅       | 4→5               |
| Day 277 | Level 4  | ✅       | 5→6               |

**特点**：

- EF 快速上升（2.60 → 3.68）
- 间隔爆炸式增长（1天 → 662天 ≈ 1.8年）
- 输出练习快速达到最高级别
- 系统识别为"简单卡片"，长期记忆稳定

---

### 七、输出练习级别判定规则

#### 7.1 级别映射逻辑

**函数**：`getOutputLevel(repetitions, outputRepetitions)`

**规则**：

| Repetitions | OutputRepetitions | 显示级别    | 说明                       |
| ----------- | ----------------- | ----------- | -------------------------- |
| 0           | 0                 | **无**      | 新卡片，不显示输出练习     |
| 1           | 0                 | **Level 1** | 第一次复习后，开始填空练习 |
| 2+          | 0                 | **Level 1** | 尚未掌握填空               |
| 1+          | 1                 | **Level 2** | 填空连续正确，升级连词     |
| 1+          | 2                 | **Level 3** | 连词连续正确，升级翻译     |
| 1+          | 3+                | **Level 4** | 翻译连续正确，最高级别     |

**代码实现**：

```typescript
function getOutputLevel(
  repetitions: number,
  outputRepetitions: number,
): OutputLevel | null {
  if (repetitions === 0) return null; // 新卡片
  if (outputRepetitions === 0) return 1; // 填空
  if (outputRepetitions === 1) return 2; // 连词
  if (outputRepetitions === 2) return 3; // 翻译
  return 4; // 情景造句（最高级）
}
```

#### 7.2 降级规则

当输出练习**答错**时，`outputRepetitions` 重置为 0，级别降回 **Level 1**：

```typescript
// Level 4 答错
outputRepetitions: 3 → 0
级别: Level 4 → Level 1

// Level 3 答错
outputRepetitions: 2 → 0
级别: Level 3 → Level 1
```

**设计理念**：输出练习比被动识别更难，需要更高的连续正确标准才能进阶。

---

### 八、SM-2 算法详解

#### 8.1 算法逻辑

**文件**: `app/lib/srs-algorithm.ts`

```typescript
function calculateReview(input: ReviewInput): ReviewOutput {
  const { quality } = input;
  let { interval, repetitions, easeFactor } = input;

  // === 1. 评分逻辑处理 ===
  if (quality >= 3) {
    // 记住了
    if (repetitions === 0) {
      interval = 1; // 第一次: 1 天
    } else if (repetitions === 1) {
      interval = 6; // 第二次: 6 天
    } else {
      interval = Math.round(interval * easeFactor); // 之后: × EF
    }
    repetitions += 1;
  } else {
    // 忘记了
    repetitions = 0;
    interval = 1; // 明天必须复习
  }

  // === 2. 更新易记因子 ===
  easeFactor =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  // === 3. 计算下次复习日期 ===
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return { interval, repetitions, easeFactor, nextReviewDate };
}
```

#### 8.2 间隔增长示例（简化版）

假设 `easeFactor = 2.5`，每次评分都是 4（记得）：

| 次数  | Quality | Interval | 下次复习间隔 |
| ----- | ------- | -------- | ------------ |
| 创建  | -       | 0        | 立即         |
| 第1次 | 4       | 0→1      | 1 天后       |
| 第2次 | 4       | 1→6      | 6 天后       |
| 第3次 | 4       | 6→15     | 15 天后      |
| 第4次 | 4       | 15→37    | 37 天后      |
| 第5次 | 4       | 37→92    | 92 天后      |
| 第6次 | 4       | 92→230   | 230 天后     |

#### 8.3 状态转换规则

```typescript
// 评分后状态更新
if (quality < 3) {
  state = "RELEARNING"; // 遗忘，重新学习
} else if (interval < 6) {
  state = "LEARNING"; // 初次学习阶段
} else {
  state = "REVIEW"; // 正常复习阶段
}
```

---

### 九、数据流转与持久化

#### 9.1 数据库事务保证

以下操作使用事务保证原子性：

```typescript
// 复习提交
prisma.$transaction([
  prisma.card.update({ ... }),         // 更新卡片
  prisma.reviewLog.create({ ... }),    // 插入复习日志
  prisma.outputPracticeLog.create({ ... }) // 插入练习日志（可选）
]);
```

#### 9.2 复习日志（ReviewLog）

记录每次复习的完整快照：

```typescript
ReviewLog {
  id: string
  rating: number              // 用户评分 1-5
  reviewTime: number          // 思考时间（毫秒）
  reviewedAt: DateTime

  // 算法快照
  scheduledDays: number       // 计划间隔天数
  elapsedDays: number         // 实际间隔天数
  lastEaseFactor: number      // 复习前的 EF
  newEaseFactor: number       // 复习后的 EF

  cardId: string
  userId: string
}
```

#### 9.3 输出练习日志（OutputPracticeLog）

记录输出练习的历史：

```typescript
OutputPracticeLog {
  id: string
  cardId: string
  exerciseId: string
  userId: string
  level: number                // 1-4
  isCorrect: boolean
  userAnswer: string

  // AI 反馈（Level 3-4）
  aiVocabScore?: number
  aiGrammarScore?: number
  aiNativeScore?: number
  aiFeedback?: string
  aiSuggestedAnswer?: string

  practicedAt: DateTime
}
```

---

### 十、查询与统计

#### 10.1 获取今日待复习卡片

```typescript
const dueCards = await prisma.card.findMany({
  where: {
    userId,
    nextReviewAt: { lte: new Date() },
  },
  include: {
    cardDecks: {
      include: { deck: { select: { id, title, color } } },
    },
  },
  orderBy: { nextReviewAt: "asc" },
  take: 10,
});
```

#### 10.2 计算保留率

```typescript
const [total, successful] = await Promise.all([
  prisma.reviewLog.count({ where: { userId } }),
  prisma.reviewLog.count({ where: { userId, rating: { gte: 3 } } }),
]);

const retentionRate = total > 0 ? Math.round((successful / total) * 100) : 0;
```

---

### 十一、边界情况处理

#### 11.1 无待复习卡片

```
情况 1: 无待复习闪卡
  → 显示 "今日闪卡已复习完毕"

情况 2: 无待复习文章
  → 显示 "无待复习文章"

情况 3: 两者均无
  → 显示完成页面，建议创建新卡片
```

#### 11.2 单卡复习模式

```
URL: /review?single=true&id=<cardId>&type=flashcard

特点:
- 仅加载指定卡片
- 评分后显示"已完成"
- 不自动进入下一张
- 2 秒后自动跳转回仪表盘
```

#### 11.3 遗忘后的重学习

```
当 quality < 3 时:
  - repetitions 重置为 0
  - interval 重置为 1
  - state 变为 RELEARNING
  - easeFactor 可能降低（但不会低于 1.3）
  - 第二天必须再次复习
```

---

## 快速参考

### 核心设计原则

**repetitions 与 outputRepetitions 的独立性**：

| 字段                | 测试能力             | 更新时机   | 影响的间隔计算   |
| ------------------- | -------------------- | ---------- | ---------------- |
| `repetitions`       | 被动识别（看到认识） | 仅闪卡评分 | 决定下次复习间隔 |
| `outputRepetitions` | 主动产出（能用出来） | 仅输出练习 | 决定输出练习级别 |

**关键点**：

- 输出练习提交时，`repetitions` 保持不变
- 输出练习的 `quality` 自评只影响 `easeFactor`，不影响 `repetitions` 或 `interval`
- 这确保了被动识别和主动产出的能力被**独立追踪**

### 评分标准速查表

**统一的 4 级评分**（适用于闪卡、Level 3-4 输出练习）：

| 按钮 | Emoji | 文案              | Quality | 记忆效果 | repetitions | easeFactor |
| ---- | ----- | ----------------- | ------- | -------- | ----------- | ---------- |
| 1    | 😰    | 忘了/完全不会     | 1       | ❌ 忘记  | 重置为 0    | -0.14      |
| 2    | 🤔    | 记不清/有难度     | 2       | ❌ 忘记  | 重置为 0    | -0.02      |
| 3    | 👍    | 模糊记得/基本掌握 | 3       | ✅ 记住  | +1          | +0.10      |
| 4    | 😊    | 记得/完全掌握     | 4       | ✅ 记住  | +1          | +0.18      |

**自动判断**（Level 1-2 输出练习）：

- ✅ 正确：`isOutputCorrect = true` → `outputRepetitions` +1
- ❌ 错误：`isOutputCorrect = false` → `outputRepetitions` 重置为 0

### API 端点汇总

| 端点                             | 方法   | 用途                   |
| -------------------------------- | ------ | ---------------------- |
| `/api/review`                    | GET    | 获取待复习闪卡（批量） |
| `/api/review`                    | POST   | 提交闪卡评分           |
| `/api/article-review`            | GET    | 获取待复习文章         |
| `/api/article-review`            | POST   | 提交文章评分           |
| `/api/cards/[id]`                | DELETE | 删除卡片               |
| `/api/output-exercises/generate` | POST   | 生成/获取输出练习      |
| `/api/output-exercises/evaluate` | POST   | AI 评估自由作答        |

### 关键文件位置

| 功能           | 文件路径                                                       |
| -------------- | -------------------------------------------------------------- |
| SM-2 算法      | `app/lib/srs-algorithm.ts`                                     |
| 复习 API       | `app/api/review/route.ts`                                      |
| 闪卡组件       | `app/(pages)/review/components/flashcard-review-container.tsx` |
| 文章组件       | `app/(pages)/review/components/article-review-container.tsx`   |
| 输出练习       | `app/(pages)/review/components/exercises/`                     |
| Server Actions | `app/lib/actions.ts`                                           |

---

## 总结

卡片流转的核心是一个由 **SM-2 算法驱动的循环系统**：

1. **创建** → 初始化状态为 NEW，立即可复习
2. **复习** → 根据用户评分更新间隔和易记因子
3. **休眠** → 等待下次复习时间到期
4. **重复** → 返回步骤 2

输出练习系统作为传统复习的补充，通过**主动产出**强化记忆，追踪独立的 `outputRepetitions` 计数。

整个流程由数据库事务保证一致性，所有历史数据都通过日志记录，便于分析和追溯。
