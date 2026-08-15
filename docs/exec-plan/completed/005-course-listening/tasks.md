# Tasks

## 已完成任务摘要

课程模块数据层就绪：Prisma `Course`/`CourseProgress` 模型 + 枚举已迁移入库（手写 SQL + `migrate deploy`，绕过 PG10 shadow DB 不兼容）；`@ebbinghaus/shared` 提供 transcript/progress Zod schemas 与 `CourseSummary` 类型；`app/lib/course-transcribe.ts` 与 `app/lib/course-media.ts` 就位。

T2 后课程 API 全通：上传/列表/详情/进度/删除/转写/Range 流媒体。**mimo-v2.5** 为端点唯一可用音频模型。

T3 后页面就绪：`/courses` 列表（状态徽标/进度条/重试/删除）+ `/courses/new` 上传（拖拽/可选封面/视频截帧/自动转写）+ 导航入口。

T4 后学习闭环完成：`dictation-flow.ts` 纯状态机（15 测试）+ 学习页（专有名词免输原样显示、空格键流、错红对绿错词可改、提交/显示答案/重播三按钮、回车进下一句、完成页、进度持久化与续学）。agent-browser 真实语音全流程验证通过。

## 下一个待执行任务

**当前**: 无（本计划全部 task 已完成，可归档）

## 任务列表

- [x] T1: 数据模型 + shared schema + 转写 lib — tasks/001-schema-transcribe-lib.md
- [x] T2: 上传/媒体/转写 API — tasks/002-api-routes.md
- [x] T3: 课程列表 + 上传页 — tasks/003-list-upload-pages.md
- [x] T4: 学习页听写交互 — tasks/004-learn-page.md
