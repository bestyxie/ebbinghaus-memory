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

- [ ] T1: 数据模型 + shared schema + 转写 lib
- [ ] T2: 上传/媒体/转写 API
- [ ] T3: 课程列表 + 上传页
- [ ] T4: 学习页听写交互

## Surprises & Discoveries

（待记录）

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
