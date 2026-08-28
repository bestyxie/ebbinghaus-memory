# 转写进度可视化 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 上传音视频转写期间，前端分 4 阶段显示当前步骤与阶段内进度。

**Architecture:** 管道不动，三个转写函数加可选 `onProgress` 回调；route 在阶段刻度点写 `Course.transcribeStage/transcribeProgress`；`CourseSummary` 带出两字段；两个页面轮询既有 `/api/courses` 渲染 stepper。

**Tech Stack:** Next.js 15 route handlers · Prisma 7 migration · vitest（`__tests__` 布局，纯函数直测）· React state。

**设计文档:** `docs/plans/2026-08-28-transcribe-progress-design.md`

**约定:**
- 所有 `apps/web` 相对路径均相对 `/Users/zero/besty/frontend/ebbinghus-memory/apps/web`
- 测试命令一律在 `apps/web` 下执行：`pnpm vitest run __tests__/<file>`
- 禁 `any`/`as`/`!`/`@ts-ignore`（lint 强制）；lib 内不导入 React/Next.js
- 阶段顺序常量必须与 shared 的 `TRANSCRIBE_STAGES` 一致，单一来源

---

### Task 1: shared 阶段常量与类型

**Files:**
- Modify: `packages/shared/src/types.ts`（`CourseSummary` 处，约 :183）
- Test: `packages/shared/src/__tests__` 不存在——shared 无测试目录，本任务纯类型/常量，由 web 侧测试覆盖，不新建

**Step 1: 在 `packages/shared/src/types.ts` 的 `// === 课程听力学习 ===` 区块（:165 附近）加常量与类型**

```ts
/** 转写阶段 key（顺序即展示顺序；transcribeStage 为其中之一或 null） */
export const TRANSCRIBE_STAGES = ['ffmpeg', 'transcribe', 'mark', 'enrich'] as const
export type TranscribeStage = (typeof TRANSCRIBE_STAGES)[number]

/** 阶段 UI 文案（新建页 stepper 与列表页共用） */
export const TRANSCRIBE_STAGE_LABELS: Record<TranscribeStage, string> = {
  ffmpeg: '转换音频格式',
  transcribe: '语音转写',
  mark: '标记专有名词',
  enrich: '中文翻译 + 音标',
}
```

**Step 2: `CourseSummary` 接口追加两个字段（`error` 之后）**

```ts
  transcribeStage: TranscribeStage | null
  transcribeProgress: number
```

**Step 3: 类型检查确认无错误**

Run: `pnpm --filter shared type-check`（shared 为 raw-source 包无 build 脚本）
Expected: 通过

**Step 4: Commit**

```bash
git add packages/shared/src/types.ts
git commit -m "feat(shared): add transcribe stage constants and CourseSummary fields"
```

---

### Task 2: Prisma migration

**Files:**
- Modify: `apps/web/prisma/schema.prisma:302`（`status` 行后）
- Create: `apps/web/prisma/migrations/20260828000000_add_transcribe_progress/migration.sql`（用 prisma 命令生成，不手写）

**Step 1: schema `Course` 模型 `error String?` 之后加**

```prisma
  transcribeStage    String? // 当前转写阶段：ffmpeg | transcribe | mark | enrich；null = 非转写中
  transcribeProgress Int     @default(0) // 当前阶段内进度 0-100
```

**Step 2: 生成并应用 migration**

Run: `cd apps/web && npx prisma migrate dev --name add_transcribe_progress`
Expected: 生成 migration.sql（`ALTER TABLE "Course" ADD COLUMN "transcribeStage" TEXT, ADD COLUMN "transcribeProgress" INTEGER NOT NULL DEFAULT 0`），应用成功，client 重新生成

**Step 3: 验证列存在**

Run: `psql "postgres://postgres@localhost:5432/ebbinghus" -c '\d "Course"' | grep transcribe`
Expected: 两行 `transcribeStage | text |` 与 `transcribeProgress | integer | not null | default 0`

**Step 4: Commit**

