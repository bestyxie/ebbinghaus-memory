# 双轨 SM-2 系统实施计划

## 背景

当前系统只有单套 SM-2。`outputRepetitions` 只是一个计数器，用来决定显示哪个输出练习级别（Level 1-4），并没有独立的间隔调度能力。当一张卡片进入"输出阶段"后，它的 `nextReviewAt` 仍然由输入轨道的 SM-2 控制，输出练习只是复习时的"附加动作"。

## 目标

为每张单词卡维护两套独立的 SM-2 状态：

1. **输入轨道（Input Track）**：继续运行原有 SM-2。哪怕卡片进入了输出阶段，输入复习也不停止，只是间隔会随时间自然增长（30、60、90 天…）。
2. **输出轨道（Output Track）**：当输入轨道连续正确 3 次后开启。初始值从 1 天重新开始，确保用户不会因为间隔太长而错过第一次输出练习。

两个轨道各自独立调度，互不干扰。

## 核心概念：ReviewItem

**不再以"卡片"为队列单位，改为以"复习项（ReviewItem）"为单位。**

一张卡片最多产生两个复习项：
- `{ card, mode: 'input' }` → 标准闪卡
- `{ card, mode: 'output' }` → 对应等级的输出练习

```
两轨同时到期：产生 2 个 ReviewItem
只有输入到期：产生 1 个 ReviewItem (mode: 'input')
只有输出到期：产生 1 个 ReviewItem (mode: 'output')
```

两轨同时到期时，input 在前，output 在后（先确认认识这个词，再做输出练习）。

## 用户体验示意

```
今日队列（3 张卡，其中 card-B 两轨都到期）：

[1/4] card-A → input（标准闪卡）
[2/4] card-B → input（标准闪卡）
[3/4] card-B → output Level 2（连词成句）
[4/4] card-C → output Level 1（填空）
```

---

## Phase 1 - 数据库 Schema 变更

在 `Card` 模型中新增 3 个字段：

```prisma
// 输出轨道 SM-2 状态（当 inputRepetitions >= 3 后激活）
outputInterval     Int       @default(0)     // 输出轨道间隔天数
outputEaseFactor   Float     @default(2.5)   // 输出轨道易记因子
outputNextReviewAt DateTime?                  // 输出轨道下次复习时间（null = 未激活）
```

- `outputRepetitions`（已有字段）保留，作为输出轨道的连续正确次数
- `outputNextReviewAt = null` 代表输出轨道尚未开启

运行迁移：`npx prisma migrate dev --name add-output-track-sm2`

---

## Phase 2 - 算法层 (`srs-algorithm.ts`)

复用现有 `calculateReview` 函数，新增常量：

```ts
// 输出轨道激活阈值：输入轨道连续正确 3 次
export const OUTPUT_TRACK_ACTIVATION_THRESHOLD = 3;

// 初始化输出轨道的默认值
export const OUTPUT_TRACK_INITIAL = {
  interval: 1,
  repetitions: 0,
  easeFactor: 2.5,
};
```

---

## Phase 3 - GET `/api/review`

### 查询条件

```ts
where: {
  OR: [
    { nextReviewAt: { lte: new Date() } },
    { outputNextReviewAt: { lte: new Date() } },
  ]
}
```

### 展开为 ReviewItem

```ts
const reviewItems: ReviewItem[] = [];

for (const card of cards) {
  if (card.nextReviewAt <= now) {
    reviewItems.push({ ...card, mode: 'input' });
  }
  if (card.outputNextReviewAt && card.outputNextReviewAt <= now) {
    reviewItems.push({ ...card, mode: 'output' });
  }
}
```

`total` 反映 ReviewItem 数量（不是卡片数量）。

---

## Phase 4 - POST `/api/review`

请求体新增 `mode: 'input' | 'output'` 字段。

### 输入轨道提交（mode: 'input'）

```ts
// 正常运行 SM-2
result = calculateReview({ interval, repetitions, easeFactor, quality });

// 激活检查：首次达到阈值时初始化输出轨道
if (result.repetitions >= OUTPUT_TRACK_ACTIVATION_THRESHOLD && !card.outputNextReviewAt) {
  cardUpdateData.outputInterval = 1;
  cardUpdateData.outputEaseFactor = 2.5;
  cardUpdateData.outputRepetitions = 0;
  cardUpdateData.outputNextReviewAt = tomorrow;
}
```

### 输出轨道提交（mode: 'output'）

```ts
// 只更新输出轨道，输入轨道 nextReviewAt 不动
result = calculateReview({
  interval: card.outputInterval,
  repetitions: card.outputRepetitions,
  easeFactor: card.outputEaseFactor,
  quality,
});

cardUpdateData = {
  outputInterval: result.interval,
  outputRepetitions: result.repetitions,
  outputEaseFactor: result.easeFactor,
  outputNextReviewAt: result.nextReviewDate,
  // nextReviewAt 保持不变
};
```

---

## Phase 5 - 前端

### 类型定义 (`app/lib/types.ts`)

```ts
type ReviewMode = 'input' | 'output';

interface ReviewItem extends Card {
  mode: ReviewMode;
}

interface ReviewSession {
  items: ReviewItem[];   // 原 cards 改为 items
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}
```

### `getOutputLevel()` 职责简化 (`output-exercises.ts`)

去掉"是否应该进入输出模式"的判断，只保留"repetitions → level 映射"：

```ts
// 旧签名
getOutputLevel(repetitions: number, outputRepetitions: number): OutputLevel | null

// 新签名（mode === 'output' 时才调用）
getOutputLevel(outputRepetitions: number): OutputLevel
```

### `flashcard-review-container.tsx`

```ts
const currentItem = session?.items[currentIndex];

// mode 直接决定显示什么
if (currentItem.mode === 'output') {
  const outputLevel = getOutputLevel(currentItem.outputRepetitions ?? 0);
  // 显示输出练习
} else {
  // 显示标准闪卡
}
```

---

## Phase 6 - 数据迁移

对已有数据，在迁移脚本中处理：

1. `repetitions >= 3` 且 `outputNextReviewAt IS NULL` 的卡片 → 初始化输出轨道（设为今天）
2. 已有 `outputRepetitions > 0` 的卡片 → 用 `outputRepetitions` 换算出合理的 `outputInterval` 和 `outputNextReviewAt`

---

## 文件改动清单

| 文件 | 改动内容 |
|------|----------|
| `prisma/schema.prisma` | 新增 `outputInterval`, `outputEaseFactor`, `outputNextReviewAt` |
| `app/lib/srs-algorithm.ts` | 新增 `OUTPUT_TRACK_ACTIVATION_THRESHOLD`, `OUTPUT_TRACK_INITIAL` 常量 |
| `app/lib/types.ts` | 新增 `ReviewMode`, `ReviewItem`；`ReviewSession` 用 `items` 替代 `cards` |
| `app/lib/output-exercises.ts` | 简化 `getOutputLevel()` 签名 |
| `app/api/review/route.ts` | GET：展开逻辑；POST：接收 `mode` 并路由到对应轨道 |
| `app/(pages)/review/components/flashcard-review-container.tsx` | 用 `item.mode` 驱动显示逻辑 |
| `prisma/migrations/` | 新建迁移文件 |
| `prisma/seed.ts` | 已有数据迁移逻辑 |
