# 翻译模块核心：任务生成 + 翻译实战 + AI 诊断

本 ExecPlan 是活文档。Progress、Surprises & Discoveries、Decision Log、
Outcomes & Retrospective 章节必须随工作进展保持更新。

本文档遵循 docs/exec-plan/PLANS.md 规范。
任务拆分遵循 docs/exec-plan/TASKS.md 规范。

## Purpose / Big Picture

全局目标：实现 translate-plan.md 描述的完整"沉浸式场景翻译练习"模块，包含 4 个页面——翻译大厅、翻译实战台、AI 诊断报告、历史档案。

当前现状：系统已有完整的闪卡+复习+AI 输出练习功能。AI 集成使用 Zhipu GLM-4 + Vercel AI SDK (`ai` 包)。已有 `OutputExercise` / `OutputPracticeLog` 模型做 AI 评估。导航栏有 Dashboard 和 Settings 两个入口。无翻译相关模型、API、页面。

本计划范围：**第一个纵向切片**——从数据模型到 AI 到 UI 的最小端到端路径。覆盖翻译大厅（页面一）和翻译实战+AI诊断（页面二+三）的基础版本。不包含页面四（历史档案）和高级交互（朗读、折线图对比、一键制卡）。

## Progress

- [x] (2026-04-28) T1: 数据模型 — TranslationTask + Prisma migration
- [x] (2026-04-28) T2: AI 生成接口 — 场景翻译句子生成
- [x] (2026-04-28) T3: API 路由 — CRUD + 生成 + 提交评估
- [x] (2026-04-28) T4: 翻译大厅页面 — 主题选择、难度、生成按钮
- [x] (2026-04-28) T5: 翻译实战页面 — 源文本展示、输入、提交
- [x] (2026-04-28) T6: AI 诊断展示 — 评分、高亮批注、润色建议
- [x] (2026-04-28) T7: 导航入口 — sidebar 添加翻译链接

## Surprises & Discoveries

- Observation: vinext dev server 在容器环境中经常出现 module resolution timeout（`vinext-rsc-entry` transport invoke timeout），这不是本次变更引入的问题，是容器资源限制导致的。
  Evidence: 任何页面（包括 /login）都 500，错误日志一致为 `transport invoke timed out after 60000ms`。

- Observation: `pnpm build` 在容器中会被 SIGKILL（OOM），也是环境限制。
  Evidence: `Next.js build worker exited with code: null and signal: SIGKILL`

- Observation: 实际使用了 `generateObject` 而非 `streamText` 做评估，因为评估需要结构化输出（annotations 数组）来驱动前端高亮。
  Evidence: `evaluateTranslation` 函数返回完整的结构化数据。

- Decision: 翻译任务使用独立模型 TranslationTask，不复用 Card 模型
  Rationale: 翻译任务有独特的字段（sourceText, sourceLang, targetLang, difficulty, topic, hintUsed, score, aiFeedback 等），与闪卡生命周期差异大。强行复用 Card 会导致模型膨胀和状态机冲突。后续可通过"一键制卡"将翻译成果导入 Card。
  Date/Author: 2026-04-28 / Claude

- Decision: 使用 Vercel AI SDK 的 streamText 做流式 AI 诊断输出
  Rationale: translate-plan 明确要求"逐字显现 AI 批改过程"，streamText 是项目中 `ai` 包已支持的特性。
  Date/Author: 2026-04-28 / Claude

## Outcomes & Retrospective

完成了翻译模块的核心纵向切片：用户可以从侧边栏进入翻译大厅 → 选择主题和难度 → 生成翻译任务 → 在实战页面翻译中文句子 → 获得 AI 多维度评分和批注反馈。

代码层面：type-check 和 lint 全部通过，Prisma schema 和数据库同步完成。容器环境限制（OOM、vinext timeout）导致无法在容器内运行 dev server 做端到端验证，但代码逻辑完整。

差距：translate-plan 中的页面四（历史档案+SM-2复习调度）和高级交互（朗读、折线图对比、一键制卡到 Card 模型）未包含在本次计划中，属于后续计划范围。

## Context and Orientation

### 关键文件

- `prisma/schema.prisma` — 数据模型定义，将新增 TranslationTask 模型
- `app/lib/ai.ts` — AI 配置（Zhipu GLM-4 + Vercel AI SDK）
- `app/lib/output-exercises.ts` — 现有 AI 练习生成/评估，参考其模式
- `app/lib/api-helpers.ts` — `requireAuth()` API 鉴权
- `app/lib/types.ts` — 类型定义
- `app/lib/zod.ts` — Zod 验证 schema
- `app/(pages)/components/navigation.tsx` — 侧边栏导航，需添加翻译入口
- `app/(pages)/review/` — 现有复习页面，参考其客户端交互模式

### 主题列表（初始）

| 分类 | 主题 |
|------|------|
| IT & 技术 | IT 全栈开发、DevOps 与系统运维、医疗 IT 与实施 |
| 商务 | 奢侈品鉴定与零售、金融与投资、项目管理 |
| 日常 | 日常社交、旅行与交通、美食与烹饪 |
| 学术 | 学术写作、医学研究、法律与合规 |

### 难度等级

- `basic` — 基础表达（短句，常见词汇）
- `advanced` — 进阶长句（复杂句式，领域术语）
- `expert` — 骨灰级难度（长难句，高级表达）

### 术语

