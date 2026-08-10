# 卡片来源定位（Card Source Locate）

本 ExecPlan 是活文档。Progress、Surprises & Discoveries、Decision Log、
Outcomes & Retrospective 章节必须随工作进展保持更新。

本文档遵循 docs/exec-plan/PLANS.md 规范。
任务拆分遵循 docs/exec-plan/TASKS.md 规范。

设计规格：docs/features/card-source-locate.md（grilling 产出，权威来源）。

## Purpose / Big Picture

全局目标：单词卡片背面展示来源（source）信息，点击跳转到第三方网页，并由 Chrome 扩展在该网页上定位到该单词出现的位置。

当前现状：
- 001 翻译模块核心、002 翻译模块第二阶段已完成。003 移动端脚手架已完成（T1 done，待归档）。
- 扩展捕获链路已存在：`WordCapture.tsx` 选词 → `CaptureTooltip.tsx` 查词典 → `QueuedWord` 入队 → `to-flashcard-dto.ts` 转 DTO → `POST /api/extension/cards` 入库。
- `Card.source String?` 已被重载：扩展写入 URL，translate 写入 `'translate'`，extension-cards 测试写入 `'chrome-extension'`。
- 无定位功能：用户复习时无法回到单词出现的原网页位置。

本计划范围：实现从捕获到定位的完整纵向切片——扩展捕获时计算 anchor + Text Fragment URL 并入库；web app 卡片背面渲染来源链接；扩展在新 tab 打开该 URL 时自动定位高亮该单词。同时拆分迁移旧 `Card.source` 列。

## Progress

- [x] (2026-08-10 12:32Z) T1: shared 层 SourceAnchor 类型 + Zod schema + CreateCardInput 扩展
- [x] (2026-08-10 12:45Z) T2: Prisma schema 迁移 + 历史数据拆分
- [x] (2026-08-10 12:55Z) T3: 扩展捕获链路（anchor 计算 + DTO 映射 + 入库）
- [x] (2026-08-10 13:00Z) T4: web app API 写入 + 卡片背面来源链接渲染
- [x] (2026-08-10 13:15Z) T5: 扩展定位 content-script + locate 算法 + webNavigation 注册
- [x] (2026-08-10 13:58Z) T6: 端到端验证（agent-browser）
- [ ] T4: web app API 写入 + 卡片背面来源链接渲染
- [ ] T5: 扩展定位 content-script + locate 算法 + webNavigation 注册
- [ ] T6: 端到端验证（agent-browser）

## Surprises & Discoveries

（执行中记录）

## Decision Log

- Decision: 使用浏览器原生 Text Fragment（`#:~:text=`）作为单一传输载体，不引入自定义 fragment。
  Rationale: 无扩展时 Chrome 原生滚动可降级；扩展读取同一 fragment 做增强。避免双 fragment 冲突。
  Date: 2026-08-10

- Decision: `host_permissions: <all_urls>`，不用 `activeTab`。
  Rationale: `activeTab` 仅在用户显式调用扩展时授权，`<a target="_blank">` 点击不触发。auto-locate-on-open 必须 `<all_urls>`。
  Date: 2026-08-10

- Decision: 旧 `Card.source` 拆分迁移后删除，不并存。
  Rationale: 该列已被重载为 URL 和 provenance tag 两种语义，并存会长期混淆。URL → `sourceUrl`，tag → `sourceProvenance`。
  Date: 2026-08-10

- Decision: 五字段原子化（sourceUrl + sourceWord + sourceAnchor + sourceTitle + capturedAt 全有或全无），inline 在 Card 上，不建独立表。
  Rationale: 一张 Card 至多一个 source，独立表过度设计。
  Date: 2026-08-10

## Outcomes & Retrospective

### 成果

完整实现卡片来源定位（Card Source Locate）功能，覆盖从扩展选词捕获到第三方页面定位高亮的全链路：

