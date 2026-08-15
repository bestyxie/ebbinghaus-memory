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
- [x] (2026-08-15) T3: 课程列表 + 上传页 — 完成；agent-browser 实测：列表渲染/导航入口/浏览器上传/FAILED 重试成功
- [x] (2026-08-15) T4: 学习页听写交互 — 完成；agent-browser 全流程实测：错词红/对词绿、改错重判、专有名词免输、显示答案、完成页、刷新持久化、中断续学

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

- Observation: gstack browse 每次调用重启 server，浏览器 cookie 不跨调用持久——登录流程必须放进单条 `chain`。且 UI 登录（server action redirect）在 headless 里偶发导航不落地；可靠路径是 curl 登录拿 cookie 文件 → `cookie-import /tmp/cookies.json` → 同链内 goto。
  Evidence: 分步调用时 `cookies` 恒为 `[]`，url 回落 /login；单链 + cookie-import 后 `/courses` 渲染完整卡片。

- Observation: opencode.ai 偶发 Connect Timeout（Cloudflare 地址连不上），转写会 FAILED——API 已按 FAILED + error 落库，列表页"重试转写"按钮重发即成功。这是网络层瞬态，不是代码缺陷。
  Evidence: 一次 transcribe 502（error: Cannot connect to API: Connect Timeout）后重试 200。

- Observation: Prisma 1:1 关系（Course→CourseProgress）include 带过滤返回对象/null 而非数组——初版用 `Array.isArray(progress) ? progress[0] : null` 导致进度永远 null（写库成功但读不出）。
  Evidence: psql 查 CourseProgress 行存在，GET 详情 progress:null；改为对象/null 兼容读取后修复。

- Observation: 设计迭代——错词框"锁定 span 显示删除线+正确词"改为"保持 input 可编辑 + placeholder 提示正确答案"，更贴合"只可修改错误的单词"需求且键盘流不中断。
  Evidence: 用户需求原文 + 浏览器实测删除线 span 无法直接修改。

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

成果：课程听力学习全链路上线——上传（可选封面/视频自动截帧）→ mimo-v2.5 转写（逐句时间戳）→ glm-5.1 专有名词标记 → 列表管理（状态/进度/重试/删除）→ 学习页空格键听写流（专有名词免输、错红对绿、改错重判、显示答案、回车进下一句）→ 进度持久化与续学、完成页。全部 API 首行 requireAuth；新增 44 个单测（dictation-flow 15 + course-transcribe 13 + course-media 8 + shared course-schema 8）；type-check/lint/test 三绿；agent-browser 真实语音全流程验证通过。

差距与经验：
1. 设计阶段选的 glm-4.6-flash 转写模型在端点上不存在——模型能力要实测验证，不能依赖过时信息。27 模型逐一探测才找到 mimo-v2.5。
2. 本机 PG10 与 Prisma 7 shadow DB 不兼容（DROP DATABASE WITH (FORCE) 是 PG13+ 语法），migrate dev 全线不可用；手写 SQL + migrate deploy 绕过。升级 PG 前，后续迁移沿用此法。
3. 1:1 关系 include 的返回形态（对象 vs 数组）踩坑一次，进度读写不对称造成"写了读不到"。

对比原始目标：听力模式 MVP 完整交付。口语模式、ffmpeg 音轨抽取、听错词生成 SM-2 卡片、移动端适配均未做（明确 out of scope，归后续计划）。

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
