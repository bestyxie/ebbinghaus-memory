# 课程听力学习：音视频上传 → 转写 → 逐句听写

本 ExecPlan 是活文档。Progress、Surprises & Discoveries、Decision Log、
Outcomes & Retrospective 章节必须随工作进展保持更新。

本文档遵循 docs/exec-plan/PLANS.md 规范。
任务拆分遵循 docs/exec-plan/TASKS.md 规范。

设计文档：`docs/plans/2026-08-14-course-listening-design.md`（已用户确认）。

## Purpose / Big Picture

全局目标：为 Ebbinghaus Memory 增加"课程"模块——上传音频/视频，GLM-4.6-Flash 转写为逐句带时间戳文本，用户做听力听写练习（按句播两遍、逐词填空、专有名词免输）。后续扩展口语模式。

当前现状：monorepo 含 web（Next.js 15 + better-auth + Prisma 7 + Postgres）、extension、mobile 脚手架、shared。现有 AI 通道为 OpenAI 兼容端点（`AI_BASE_URL`=opencode.ai，`AI_MODEL`=glm-5.1），走 `ai` SDK `generateText`。无任何媒体文件上传/存储设施；无 Course 相关模型、路由、页面。

本计划范围：听力模式完整闭环——上传（含可选封面/视频自动截帧）→ 转写（含专有名词标记）→ 课程列表 → 学习页逐句听写（空格键流）→ 进度持久化。**不含**口语模式、ffmpeg 处理、SM-2 联动、移动端适配。

无前序计划方向偏差需要修正。

## Progress

- [x] (2026-08-15) T1: 数据模型 + shared schema + 转写 lib — 完成；migrate/test/type-check/lint 全绿
- [x] (2026-08-15) T2: 上传/媒体/转写 API — 完成；真实语音端到端验证通过（上传→转写→READY 时间戳正确、Range 206、越权 404/307、删除级联清理文件）
- [ ] T3: 课程列表 + 上传页
- [ ] T4: 学习页听写交互

## Surprises & Discoveries

- Observation: web lint 在 HEAD 上崩溃（`context.getSource is not a function`）。根因：mobile 脚手架的 eslint-config-expo@8 引入 eslint-plugin-react-hooks@4.6.2，pnpm 提升后从 apps/web 的 eslint.config.mjs 位置 resolve react-hooks 会命中 4.6.2（ESLint 9 下调用已废弃 API 崩溃）。修复：web 显式 devDependency eslint-plugin-react-hooks@^5.2.0。
  Evidence: probe flat config 输出 resolved path .../eslint-plugin-react-hooks@4.6.2_eslint@8.57.1/...；加依赖后 `next lint` 通过。

- Observation: 本机 Postgres 10.3（Postgres.app var-10）不支持 `DROP DATABASE ... WITH (FORCE)`（PG13+ 语法）。Prisma 7 migrate dev 在 shadow DB 生命周期清理时对每条语句报 syntax error，随后 init migration 重放报 `type "CardState" already exists`（P3006）。SHADOW_DATABASE_URL 指向的 ebbinghus_shadow 库本身是干净的——Prisma 7 新引擎自建 `prisma_migrate_shadow_db_<uuid>` 临时库，清理失败导致脏状态复现。
  Evidence: postgresql.log 反复出现 `syntax error at or near "WITH"` + `DROP DATABASE IF EXISTS "prisma_migrate_shadow_db_..." WITH (FORCE)`。
  说明：绕过方案 = 手写迁移 SQL + `prisma migrate deploy`（不走 shadow DB）。后续迁移沿用此法，直到 Postgres 升级 ≥13。

- Observation: prisma.config.ts 的 migrations 选项不支持 shadowDatabaseUrl 字段（TS2353）；migrate diff 命令的 --shadow-database-url flag 也已在 Prisma 7 移除。
  Evidence: type-check 报错与 CLI usage 输出。

