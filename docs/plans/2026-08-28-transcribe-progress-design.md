# 转写进度可视化 · 设计文档

日期：2026-08-28

## 问题

上传音视频后转写同步等待 1-2 分钟（`maxDuration=300`），无任何进度反馈；列表页重试入口同样只有"转写中…"。

## 方案（已选定：DB 进度字段 + 前端轮询）

管道执行模型不动，各阶段刻度点写 DB，前端轮询既有 `/api/courses` 渲染分步进度。已否决：SSE（列表页没人在听流、断连失明）、`after()` 后台任务（自托管重启丢任务、改动大）。

## 数据模型

`Course` 加两列（一次 migration）：

```prisma
transcribeStage    String?  // ffmpeg | transcribe | mark | enrich；非转写中为 null
transcribeProgress Int     @default(0)  // 当前阶段内 0-100
```

命名避开已被学习进度关联占用的 `progress`。

## 阶段定义（顺序固定，前端 stepper 依据）

| # | stage | UI 文案 | 阶段内刻度 |
|---|---|---|---|
| 1 | `ffmpeg` | 转换音频格式 | 无 → 不定进度 |
| 2 | `transcribe` | 语音转写 | 分块：`cursorSec/totalSec`；整段上传无刻度 → 不定进度 |
| 3 | `mark` | 标记专有名词 | 批 i/总批数（20 句/批） |
| 4 | `enrich` | 中文翻译 + 音标 | 批 i/总批数（8 句/批） |

## 上报机制

- `callGroqTranscription` / `markProperNouns` / `enrichTranscript` 加可选 `onProgress?(fraction: number)` 回调
- route：阶段开始写 `stage`（progress 归 0），回调触发只更新 `progress`；成功时 stage=null、progress=100；失败/重试重置
- 阶段常量与文案映射放 `packages/shared`（跨端 + 前后端共用）

## API

不新增路由。`CourseSummary` 增加 `transcribeStage: string | null`、`transcribeProgress: number`，`/api/courses` 列表返回，两页面共用。

## 前端

- 新建页（`new-course-client.tsx`）：转写期间 stepper——已完成 ✓ 绿 / 进行中蓝（阶内 % 条或转圈）/ 待进行灰
- 列表页（`courses-client.tsx`）：卡片"转写中…"改为当前阶段文案 + 阶内 %（既有 5s 轮询喂养）
- 无刻度阶段（ffmpeg、整段转写）显示不定进度动画，不显示假百分比

## 边角

- 429 限流等 60s：进度停滞，阶段文案已说明在干什么，不特殊处理
- 僵尸判定沿用 `isZombieProcessing`（updatedAt 超时）；进度写入会刷新 updatedAt
- enrich 独立路由（`[id]/enrich`）复用同一批函数，回调可选项不传即零影响
