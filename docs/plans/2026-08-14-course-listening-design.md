# 课程听力学习设计（音视频 → 逐句听写）

日期：2026-08-14
状态：已确认（用户逐段验收）

## 目标

上传音频/视频 → 语音转写为逐句文本（带时间戳）→ 用户进入课程做听力练习：按句播放音频两遍，逐词填空听写。一个媒体文件 = 一门课程。

## 已确认决策

| 决策点 | 结论 |
|---|---|
| 转写方案 | GLM-4.6-Flash（走现有 AI_BASE_URL/opencode.ai 端点，免费，返回逐句时间戳） |
| 专有名词判定 | 转写后用 glm-5.1 分批标记 isProperNoun |
| 媒体存储 | 本地磁盘 `apps/web/media/`，DB 存相对路径 |
| 判定规则 | normalize（去标点 + toLowerCase）后相等即正确 |
| 进度模型 | 独立 Course/CourseProgress 模型，不进 SM-2 |
| 入口 | 上传页与课程列表页分开两个入口 |
| 封面 | 可选上传；视频未传封面时前端截第一帧（video+canvas）存 jpeg |
| 专有名词样式 | 原位置正常颜色文字直接显示（非灰底），不要求输入 |
| 空格键流 | 空格跳下一框；最后一框空格自动比对：全对→变绿；有错→错词标红可改，对词变灰锁定 |
| 全对后 | 手动点"下一句"按钮或按回车进下一句 |

## 数据模型

```prisma
model Course {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  title     String
  mediaType MediaType  // AUDIO | VIDEO
  mediaPath String      // media/ 相对路径
  coverPath String?     // 可选封面
  durationMs Int
  status    CourseStatus @default(PROCESSING)  // PROCESSING | READY | FAILED
  error     String?
  transcript Json?      // 见下方结构
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  progress  CourseProgress?
  @@index([userId, status])
}

model CourseProgress {
  id           String @id @default(cuid())
  courseId     String @unique
  course       Course @relation(fields: [courseId], references: [id], onDelete: Cascade)
  userId       String
  user         User  @relation(fields: [userId], references: [id])
  sentenceIndex Int   @default(0)
  completedSentenceIds Int[] @default([])
  status       CourseProgressStatus @default(IN_PROGRESS)
  updatedAt    DateTime @updatedAt
  @@unique([userId, courseId])
}
```

transcript JSON 结构：

```ts
interface TranscriptSentence {
  idx: number
  text: string
  startMs: number
  endMs: number
  words: { text: string; isProperNoun: boolean }[]
}
```

## API 路由

| 路由 | 作用 |
|---|---|
| `POST /api/courses` | multipart 上传（media + 可选 cover + title）→ 存 `apps/web/media/<cuid>.<ext>` → 建 Course(PROCESSING) |
| `GET /api/courses` | 列表（含进度） |
| `GET /api/courses/[id]` | 详情（transcript + progress） |
| `DELETE /api/courses/[id]` | 删除课程（含媒体文件） |
| `POST /api/courses/[id]/transcribe` | 读文件 base64 → GLM-4.6-Flash 转写 → glm-5.1 标记专有名词 → 写 transcript，status=READY |
| `GET /api/courses/[id]/media` | 流式返回媒体文件，支持 HTTP Range（按句 seek 必需） |
| `GET /api/courses/[id]/cover` | 返回封面图 |
| `PUT /api/courses/[id]/progress` | 保存句子进度 |

全部首行 `requireAuth()`。

## 转写流水线

1. 前端把媒体文件（≤100MB）与可选封面 POST 到 `/api/courses`
2. 视频无封面时前端截第一帧 jpeg 一并上传
3. 上传成功后前端自动调 `POST /api/courses/[id]/transcribe`（转写 1-2 分钟，轮询详情 status）
4. 转写：OpenAI 兼容 chat completions，`input_audio` + `response_format: json_object`，prompt 要求 `{sentences:[{text,startMs,endMs}]}`
5. 专有名词标记：按 ~40 句一批调 glm-5.1，返回每句 words 数组（含 isProperNoun）
6. 写入 transcript，status=READY

## 页面

| 路由 | 内容 |
|---|---|
| `/courses` | 课程列表：封面卡片网格，标题/时长/句数/进度/状态；PROCESSING 卡片带"开始转写/重试" |
| `/courses/new` | 上传页：文件选择 + 可选封面 + 标题 → 上传后自动触发转写 → 轮询 → 完成后跳列表 |
| `/courses/[id]` | 学习页 |

侧边导航 navItems 增加 `{ href: "/courses", label: "Courses", icon: "GraduationCap" }`。

## 学习页交互（对照截图）

布局：顶部标题 + `第 N / M 句`；中间按词渲染（专有名词=纯文本，普通词=下划线输入框，宽度按词长）；底部三按钮：播放语音 / 提交 / 显示正确答案。

状态机（每句）：

1. 进入句子 → 自动连播两遍（`currentTime=startMs` 播到 `endMs` 后重复一次）→ 焦点第一个输入框
2. 输入按空格 → 跳下一框
3. 最后一框按空格 → 自动比对（normalize：去标点+lowercase）：
   - 全对 → 整句变绿，锁定；手动点"下一句"或按回车进入下一句
   - 有错 → 错词标红（保留用户输入，可改），对词变灰锁定；焦点到第一个错词
4. 修正后：最后一框空格或"提交"按钮重新比对（只比未锁定框）
5. "播放语音" → 再听两遍
6. "显示正确答案" → 所有框填入正确词，与用户输入不同的位置标红，锁定整句，可进下一句
7. 每句完成（全对或揭示）→ `PUT progress`；最后一句完成 → 课程 COMPLETED + 完成态 UI

播放实现：单个 `<audio>` 元素 seek 切句，不切分音频文件；倍速用 `playbackRate`。

## 明确不做（本切片）

- 口语模式（录音、跟读评分）
- ffmpeg 抽音轨/压缩（视频直接整体送转写，≤100MB）
- 听错词生成 Card 进 SM-2
- 对象存储
- 移动端适配优化（桌面优先）
