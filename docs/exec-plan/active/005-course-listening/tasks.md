# Tasks

## 已完成任务摘要

课程模块数据层就绪：Prisma `Course`/`CourseProgress` 模型 + `MediaType`/`CourseStatus`/`CourseProgressStatus` 枚举已迁移入库（手写 SQL + `migrate deploy`，绕过 PG10 shadow DB 不兼容）；`@ebbinghaus/shared` 提供 transcript/progress Zod schemas 与 `CourseSummary` 类型；`app/lib/course-transcribe.ts`（normalize/tokenize/compare 纯函数 + 转写调用 + glm-5.1 专有名词标记，全部容错解析）与 `app/lib/course-media.ts`（MIME 白名单、100MB 上限、media/ 落盘路径）就位。新增 29 个单测全绿；type-check/lint 通过。

T2 后课程 API 全通：`POST/GET /api/courses`（multipart 上传含可选封面、列表含进度）、`GET/PUT/DELETE /api/courses/[id]`（详情/进度 upsert/级联删除+文件清理）、`POST .../transcribe`（同步转写，**mimo-v2.5** 实测为端点唯一可用音频模型）、`GET .../media`（HTTP Range 206 流式 + `?type=cover`）。真实语音端到端验证：上传→转写→READY，时间戳与专有名词标记正确。

## 下一个待执行任务

**当前**: T4 (004-learn-page)

## 任务列表

- [x] T1: 数据模型 + shared schema + 转写 lib — tasks/001-schema-transcribe-lib.md
- [x] T2: 上传/媒体/转写 API — tasks/002-api-routes.md
- [x] T3: 课程列表 + 上传页 — tasks/003-list-upload-pages.md
- [ ] T4: 学习页听写交互 — tasks/004-learn-page.md
