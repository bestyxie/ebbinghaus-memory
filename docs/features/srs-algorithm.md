# SM-2 间隔重复算法

## 概述

**SM-2（SuperMemo-2）** 是一种间隔重复调度算法，根据用户的记忆表现动态调整下次复习时间。难的内容频繁复习，熟练的内容间隔拉长，从而最大化记忆效率。

**核心文件**：`/workspace/app/lib/srs-algorithm.ts`

---

## 艾宾浩斯遗忘曲线与间隔重复

```
记忆保留率
100% │ ╲
     │  ╲  ← 新学内容迅速遗忘
 70% │   ──╲
     │      ╲──╲
 40% │           ╲──────╲
     │                    ──────────────
  0% └──────────────────────────────────▶ 时间
         ↑     ↑        ↑               ↑
        第1次  第2次     第3次            第N次复习
        复习   复习      复习

每次在"快要遗忘前"复习，记忆保留率峰值逐渐升高，间隔逐渐拉长
```

---

## 算法输入与输出

### 输入

```typescript
interface ReviewInput {
  interval:    number;  // 当前间隔（天数）
  repetitions: number;  // 连续答对次数
  easeFactor:  number;  // 难度系数（默认 2.5）
  quality:     number;  // 用户评分（0-5）
}
```

### 输出

```typescript
interface ReviewOutput {
  interval:       number;  // 新间隔（天数）
  repetitions:    number;  // 新连续答对次数
  easeFactor:     number;  // 更新后的难度系数
  nextReviewDate: Date;    // 下次复习日期
}
```

---

## 评分等级说明

| 评分 | 含义 | 在界面中的映射 |
|------|------|----------------|
| 5 | 完美回忆，毫不费力 | "完全记得" |
| 4 | 正确，稍有迟疑 | "记得" |
| 3 | 答对，但很费力 | "模糊记得" |
| 2 | 差点想起，但最终失败 | "记不清" |
| 1 | 完全忘记 | "忘了" |
| 0 | 完全错误 | （同上） |

> 应用中用户评分范围为 1-5，内部计算时映射到 0-5 的 quality 值。

---

## 算法计算流程

```
输入: interval, repetitions, easeFactor, quality
          │
          ▼
   quality >= 3 ?
    ┌──────┴──────┐
   是              否
    │              │
    ▼              ▼
 答对处理         答错处理
    │              │
    ▼              ▼
repetitions == 0? repetitions = 0
    │              interval = 1
   是    否
    │     │
    ▼     ▼
  i=1   repetitions == 1?
          │
         是    否
          │     │
          ▼     ▼
         i=6  i = round(interval × easeFactor)
          │
    repetitions++
          │
          ▼
  更新 EaseFactor:
  ef = ef + (0.1 - (5-q)×(0.08 + (5-q)×0.02))
  ef = max(1.3, ef)
          │
          ▼
  nextReviewDate = today + interval days
          │
          ▼
  返回新的 interval, repetitions, easeFactor, nextReviewDate
```

---

## 间隔计算规则详解

### 答对时（quality >= 3）

| 复习次数 | 间隔计算 | 示例结果 |
|----------|----------|----------|
| 第 1 次 | 固定 = 1 天 | 明天复习 |
| 第 2 次 | 固定 = 6 天 | 6 天后复习 |
| 第 3 次及以后 | `上次间隔 × easeFactor` | 取决于难度系数 |

### 答错时（quality < 3）

- `repetitions` 归零，重新从第 1 次开始计算
- 间隔固定为 1 天（明天重新复习）
- `easeFactor` 大幅降低（卡片变"难"）

---

## Ease Factor（难度系数）更新公式

```
新 easeFactor = 旧 easeFactor + (0.1 - (5 - quality) × (0.08 + (5 - quality) × 0.02))
```

**最小值限制**：`easeFactor >= 1.3`（防止间隔增长过慢）

### 各评分对应的变化量

| quality | 变化量 | 效果 |
|---------|--------|------|
| 5 | +0.10 | 卡片变"容易"，间隔增长更快 |
| 4 | +0.04 | 轻微变容易 |
| 3 | -0.02（几乎不变） | 基本保持 |
| 2 | -0.16 | 卡片变难 |
| 1 | -0.32 | 卡片明显变难 |
| 0 | -0.50 | 卡片极难，间隔几乎不增长 |

---

## 具体案例演示

### 案例 1：新卡片，顺利掌握

```
初始状态: interval=0, repetitions=0, easeFactor=2.5

第1次复习 (quality=4):
  interval    = 1
  repetitions = 1
  easeFactor  = 2.54
  nextReview  = 明天

第2次复习 (quality=5):
  interval    = 6
  repetitions = 2
  easeFactor  = 2.64
  nextReview  = 6天后

第3次复习 (quality=4):
  interval    = round(6 × 2.64) = 16天
  repetitions = 3
  easeFactor  = 2.68
  nextReview  = 16天后

第4次复习 (quality=4):
  interval    = round(16 × 2.68) = 43天
  repetitions = 4
  easeFactor  = 2.72
  nextReview  = 43天后
```

### 案例 2：困难卡片，多次遗忘

```
初始: interval=6, repetitions=2, easeFactor=2.5

复习时忘了 (quality=1):
  interval    = 1         ← 重置
  repetitions = 0         ← 重置
  easeFactor  = 2.18      ← 大幅下降
  nextReview  = 明天

重新学 (quality=3):
  interval    = 1
  repetitions = 1
  easeFactor  = 2.16
  nextReview  = 明天 (间隔很短，因为ef低)

再次复习 (quality=4):
  interval    = 6
  repetitions = 2
  easeFactor  = 2.20
  nextReview  = 6天后（回到正轨，但ef比之前低）
```

---

## 卡片状态（CardState）

卡片状态根据复习结果自动流转：

```
      ┌─────────────────────────────────────────┐
      │                                         │
      ▼                                         │
  ┌───────┐  首次复习  ┌──────────┐             │
  │  NEW  │ ─────────▶ │ LEARNING │             │
  └───────┘            └──────────┘             │
                            │                   │
                     interval >= 6              │
                            │                   │
                            ▼                   │
                       ┌────────┐               │
                       │ REVIEW │               │
                       └────────┘               │
                            │                   │
                      quality < 3               │
                            │                   │
                            ▼                   │
                      ┌───────────┐  quality≥3  │
                      │RELEARNING │ ────────────┘
                      └───────────┘
```

| 状态 | 说明 | 典型间隔 |
|------|------|----------|
| NEW | 从未复习过 | - |
| LEARNING | 初次学习阶段 | 1-6 天 |
| REVIEW | 正常间隔复习 | 6 天以上 |
| RELEARNING | 忘记后重新学习 | 1 天起 |

---

## 初始 Ease Factor（创建卡片时）

用户创建卡片时选择初始难度，映射到 easeFactor：

| 难度选择 | quality 值 | 初始 easeFactor |
|----------|------------|-----------------|
| ⭐⭐⭐ 较难 | 3 | 2.36 |
| ⭐⭐⭐⭐ 普通 | 4 | 2.50（默认） |
| ⭐⭐⭐⭐⭐ 容易 | 5 | 2.60 |

**计算函数**：`calculateInitialEaseFactor()` in `/workspace/app/lib/zod.ts`

---

## 每日到期判断

```typescript
// 查询今日待复习卡片
await prisma.card.findMany({
  where: {
    userId,
    nextReviewAt: { lte: new Date() }  // 过了到期时间
  }
});
```

卡片的 `nextReviewAt` 字段由算法设置，一旦当前时间超过该值，卡片进入"待复习"队列。