```bash
git add apps/web/prisma/schema.prisma apps/web/prisma/migrations
git commit -m "feat(db): add Course.transcribeStage/transcribeProgress"
```

---

### Task 3: 管道函数 onProgress 回调（TDD）

**Files:**
- Modify: `apps/web/app/lib/course-transcribe.ts:290`（callGroqTranscription）、:624（markProperNouns）、:679（enrichTranscript）
- Test: `apps/web/__tests__/lib/course-transcribe.test.ts`（追加用例）

**Step 1: 写失败测试（追加到现有 describe 之后）**

```ts
describe('onProgress callbacks', () => {
  afterEach(() => vi.restoreAllMocks())

  it('markProperNouns 分批判 onProgress（批 i/总批数）', async () => {
    const sentences = Array.from({ length: 45 }, (_, i) => ({
      text: `Sentence ${i}`,
      startMs: i * 1000,
      endMs: i * 1000 + 900,
    }))
    vi.doMock('../../app/lib/course-transcribe', async (importOriginal) => {
      const mod = await importOriginal<typeof import('../../app/lib/course-transcribe')>()
      return { ...mod, runLLMChain: vi.fn().mockResolvedValue('{"marks":[]}') }
    })
    // runLLMChain 未导出 → 通过顶层 fetch mock 间接控制；45 句 = 3 批（20+20+5）
    global.fetch = vi.fn().mockResolvedValue(
      new Response('{"choices":[{"message":{"content":"{\\"marks\\":[]}"}}]}', { status: 200 }),
    )
    const seen: number[] = []
    const result = await markProperNouns(sentences, { onProgress: (f) => seen.push(f) })
    expect(result.error).toBeUndefined()
    expect(seen).toEqual([1 / 3, 2 / 3, 1])
  })

  it('enrichTranscript 分批判 onProgress（8 句/批）', async () => {
    const sentences = Array.from({ length: 9 }, (_, i) => ({
      idx: i,
      text: `Sentence ${i}`,
      startMs: 0,
      endMs: 100,
      words: [{ text: 'word', isProperNoun: false }],
    })) as TranscriptSentence[]
    global.fetch = vi.fn().mockResolvedValue(
      new Response('{"choices":[{"message":{"content":"{}"}}]}', { status: 200 }),
    )
    const seen: number[] = []
    await enrichTranscript(sentences, { onProgress: (f) => seen.push(f) })
    expect(seen).toEqual([1 / 2, 1])
  })
})
```

注意：`markProperNouns` 走 `runLLMChain` → Groq fetch，mock `global.fetch` 即可让每批成功（空 marks 降级为全 false 仍算批完成）；`enrichTranscript` 首句必须有 `idx` 且连续（applyEnrichment 按 idx splice）。若 Response 全局在测试环境不可用，用 `vi.stubGlobal('fetch', ...)`。转录辅助类型从 `@ebbinghaus/shared` 导入。

**Step 2: 跑测试确认失败**

Run: `pnpm vitest run __tests__/lib/course-transcribe.test.ts`
Expected: FAIL —— 两个函数尚无第二参数（TS 报错或 onProgress 未被调用、seen 为空）

**Step 3: 最小实现**

三个函数签名加可选参数（类型内联，不导出新类型）：

```ts
export async function markProperNouns(
  sentences: RawSentence[],
  opts?: { onProgress?: (fraction: number) => void },
): Promise<{ result: TranscriptSentence[]; error?: string }> {
```

- `markProperNouns`：批循环内 `opts?.onProgress?.((batchIndex + 1) / batches.length)`（for-of 拿不到下标，改 `for (let bi = 0; bi < batches.length; bi++)` 或在循环外维护计数器）
- `enrichTranscript`：同上，批完成时回调
- `callGroqTranscription`：签名加 `opts?: { onProgress?: (fraction: number) => void }`；分块路径 while 循环内每块完成后 `opts?.onProgress?.(Math.min(1, chunkEnd / totalSec))`；整段路径不回调（无刻度）

