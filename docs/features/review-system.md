# 复习系统

## 概述

复习系统是应用的核心功能，实现了基于 SM-2 算法的间隔复习流程。支持闪卡复习和文章复习两种模式，可以混合或单独进行。同时集成了**输出练习系统**，在传统翻转卡片评分之后，通过 4 级渐进式输出练习强化主动产出能力。

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

---

## 输出练习系统

### 概述

在完成传统闪卡评分后，系统会触发**输出练习（Output Exercises）**，要求用户主动产出目标词汇，而非被动识别。共有 4 个渐进难度等级。

**组件目录**：`/workspace/app/(pages)/review/components/exercises/`

### 4 级练习体系

| 等级 | 名称 | 形式 | 评分方式 |
|------|------|------|----------|
| Level 1 | 填空题 | 句子中目标词挖空，用户输入 | 自动判断（精确匹配） |
| Level 2 | 连词成句 | 打乱的单词块，拖拽/点击排序 | 自动判断（顺序匹配） |
| Level 3 | 中译英 | 给出中文句，用户翻译成英文 | AI 评估 + 用户自评 |
| Level 4 | 情景造句 | 给出情景描述，用户用目标词造句 | AI 评估 + 用户自评 |

### 输出练习流程

```
完成传统闪卡评分
        │
        ▼
POST /api/output-exercises/generate { cardId }
        │
        ├── 已有缓存练习 ──▶ 直接返回
        │
        └── 无缓存 ──▶ 调用 Zhipu GLM-4 生成 ──▶ 存入 OutputExercise 表
        │
        ▼
OutputExerciseView 展示练习
        │
        ├── Level 1 (FillBlanks)
        │   用户填写 ──▶ 前端自动判断 ──▶ 显示对错
        │
        ├── Level 2 (WordScramble)
        │   用户排序 ──▶ 前端自动判断 ──▶ 显示对错
        │
        ├── Level 3 (FreeTranslation)
        │   用户翻译 ──▶ POST /api/output-exercises/evaluate ──▶ AI 反馈
        │   用户自评"正确"/"错误"
        │
        └── Level 4 (ContextualPrompt)
            用户造句 ──▶ POST /api/output-exercises/evaluate ──▶ AI 反馈
            用户自评"正确"/"错误"
        │
        ▼
POST /api/review {
  cardId, quality,
  exerciseId, isOutputCorrect, outputLevel, userAnswer,
  aiVocabScore?, aiGrammarScore?, aiNativeScore?, aiFeedback?, aiSuggestedAnswer?
}
        │
        ▼
更新 card.outputRepetitions
写入 OutputPracticeLog
```

### 练习数据来源

AI（Zhipu GLM-4）为每张卡片生成一套练习数据，缓存在 `OutputExercise` 表中，包含：

| 字段 | 用途 |
|------|------|
| `englishSentence` | Level 1-4 的完整示例句子 |
| `chineseSentence` | Level 3 翻译练习的中文原文 |
| `fillBlankTemplate` | Level 1 填空模板（目标词替换为 `_____`） |
| `wordList` | Level 2 打乱的单词数组 |
| `standardAnswer` | Level 3-4 AI 评估参考答案 |
| `contextPrompt` | Level 4 情景造句提示（中文） |

### 练习提交 API 扩展

`POST /api/review` 在原有评分字段基础上新增可选字段：

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

### outputRepetitions 连续正确次数

`Card.outputRepetitions` 记录输出练习的连续正确次数，与 `repetitions`（被动识别）分开追踪，反映主动产出的熟练程度。

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