- **TranslationTask** — 一次翻译练习任务，包含 AI 生成的源文本和用户的翻译结果
- **源文本 (sourceText)** — AI 生成的中文句子，用户需将其翻译为英文
- **AI 诊断** — AI 对用户翻译的多维度评分和反馈

## Plan of Work

### T1: 数据模型

在 `prisma/schema.prisma` 新增 `TranslationTask` 模型：

    model TranslationTask {
      id            String   @id @default(cuid())
      userId        String
      user          User     @relation(fields: [userId], references: [id])

      topic         String   // 主题，如 "医疗 IT 与实施"
      difficulty    String   // basic | advanced | expert
      sourceText    String   @db.Text  // AI 生成的中文源文本

      // 用户提交
      userTranslation String? @db.Text // 用户的英文翻译（null = 未完成）

      // AI 评估结果
      score         Int?     // 综合评分 0-100
      accuracyScore Int?     // 准确度 0-100
      fluencyScore  Int?     // 流利度 0-100
      vocabScore    Int?     // 词汇量 0-100
      aiFeedback    String?  @db.Text  // AI 逐句批注（JSON）
      aiPolished    String?  @db.Text  // AI 润色版本
      aiNativeAlt   String?  @db.Text  // AI 地道表达建议

      // 提示使用
      hintUsed      Boolean  @default(false)
      hintWords     Json?    // string[] 提示的关键词

      // 计时
      timeSpentMs   Int?     // 用户花费时间（毫秒）

      // 复习状态（复用 SM-2）
      status        TranslationTaskStatus @default(PENDING)
      nextReviewAt  DateTime @default(now())
      interval      Int      @default(0)
      easeFactor    Float    @default(2.5)
      repetitions   Int      @default(0)

      createdAt     DateTime @default(now())
      updatedAt     DateTime @updatedAt

      @@index([userId, nextReviewAt])
      @@index([userId, status])
    }

    enum TranslationTaskStatus {
      PENDING      // 已生成，未翻译
      COMPLETED    // 已提交翻译
      NEEDS_REVIEW // SM-2 调度需要复习
    }

在 User 模型添加 `translationTasks TranslationTask[]` 关系。

运行 `npx prisma migrate dev` 创建迁移。

### T2: AI 生成接口

新建 `app/lib/translate-ai.ts`，两个核心函数：

1. `generateTranslationTask(topic, difficulty)` — 调用 Zhipu GLM-4 生成中文源文本
2. `evaluateTranslation(sourceText, userTranslation, difficulty)` — 流式 AI 评估（返回 streaming response 或一次性 structured response）

使用 `generateObject` + Zod schema 确保结构化输出，与 `output-exercises.ts` 模式一致。

### T3: API 路由

新建 `app/api/translate/` 目录：

- `POST /api/translate/generate` — 生成翻译任务（调 AI → 写 DB → 返回 task）
- `POST /api/translate/[id]/submit` — 提交翻译 + AI 评估（调 AI → 更新 DB → 返回评分）
- `GET /api/translate/tasks` — 列出用户翻译任务（分页 + 状态筛选）
- `GET /api/translate/tasks/[id]` — 获取单个任务详情

### T4: 翻译大厅页面

新建 `app/(pages)/translate/page.tsx`：
- 主题下拉选择（硬编码主题列表）
- 难度选择（三个 radio）
- "生成并开始挑战"按钮 → POST /api/translate/generate → 跳转到 workspace
- 历史任务列表（简化版，从 GET /api/translate/tasks 获取）

### T5: 翻译实战页面

新建 `app/(pages)/translate/[id]/page.tsx`：
- 展示 sourceText
- 翻译输入框（textarea）
- 计时器
- "获取提示"按钮 → 展示核心词汇，标记 hintUsed
- "提交"按钮 → POST /api/translate/[id]/submit

### T6: AI 诊断展示

在翻译实战页面提交后，下方区域展示：
- 综合评分 + 三维度分数
- 用户原文上的颜色批注（绿=好，红=有问题）
- AI 润色版本
- 地道表达建议
- "生成下一个任务"按钮 → 返回大厅
- "再译一次"按钮 → 清空输入，重新挑战同一源文本

### T7: 导航入口

在 `app/(pages)/components/navigation.tsx` 添加翻译页面链接，使用 `Languages` icon。

## Validation and Acceptance

1. 运行 `pnpm type-check` 通过
2. 运行 `pnpm lint` 通过
3. `pnpm dev` 启动后：
   - 访问 `/translate`，选择主题和难度，点击生成
   - 页面跳转到 `/translate/[id]`，显示 AI 生成的中文句子
   - 输入英文翻译，点击提交
   - 页面显示 AI 评分和反馈
   - 点击"生成下一个任务"回到大厅，能看到刚完成的任务在历史列表中

## Idempotence and Recovery

- Prisma migration 可安全重复运行
- API 路由都是幂等的（GET 不改状态，POST 创建新记录）
- 如果 AI 生成失败，返回错误信息，不创建数据库记录
- 如果 AI 评估失败，用户可重新提交

## Interfaces and Dependencies

- `ai` 包 (Vercel AI SDK) — 已安装，使用 `generateObject`, `generateText`, `streamText`
- `zhipu-ai-provider` — 已安装
- `zod` — 已安装
- `lucide-react` — 已安装，使用 `Languages` icon
- `@/app/lib/prisma` — Prisma 单例
- `@/app/lib/api-helpers` — `requireAuth()`
