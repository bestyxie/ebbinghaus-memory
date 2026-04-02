# 复习系统

## 概述

复习系统是应用的核心功能，实现了基于 SM-2 算法的间隔复习流程。支持闪卡复习和文章复习两种模式，可以混合或单独进行。

---

## 复习页面入口

**路由**：`/review`

**支持的 Query 参数**：

| 参数 | 值 | 说明 |
|------|----|------|
| `type` | `flashcard` | 仅复习闪卡 |
| `type` | `article` | 仅复习文章 |
| _(无 type)_ | - | 先闪卡后文章 |
| `single` | `true` | 单卡复习模式 |
| `id` | 卡片ID | 配合 single 使用 |

---

## 整体复习流程

```
进入 /review
      │
      ▼
加载复习数据
      │
      ├── type=flashcard ──▶ 仅加载闪卡
      │
      ├── type=article ───▶ 仅加载文章
      │
      └── 无 type ────────▶ 先加载闪卡，完成后自动切换到文章
                                │
              ┌─────────────────┴──────────────────┐
              ▼                                     ▼
      闪卡复习阶段                           文章复习阶段
  FlashcardReviewContainer            ArticleReviewContainer
              │                                     │
              ▼                                     ▼
       全部完成时                             全部完成时
     自动切换到文章 ──▶                      显示完成界面
```

---

## 闪卡复习流程

**组件**：`/workspace/app/(pages)/review/components/flashcard-review-container.tsx`

### 数据加载

采用**批量分页加载**策略（每批 10 张），避免一次性加载过多卡片：

```
GET /api/review?cursor=xxx
      │
      ▼
返回: {
  cards: Card[],      // 当前批次（最多10张）
  total: number,      // 全部待复习数量
  hasMore: boolean,   // 是否还有更多
  nextCursor: string  // 下一批次游标
}
      │
      ▼
加入复习队列
接近队列末尾时自动加载下一批
```

### 复习交互流程

```
显示卡片正面
      │
      ▼
用户思考（想起了吗？）
      │
      ▼
点击/空格翻转卡片
      │
      ▼
显示卡片背面 + 评分按钮
      │
      ▼
用户选择评分 1-4（或键盘 1-4）
      │
      ├── 1 = 完全忘记
      ├── 2 = 记不清
      ├── 3 = 模糊记得
      └── 4 = 记得
              │
              ▼
POST /api/review { cardId, quality }
              │
              ▼
服务端运行 SM-2 算法
更新卡片 interval / easeFactor / nextReviewAt
写入 ReviewLog
              │
              ▼
前端进入下一张卡片
              │
              ▼
所有卡片完成 ──▶ 自动切换到文章复习（如适用）
```

### 键盘快捷键

| 键 | 功能 |
|----|------|
| `空格` 或 `Enter` | 翻转卡片 |
| `1` | 评分 1（完全忘记） |
| `2` | 评分 2（记不清） |
| `3` | 评分 3（模糊记得） |
| `4` | 评分 4（记得） |

### 进度显示

```
组件: ProgressBar

普通模式: "第 N 张 / 共 M 张"
单卡模式: 显示单卡评分界面，完成后显示结果
```

---

## 评分 API

### POST /api/review

**请求体**：
```json
{
  "cardId": "clxxx...",
  "quality": 4
}
```

**服务端处理**：

```
接收请求
      │
      ▼
requireAuth() 验证身份
      │
      ▼
查询卡片（验证属于当前用户）
      │
      ▼
调用 calculateReview(card, quality)
      │
      ▼
数据库事务:
  ┌─────────────────────────────────────┐
  │  UPDATE card SET                    │
  │    interval     = newInterval,      │
  │    repetitions  = newRepetitions,   │
  │    easeFactor   = newEaseFactor,    │
  │    nextReviewAt = nextReviewDate,   │
  │    state        = newState          │
  │                                     │
  │  INSERT ReviewLog {                 │
  │    rating, reviewTime,              │
  │    scheduledDays, elapsedDays,      │
  │    lastEaseFactor, newEaseFactor    │
  │  }                                  │
  └─────────────────────────────────────┘
      │
      ▼
返回 { success: true, nextReviewDate }
```

**评分映射**（前端按钮 → quality 值）：

| 按钮 | 显示文字 | quality 值 |
|------|----------|------------|
| 1 | 忘了 | 1 |
| 2 | 记不清 | 2 |
| 3 | 模糊记得 | 3 |
| 4 | 记得 | 4 |

---

## 单卡复习模式

从仪表盘卡片列表中点击单张卡片复习时激活：

**URL**：`/review?single=true&id=<cardId>&type=flashcard`

```
GET /api/review/[id]
      │
      ▼
加载单张卡片
      │
      ▼
正常复习流程
      │
      ▼
评分后显示"已完成"界面
（不自动进入下一张）
```

---

## 复习数据记录

每次评分都会写入 `ReviewLog`，用于统计分析：

```typescript
ReviewLog {
  rating:         number    // 用户评分 (1-5)
  reviewTime:     number    // 思考时间（毫秒）
  reviewedAt:     DateTime  // 复习时间戳

  // 算法快照（用于分析）
  scheduledDays:  number    // 计划间隔天数
  elapsedDays:    number    // 实际间隔天数
  lastEaseFactor: number    // 复习前的难度系数
  newEaseFactor:  number    // 复习后的难度系数
}
```

---

## 空状态处理

| 情况 | 显示内容 |
|------|----------|
| 无待复习闪卡 | "今日闪卡已复习完毕" 提示 |
| 无待复习文章 | "无待复习文章" 提示 |
| 两者均无 | 显示完成页面，建议创建新卡片 |

---

## 性能设计

- **批量加载**：每次只加载 10 张，减少初始请求压力
- **Cursor 分页**：基于游标的分页，避免 OFFSET 性能问题
- **预加载**：接近当前批次末尾时，自动触发下一批加载
- **数据库事务**：更新卡片 + 写入日志原子操作，保证数据一致性
