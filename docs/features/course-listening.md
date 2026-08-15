# 课程听力学习

音视频 → 语音转写 → 逐句听写练习。一个媒体文件 = 一门课程。

## 流程

1. `/courses/new` 上传音视频（≤100MB，可选封面；视频未传封面自动截第一帧 jpeg）
2. 转写：**mimo-v2.5**（opencode.ai 端点，`AI_TRANSCRIBE_MODEL` 可覆盖）返回逐句时间戳 JSON；随后 glm-5.1 按 40 句/批标记专有名词（地名/人名，学习时免输）
3. `/courses/[id]` 学习：单 `<audio>` 按 `startMs..endMs` seek 播放，每句自动连播两遍

## 学习页交互

- 专有名词：原位置正常样式文本，不要求输入
- 空格：跳下一输入框；末框空格自动比对（normalize = 去首尾标点 + lowercase 全等）
- 比对结果：对词绿色锁定；错词红色保持可编辑（placeholder 提示正确答案）
- Backspace 空框回退；完成态 Enter 或"下一句"按钮进下一句
- 底部按钮：播放语音（再听两遍）/ 提交 / 显示正确答案
- 进度：每句完成 PUT 持久化；刷新续学；最后一句完成显示完成页（可重学）

## API

| 路由 | 说明 |
|---|---|
| `POST /api/courses` | multipart: media + cover? + title |
| `GET /api/courses` | 列表（含进度、sentenceCount） |
| `GET /api/courses/[id]` | 详情（transcript + progress） |
| `PUT /api/courses/[id]` | 进度 upsert（sentenceIndex/completedSentenceIds/status） |
| `DELETE /api/courses/[id]` | 级联删除 + 媒体文件清理 |
| `POST /api/courses/[id]/transcribe` | 同步转写（maxDuration 300s；仅 PROCESSING/FAILED 可触发） |
| `GET /api/courses/[id]/media` | Range 流式（206）；`?type=cover` 封面 |

## 存储与数据

- 文件：`apps/web/media/<uuid>.<ext>`（git ignore），DB 存相对路径
- `Course`：mediaType/mediaPath/coverPath/durationMs/status(PROCESSING|READY|FAILED)/error/transcript(Json)
- `CourseProgress`：每用户每课程一行，不进 SM-2
- transcript 结构：`[{ idx, text, startMs, endMs, words: [{ text, isProperNoun }] }]`（Zod 校验见 `@ebbinghaus/shared`）

## 关键代码

| 文件 | 职责 |
|---|---|
| `apps/web/app/lib/course-transcribe.ts` | 转写调用 + 专有名词标记 + normalize/compare 纯函数 |
| `apps/web/app/lib/course-media.ts` | MIME 白名单、大小校验、落盘路径 |
| `apps/web/app/lib/dictation-flow.ts` | 听写状态机（空格流/比对/解锁/揭示） |
| `apps/web/app/(pages)/courses/[id]/learn-client.tsx` | 学习页 UI |
| `apps/web/app/(pages)/courses/[id]/use-sentence-audio.ts` | 按句播两遍 hook |

## 已知限制

- 转写同步等待（长音频页面需挂 1-2 分钟；失败可重试）
- 视频整体送转写（无 ffmpeg 抽轨），>100MB 拒绝
- opencode.ai 偶发网络超时 → FAILED → 列表页重试即恢复