**Step 4: 跑测试确认通过**

Run: `pnpm vitest run __tests__/lib/course-transcribe.test.ts`
Expected: PASS（含既有用例全绿）

**Step 5: 类型检查**

Run: `pnpm --filter web exec tsc --noEmit`（或仓库 `pnpm --filter web type-check`）
Expected: 无错误（enrich route 不传 opts 仍兼容）

**Step 6: Commit**

```bash
git add apps/web/app/lib/course-transcribe.ts apps/web/__tests__/lib/course-transcribe.test.ts
git commit -m "feat(transcribe): onProgress callbacks on pipeline stages"
```

---

### Task 4: transcribe route 写进度

**Files:**
- Modify: `apps/web/app/api/courses/[id]/transcribe/route.ts`

route 是 IO 编排层，沿用仓库惯例不单测（`__tests__/api/` 只测有纯逻辑抽出的路由），进度写入逻辑简单直接。

**Step 1: 阶段推进写入。在 `route.ts` 对应位置：**

- :43 重置处改：

```ts
await prisma.course.update({
  where: { id },
  data: { status: 'PROCESSING', error: null, transcribeStage: 'ffmpeg', transcribeProgress: 0 },
})
```

- ffmpeg 前（:52 `toStandardWav` 调用处前后）：

```ts
const wav = await toStandardWav(absoluteMediaPath(course.mediaPath))
// ffmpeg 完成 → 进入转写阶段
await prisma.course.update({
  where: { id },
  data: { transcribeStage: 'transcribe', transcribeProgress: 0 },
})
```

- :53 `callGroqTranscription` 加回调：

```ts
let transcription = await callGroqTranscription({ buffer, mime }, wav ?? undefined, {
  onProgress: (f) => {
    prisma.course
      .update({ where: { id }, data: { transcribeProgress: Math.round(f * 100) } })
      .catch(() => {}) // 进度写失败不中断转写
  },
})
```

- :96 `markProperNouns` 前/调用：

```ts
await prisma.course.update({ where: { id }, data: { transcribeStage: 'mark', transcribeProgress: 0 } })
const marked = await markProperNouns(clamped, {
  onProgress: (f) => {
    prisma.course.update({ where: { id }, data: { transcribeProgress: Math.round(f * 100) } }).catch(() => {})
  },
})
```

- :110 `enrichTranscript` 前/调用同理，stage 换 `'enrich'`

- :118 成功落库处加：

```ts
transcribeStage: null,
transcribeProgress: 100,
```

- :45 之前 catch/FAILED 路径（:68 与 :136）加 `transcribeStage: null`（失败不清 progress，保留现场供排查——失败态 UI 不展示进度条，仅展示 error）

**Step 2: 手动验证（真实跑一次转写）**

1. `pnpm --filter web dev` 启动
2. 测试账号登录（test@test.com / 1234567890）
3. 上传一段 ~1 分钟音频，提交后立刻轮询：

Run: `for i in $(seq 1 30); do psql "postgres://postgres@localhost:5432/ebbinghus" -tc "SELECT status, \"transcribeStage\", \"transcribeProgress\" FROM \"Course\" ORDER BY \"createdAt\" DESC LIMIT 1"; sleep 5; done`
Expected: 依次观察到 `(PROCESSING, ffmpeg, 0)` → `(PROCESSING, transcribe, 递增)` → `(mark, 递增)` → `(enrich, 递增)` → `(READY, null, 100)`

**Step 3: Commit**

```bash
git add apps/web/app/api/courses/[id]/transcribe/route.ts
git commit -m "feat(transcribe): persist stage/progress during pipeline"
```

---

### Task 5: CourseSummary 透出 + 列表 API

> 偏差修正（Task 1 执行记录）：Task 1 加 CourseSummary 必填字段会先破坏 web type-check（toSummary 构造点在 :144 报缺字段），已推迟到本任务与 web 侧一起落地。