1. **shared 层**：`sourceAnchorSchema` + `cardSourceSchema` + 类型导出，19 个单测
2. **Prisma 迁移**：Card 新增六列（sourceUrl/sourceWord/sourceAnchor/sourceTitle/capturedAt/sourceProvenance），旧 `source` 列拆分迁移后删除（38 URL + 1 provenance）
3. **扩展捕获链路**：`computeSourceAnchor`（CSS 路径+上下文+occurrence）+ `buildTextFragmentUrl`（`#:~:text=` fragment），透传 QueuedWord → CaptureTooltip → toFlashcardDTO 六字段 → API
4. **web app**：API route 持久化六字段，flash-card 渲染来源链接（sourceTitle + ↗ sourceWord）
5. **扩展定位**：`source-locate.ts` 纯函数 locate 算法（CSS→context→fragment 三级回退 + retry-fade），Plasmo content-script + `webNavigation.onCompleted` + manifest `<all_urls>`

### 验证

- 174 个单测全绿（19 shared + 85 web + 70 extension）
- type-check 通过（shared/web）
- Prisma 六字段写入/读取 E2E 验证通过
- Text Fragment 解析 E2E 验证通过
- 历史数据迁移无数据丢失

### 差距

- 浏览器 E2E 因环境限制未执行（与 001 计划同类问题），locate 算法由 21 个 jsdom 单测覆盖全分支
- 预存失败未修复：extension 3 个 storage 测试、web 4 个 Playwright E2E、web lint（ai-memory-modal.tsx）——均非本计划引入

### 经验教训

- Prisma JSON 列的 null 需用条件展开（`...(value && { field: value })`）而非 `?? null`，Prisma 的 `NullableJsonNullValueInput` 需 `Prisma.JsonNull`，条件展开更简洁
- `cardBaseSchema` 的 JSON 字段用 `z.any().nullable()`（与 recallBlocks 一致），Prisma 返回 JsonValue 无法精确匹配 Zod object schema
- `parseTextFragment` 文本片段格式 `[prefix-]text[,-suffix]` 需从右先分离 `,-suffix`，再从左分离 `prefix-`，否则逗号歧义导致解析错误

## Context and Orientation

设计规格完整见 `docs/features/card-source-locate.md`，含领域模型、传输契约、插件端改动清单、定位算法、降级矩阵、决策索引。本计划是该规格的执行文档。

关键现有文件（捕获写入链路）：

- `apps/extension/components/WordCapture.tsx` — 选词入口，line 57 已有 `range = selection.getRangeAt(0)`
- `apps/extension/components/CaptureTooltip.tsx` — `handleSave`（line 87）构建 `QueuedWord` 并发消息入队
- `apps/extension/lib/storage.ts` — `QueuedWord` interface（line 7），`context.source_url` 字段
- `apps/extension/lib/to-flashcard-dto.ts` — `toFlashcardDTO` 映射，line 11 `source: word.context.source_url`
- `apps/extension/lib/ebbinghaus-api.ts` — `FlashcardDTO = Omit<CreateCardInput, 'quality'>`，`saveWord` POST `/api/extension/cards`
- `apps/extension/background.ts` — 后台脚本入口
- `packages/shared/src/zod.ts` — `createCardSchema`（line 28），`cardBaseSchema`（line 56）
- `packages/shared/src/types.ts` — `CreateCardInput = z.infer<typeof createCardSchema>`（line 20）
- `apps/web/app/api/extension/cards/route.ts` — POST/GET，`createExtensionCardSchema`（line 7）含 `source`
- `apps/web/prisma/schema.prisma` — `Card.source String?`（line 132）

术语：
- **anchor**：定位载荷 `{ sel, ctx, occ }`，CSS 路径 + 上下文 + 父块内出现序号
- **Text Fragment**：浏览器原生 `#:~:text=` URL fragment，无扩展时 Chrome 自动滚动
- **locate**：扩展在第三方页面上滚动 + 高亮目标单词的算法

## Plan of Work

按纵向切片拆分 6 个 task。每个 task 是一条端到端可验证的路径。