- Observation: ai SDK v6 FilePart 字段名是 mediaType 而非 mimeType。
  Evidence: @ai-sdk/provider-utils FilePart 接口定义。

- Observation: opencode.ai 端点**不支持** glm-4.6-flash（设计阶段信息过时）。逐一实测 27 个模型：仅 `mimo-v2.5` 真正接受 `input_audio` 并能转写（glm-5.x 会静默返回"没有多模态能力"的 reasoning、gpt-5.6-luna 返回空 content、其余直接报错）。`/v1/audio/transcriptions` 端点不存在（返回 HTML）。
  Evidence: `GET /v1/models` 列表 + 逐模型 `input_audio` 探测；mimo-v2.5 对真实语音返回正确时间戳 JSON `{"sentences":[{"text":"Hello world.","startMs":0,"endMs":1000},...]}`。
  Decision: 默认转写模型改为 `mimo-v2.5`（可用 `AI_TRANSCRIBE_MODEL` 覆盖）。mimo 是 reasoning 模型，max_tokens 需给足（lib 走 generateText 默认值，实测 2 句语音正常返回；长音频若截断需调大）。

- Observation: 纯音频正弦波（无语音）送 mimo-v2.5 会返回"我无法处理音频"的自然语言而非 JSON——转写失败路径因此覆盖（parseTranscriptionResponse 返回 error，route 写 FAILED）。
  Evidence: sine wave curl 测试返回 "I cannot hear or process audio files."。

- Observation: NextResponse 构造函数不直接接受 `Readable.toWeb()` 的 `ReadableStream<any>`（TS2345），且 lint 禁 `as` 断言。解法：手写 ReadableStream<Uint8Array> 包装 reader（无断言、类型精确）。
  Evidence: media route 初版报错，包装后 type-check + lint 双绿。

## Decision Log

- Decision: 转写用 GLM-4.6-Flash（opencode.ai 端点），返回逐句时间戳 JSON
  Rationale: 用户确认。免费、复用现有密钥、模型端分句，无需本地 ffmpeg 切分。视频直接整体送（≤100MB）。
  Date/Author: 2026-08-14 / claude

- Decision: 媒体与封面存本地磁盘 `apps/web/media/`，DB 存相对路径
  Rationale: 用户确认。自托管个人项目，零新增依赖；API 路由实现 Range 流式返回。
  Date/Author: 2026-08-14 / claude

- Decision: 专有名词由 glm-5.1 按 ~40 句批量标记 isProperNoun，学习页原位置正常样式显示免输
  Rationale: 用户确认。
  Date/Author: 2026-08-14 / claude

- Decision: 判定规则 normalize（去标点+lowercase）后全等；空格键流（末框空格自动比对，错红可改/对灰锁定）；全对后手动点"下一句"或回车进下一句
  Rationale: 用户逐项确认。
  Date/Author: 2026-08-14 / claude

- Decision: Course/CourseProgress 独立模型，不进 SM-2
  Rationale: 用户确认。课程进度只到句子粒度。
  Date/Author: 2026-08-14 / claude

## Outcomes & Retrospective

（完成后填写）

## Context and Orientation

### 关键落点

- Prisma：`apps/web/prisma/schema.prisma` 追加 Course/CourseProgress + 枚举，User 加反向外键
- shared：`packages/shared/src/` 增加 course 类型与 Zod schema
- 转写 lib：`apps/web/app/lib/course-transcribe.ts`（纯逻辑，HTTP 调用封装；不进 React）
- 媒体落盘：`apps/web/media/`（git ignore）
- API：`apps/web/app/api/courses/...`（首行 requireAuth）
- 页面：`apps/web/app/(pages)/courses/`（list / new / [id]）
- 导航：`(pages)/components/navigation.tsx` navItems 加 Courses（GraduationCap）

### 验证方式

- 单测：normalize/分词/比对逻辑、transcript JSON 解析、Zod schema（vitest，`__internal` 模式）
- 集成：`agent-browser` 实测上传→转写→学习闭环（CLAUDE.md 要求）