**Files:**
- Modify: `packages/shared/src/types.ts:195`（CourseSummary 接口，`error` 后加两字段）
- Modify: `apps/web/app/api/courses/route.ts:124`（toSummary 签名与返回）

**Step 0: CourseSummary 接口追加（Task 1 推迟项）**

```ts
  transcribeStage: TranscribeStage | null
  transcribeProgress: number
```

**Step 1: toSummary 入参类型加两字段、返回加两字段**

入参对象类型追加：

```ts
    transcribeStage: string | null
    transcribeProgress: number
```

返回追加：

```ts
    transcribeStage: (TRANSCRIBE_STAGES as readonly string[]).includes(course.transcribeStage ?? '')
      ? (course.transcribeStage as TranscribeStage)
      : null,
    transcribeProgress: course.transcribeProgress,
```

`includes` 守卫把 DB 任意字符串收窄为合法 stage（僵尸/历史脏数据不炸前端）。`TRANSCRIBE_STAGES`、`TranscribeStage` 从 `@ebbinghaus/shared` import。注意项目禁 `as`——若 lint 报 `as TranscribeStage`，改用类型守卫函数：

```ts
function isTranscribeStage(v: string | null): v is TranscribeStage {
  return v !== null && (TRANSCRIBE_STAGES as readonly string[]).includes(v)
}
```

返回处 `transcribeStage: isTranscribeStage(course.transcribeStage) ? course.transcribeStage : null`。（守卫函数为纯函数，放本文件顶部即可。）

**Step 2: 既有测试回归**

Run: `pnpm vitest run __tests__/api` 
Expected: PASS（courses 相关如有快照/断言需补两字段）

**Step 3: curl 验证**

Run: 先登录拿 cookie，再 `curl -s -b cookie.txt http://localhost:3000/api/courses | head -c 400`
Expected: 每项含 `"transcribeStage":null,"transcribeProgress":100`（存量 READY 课程）

**Step 4: Commit**

```bash
git add apps/web/app/api/courses/route.ts
git commit -m "feat(api): expose transcribe stage/progress in CourseSummary"
```

---

### Task 6: 新建页 stepper

**Files:**
- Modify: `apps/web/app/(pages)/courses/new/new-course-client.tsx:143`（transcribing 阶段渲染）

无既有组件测试基建（页面组件零测试），沿用惯例手测 + `agent-browser` 自体验自验证（CLAUDE.md 要求）。

**Step 1: 转写期轮询。`submit()` 改为：触发转写后不 await 到底，同时启动轮询**

```tsx
const [stageInfo, setStageInfo] = useState<{ stage: TranscribeStage; progress: number } | null>(null)

// submit() 内，替换原 await transcriptRes 段：
setPhase('transcribing')
setStageInfo({ stage: 'ffmpeg', progress: 0 })
const transcriptRes = await fetch(`/api/courses/${uploadData.course.id}/transcribe`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ durationMs }),
})
if (!transcriptRes.ok) {
  const d: { error?: string } = await transcriptRes.json().catch(() => ({}))
  throw new Error(d.error ?? '转写失败')
}
router.push('/courses')
```

POST 本身仍同步等（成功即跳转，失败即报错）；进度条靠并行的轮询 interval 驱动：

```tsx
useEffect(() => {
  if (phase !== 'transcribing' || !courseId) return
  const timer = setInterval(async () => {
    try {
      const res = await fetch('/api/courses')
      if (!res.ok) return
      const data: { courses: CourseSummary[] } = await res.json()
      const c = data.courses.find((x) => x.id === courseId)
      if (c?.transcribeStage) setStageInfo({ stage: c.transcribeStage, progress: c.transcribeProgress })
    } catch { /* 轮询失败静默，下轮重试 */ }
  }, 2000)
  return () => clearInterval(timer)
}, [phase, courseId])
```

`courseId` 需新增 state（上传成功后 `setCourseId(uploadData.course.id)`）。`CourseSummary`/`TranscribeStage`/`TRANSCRIBE_STAGES`/`TRANSCRIBE_STAGE_LABELS` 从 `@ebbinghaus/shared` import。