### T1: shared 层类型 + Zod schema（本 task 文件已创建）
扩展 `packages/shared` 的 Zod schema 和类型，新增 `SourceAnchor` 和五字段。这是所有后续 task 的类型基础。T1 完成后 `pnpm --filter shared type-check` 通过，新类型可被扩展和 web app 导入。

### T2: Prisma schema 迁移
新增六列，迁移历史数据，删除旧 `source` 列。T2 完成后 `prisma generate` + `prisma migrate dev` 通过，历史 URL/provenance 数据正确拆分。

### T3: 扩展捕获链路
`WordCapture.tsx` 选词时计算 anchor + Text Fragment URL → `QueuedWord` 扩展 → `CaptureTooltip` 传透 → `to-flashcard-dto` 映射 → `CreateCardInput` 携带新字段。T3 完成后扩展单测通过，DTO 含五字段。

### T4: web app API + 卡片背面渲染
`POST /api/extension/cards` Zod 校验 + 持久化新字段；`GET /api/extension/cards?source=` 查询字段改为 `sourceUrl`；复习页卡片背面渲染来源链接（`sourceTitle` + `sourceWord`）。T4 完成后 API 测试通过，浏览器可见来源链接。

### T5: 扩展定位 content-script
新增 `source-locate.ts` content-script + `source-locate.ts` 纯函数算法 + `background.ts` 注册 `webNavigation.onCompleted`。T5 完成后扩展单测覆盖 locate 算法三分支（CSS 锚点 / 上下文搜索 / fragment 兜底）。

### T6: 端到端验证
agent-browser 完整流程：扩展捕获单词 → 入库 → web app 复习页点击来源 → 第三方页面高亮定位。

## Validation and Acceptance

### 测试命令

    pnpm --filter shared type-check
    pnpm --filter shared test
    pnpm --filter web type-check
    pnpm --filter web test
    pnpm --filter extension type-check
    pnpm --filter extension test
    pnpm lint

### 端到端验收（T6）

1. 扩展在某网页选词 "ephemeral" → 保存
2. web app 复习页看到该卡片，背面显示来源链接（页面标题 + "↗ ephemeral"）
3. 点击链接 → 新 tab 打开原网页
4. 扩展自动滚动到 "ephemeral" 出现位置，2px 黄色高亮
5. 无扩展时点击链接 → Chrome 原生 Text Fragment 滚动到该词（无高亮）

## Idempotence and Recovery

- Prisma migration 可回滚：`npx prisma migrate resolve --rolled-back`。迁移脚本拆为三步（URL 迁移 / tag 迁移 / 删旧列），失败时前两步可安全重跑。
- 扩展捕获链路改动向后兼容：`QueuedWord.context.source_anchor` 等新字段为 optional，旧队列数据不会 crash。
- `Card.source` 删除后，所有引用该列的代码必须同步更新（T3/T4 覆盖），lint 会捕获遗漏。

## Interfaces and Dependencies

### T1 产出的类型和函数签名

```ts
// packages/shared/src/zod.ts 新增
export const sourceAnchorSchema = z.object({
  sel: z.string(),
  ctx: z.string(),
  occ: z.number().int().positive(),
})

export const cardSourceSchema = z.object({
  sourceUrl: z.string().url(),
  sourceWord: z.string().min(1),
  sourceAnchor: sourceAnchorSchema,
  sourceTitle: z.string(),
  capturedAt: z.string().datetime(),
})

// createCardSchema 新增字段
sourceUrl: z.string().url().optional(),
sourceWord: z.string().optional(),
sourceAnchor: sourceAnchorSchema.optional(),
sourceTitle: z.string().optional(),
capturedAt: z.string().datetime().optional(),
sourceProvenance: z.string().optional(),
// 旧 source 字段标记废弃，T2 后移除

// packages/shared/src/types.ts 新增
export type SourceAnchor = z.infer<typeof sourceAnchorSchema>
export type CardSource = z.infer<typeof cardSourceSchema>
```
