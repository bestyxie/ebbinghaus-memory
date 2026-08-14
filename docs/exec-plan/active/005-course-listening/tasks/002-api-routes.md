# T2: 上传/媒体/转写 API

## Goal

courses 全部 API 路由可用：上传（含封面）、媒体 Range 流、转写触发、CRUD、进度。

## Steps

1. `POST /api/courses`：multipart（`media` 必填 file、`cover` 可选 file、`title` 必填）→ `course-media.ts` 校验 → 落盘 `<cuid>.<ext>` → 建 Course(PROCESSING)，返回 course
2. `GET /api/courses`：当前用户列表，include progress，按 createdAt desc；返回 `CourseSummary[]`（不含 transcript 全文，含 sentenceCount）
3. `GET /api/courses/[id]`：详情（transcript + progress），不存在/越权 404
4. `DELETE /api/courses/[id]`：删 Course（级联 progress）+ 删媒体/封面文件（文件不存在时容忍）
5. `POST /api/courses/[id]/transcribe`：读文件 → base64 → `callTranscriptionModel` → `markProperNouns` → 写 transcript + durationMs + status=READY；任何失败写 status=FAILED + error。仅 PROCESSING/FAILED 可触发。**同步等待完成**（MVP：请求长超时；前端 fetch 挂着，失败可重试）
6. `GET /api/courses/[id]/media`：读文件流式返回，实现 HTTP Range（206 + Accept-Ranges/Content-Range）；`GET /api/courses/[id]/cover` 同理（无需 Range）
7. `PUT /api/courses/[id]/progress`：Zod 校验 body（sentenceIndex、completedSentenceIds、status）→ upsert CourseProgress
8. 所有路由首行 `requireAuth(request)`；响应 JSON；media/cover 例外返回二进制流

## Verification

- `pnpm --filter web type-check` / `lint` 通过
- curl（带 session）实测：上传小音频 → transcribe → 详情 READY、transcript 结构正确；media 带 Range 请求返回 206
- 越权访问他人 course id 返回 404

## Non-Goals

- 页面 UI（T3/T4）；转写异步队列（同步等待即可）