**Step 2: stepper 渲染（替换现有"转写中"提示区）**

```tsx
{phase === 'transcribing' && (
  <div className="mb-4 p-4 bg-blue-50/50 border border-blue-200 rounded-lg">
    <div className="flex items-center gap-2">
      {TRANSCRIBE_STAGES.map((s) => {
        const idx = TRANSCRIBE_STAGES.indexOf(s)
        const cur = TRANSCRIBE_STAGES.indexOf(stageInfo?.stage ?? 'ffmpeg')
        const done = idx < cur
        const active = idx === cur
        return (
          <div key={s} className="flex items-center gap-2">
            {idx > 0 && <div className={`h-0.5 w-6 ${done || active ? 'bg-blue-400' : 'bg-gray-200'}`} />}
            <div className={`flex items-center gap-1.5 text-xs ${active ? 'text-blue-700 font-medium' : done ? 'text-green-700' : 'text-gray-400'}`}>
              {done ? <CheckCircle2 className="w-4 h-4" /> : active ? <Loader2 className="w-4 h-4 animate-spin" /> : <div className="w-4 h-4 rounded-full border border-gray-300" />}
              {TRANSCRIBE_STAGE_LABELS[s]}
            </div>
          </div>
        )
      })}
    </div>
    {/* 阶段内进度：0% 且无刻度阶段显示不定进度动画 */}
    {stageInfo && (
      <div className="mt-3 h-1.5 bg-blue-100 rounded overflow-hidden">
        <div
          className={`h-full bg-blue-500 rounded transition-all duration-500 ${stageInfo.progress > 0 ? '' : 'animate-pulse w-1/3'}`}
          style={stageInfo.progress > 0 ? { width: `${stageInfo.progress}%` } : undefined}
        />
      </div>
    )}
  </div>
)}
```

`CheckCircle2` 从 `lucide-react` 补 import。

**Step 3: 手动验证（agent-browser）**

上传 ~1 分钟音频，观察 stepper 逐阶段推进、进度条随分块增长、完成后跳转 /courses。

**Step 4: Commit**

```bash
git add apps/web/app/\(pages\)/courses/new/new-course-client.tsx
git commit -m "feat(ui): transcribe stepper on new course page"
```

---

### Task 7: 列表页进度展示

**Files:**
- Modify: `apps/web/app/(pages)/courses/courses-client.tsx:136-140`（StatusBadge PROCESSING 分支）

**Step 1: 待转写/转写中徽章区分（卡片级，无 stepper，一行文案足够）**

StatusBadge 的 PROCESSING 分支（:136）改为：

```tsx
if (course.transcribeStage) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
      <Loader2 className="w-3 h-3 animate-spin" />
      {TRANSCRIBE_STAGE_LABELS[course.transcribeStage]}
      {course.transcribeProgress > 0 ? ` ${course.transcribeProgress}%` : ''}
    </span>
  )
}
return (
  <span className="inline-flex items-center gap-1 text-xs text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">
    <Loader2 className="w-3 h-3 animate-spin" /> 待转写
  </span>
)
```

import `TRANSCRIBE_STAGE_LABELS`。既有 5s 轮询（:174-181）自动喂养。

**Step 2: agent-browser 验证**：转写中课程卡片显示"语音转写 45%"式徽章并随轮询更新；僵尸清扫逻辑不受影响（超时 → FAILED 徽章）。

**Step 3: Commit**

```bash
git add apps/web/app/\(pages\)/courses/courses-client.tsx
git commit -m "feat(ui): show transcribe stage progress on course cards"
```

---

### Task 8: 全量回归

**Step 1:** `pnpm type-check && pnpm test && pnpm lint`
Expected: 全绿

**Step 2:** `pnpm --filter web build`
Expected: 构建成功

**Step 3:** Commit（如有 lint 自动修复产生的变更）

```bash
git add -A && git commit -m "chore: transcribe progress regression pass"
```
