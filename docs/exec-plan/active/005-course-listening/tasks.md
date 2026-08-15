# Tasks

## 已完成任务摘要

课程模块数据层就绪：Prisma `Course`/`CourseProgress` 模型 + `MediaType`/`CourseStatus`/`CourseProgressStatus` 枚举已迁移入库（手写 SQL + `migrate deploy`，绕过 PG10 shadow DB 不兼容）；`@ebbinghaus/shared` 提供 transcript/progress Zod schemas 与 `CourseSummary` 类型；`app/lib/course-transcribe.ts`（normalize/tokenize/compare 纯函数 + GLM-4.6-Flash 转写调用 + glm-5.1 专有名词标记，全部容错解析）与 `app/lib/course-media.ts`（MIME 白名单、100MB 上限、media/ 落盘路径）就位。新增 29 个单测全绿；type-check/lint 通过。

## 下一个待执行任务

**当前**: T2 (002-api-routes)

## 任务列表

- [x] T1: 数据模型 + shared schema + 转写 lib — tasks/001-schema-transcribe-lib.md
- [ ] T2: 上传/媒体/转写 API — tasks/002-api-routes.md
- [ ] T3: 课程列表 + 上传页 — tasks/003-list-upload-pages.md
- [ ] T4: 学习页听写交互 — tasks/004-learn-page.md
