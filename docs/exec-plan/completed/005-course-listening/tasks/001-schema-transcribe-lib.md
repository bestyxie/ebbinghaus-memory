# T1: 数据模型 + shared schema + 转写 lib

## Goal

Course/CourseProgress 落库、shared 层类型与校验、转写纯逻辑 lib 可单测。API 与页面不在此 task。

## Steps

1. `apps/web/prisma/schema.prisma`：追加 `MediaType`/`CourseStatus`/`CourseProgressStatus` 枚举与 `Course`/`CourseProgress` 模型（见设计文档），`User` 加 `courses Course[]` / `courseProgresses CourseProgress[]` 反向外键；`npx prisma migrate dev --name course-listening`
2. `packages/shared/src/`：新增 course 类型（`TranscriptSentence`、`TranscriptWord`、`CourseSummary` 等）与 Zod schemas（transcript 结构、progress 更新 payload），挂到导出入口
3. `apps/web/app/lib/course-transcribe.ts`（纯逻辑 + fetch 封装，不碰 React）：
   - `normalizeWord(word)`：去首尾标点 + lowercase
   - `tokenizeSentence(text)`：按空白切词
   - `compareWord(input, expected)`：normalize 后全等
   - `callTranscriptionModel(base64, mediaType)`：OpenAI 兼容 chat completions，`input_audio`，`response_format: json_object`，prompt 要求 `{sentences:[{text,startMs,endMs}]}`；解析 + Zod 校验 + 按 startMs 排序
   - `markProperNouns(sentences)`：~40 句一批调 glm-5.1（复用 `ai-provider`），返回每句 words（含 isProperNoun）
4. `apps/web/app/lib/course-media.ts`：media 目录路径解析（`apps/web/media/`，启动时 ensureDir）、扩展名→MIME 映射、文件校验（大小 ≤100MB、类型白名单 audio/*|video/*）
5. vitest 单测（`__internal` 模式）：normalize/tokenize/compare 边界（标点、大小写、缩写）、transcript JSON 解析容错、Zod schema 拒绝非法 payload

## Verification

- `pnpm --filter web test` 新增测试全绿
- `pnpm --filter web type-check` 通过
- migrate 成功、`prisma generate` 后模型可用

## Non-Goals

- API 路由、页面、轮询逻辑（T2/T3/T4）
