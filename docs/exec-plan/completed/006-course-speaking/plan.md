# 课程口语学习：逐句朗读录音评分 + 逐词详情

本 ExecPlan 是活文档。Progress、Surprises & Discoveries、Decision Log、
Outcomes & Retrospective 章节必须随工作进展保持更新。

本文档遵循 docs/exec-plan/PLANS.md 规范。
任务拆分遵循 docs/exec-plan/TASKS.md 规范。

术语表：`CONTEXT.md`（课程学习语境，grilling 会话已建）。
ADR：`docs/adr/0001-pronunciation-scoring-engine.md`。

## Purpose / Big Picture

全局目标：课程模块双轨制——听力（逐句听写）与口语（逐句朗读录音评分）两种并列的学习轨道，各自独立进度，一门课程两种练法。

当前现状：005-course-listening 已完成听力闭环。`Course`/`CourseProgress` 模型已迁移；转写产出逐句文本 + 句级时间戳 + 专有名词标记（Groq whisper 主，mimo 回落）；列表页"开始/继续学习"直接跳转 `/courses/[id]`（听力页）。卡片系统已有 input/output 双轨先例，本计划把同构思想引入课程。

本计划范围：口语学习闭环，仅 web——(1) transcript 富化：词级时间戳 + 逐词音标 + 逐句中译；(2) 新模型 `SpeakingProgress`（每用户每课程每难度）；(3) 评分引擎抽象 `ScoreProvider`（引擎延后，先 mock 打通闭环）；(4) 录音采集（按住 space/鼠标录，松开停，0.5s~120s，静音报错）；(5) 口语学习页：难度呈现 → 录音 → 评分展示（原文 + 逐词分 + 录音回放）→ 逐词弹窗（音标 + 原音频 + 用户录音片段）→ 重录记最高综合分 → 每难度完成页；(6) 课程列表"开始/继续学习"弹窗：听力入口 + 三难度口语入口（各带进度）。

**不含**：真实评分引擎接入（Azure/Qwen-Omni 选型，ADR 0001 已记录）、移动端、口语结果进 SM-2、逐词评分持久化。

无前序计划方向偏差需要修正。005 遗留约束：PG10 与本机 Prisma shadow DB 不兼容，迁移沿用"手写 SQL + migrate deploy"（见 005 plan Surprises）。

## Progress

- [x] (2026-08-18) T1: 数据模型 + shared schema + 迁移 — 完成；shared 44 测试 + web 136 单测 + type-check + lint 全绿；迁移已 deploy 入库（psql 验证）
- [x] (2026-08-18) T2: 转写流水线富化 + enrich 路由 — 完成；Groq 词级时间戳 + LLM 中译/音标 + enrich 幂等路由；145 web 单测 + 44 shared 单测 + lint/type-check 全绿；真实课程 enrich/重转写集成验证通过
- [x] (2026-08-18) T3: ScoreProvider 抽象 + mock + 评分/进度 API — 完成；156 web 单测 + 45 shared 单测 + lint/type-check 全绿；curl 集成验证通过（评分落库/重录最高分/COMPLETED/三难度进度）
- [x] (2026-08-18) T4: 口语学习页 — 完成；agent-browser 三难度/录音评分/逐词弹窗/续学/完成页实测通过；录音 hook 两个 bug 由 E2E 揪出修复
- [x] (2026-08-18) T5: 课程列表弹窗入口 — 完成；agent-browser 弹窗三状态标签（开始/继续/已完成）与难度直达实测通过

## Surprises & Discoveries

- Observation: Groq 同时请求 segment+word 粒度时，词级时间戳在**顶层 `words`**（`[{word,start,end}]`），不在 `segments[].words`。初版按 segment 内解析返回 0 词，改为 `parseGroqResponse` + `assignWordsToSentences` 按词起点归属句。
  Evidence: 直接 curl Groq 打 seg0 无 `words` 键、顶层 `words` 有 100+ 项；修复后重跑回填 248 词时间戳。
- Observation: better-auth 会话 cookie = `rawToken.HMAC-SHA256(rawToken, AUTH_SECRET) base64`（非 base64url）；且 middleware 只认 cookie 会话，Bearer token 请求 /api/courses 会 307 到 /login（route 内 requireAuth 支持 Bearer，但 middleware 先行拦截）。
  Evidence: 手工签发 cookie（`session` 表插入 raw token + HMAC 签名）后 /api/auth/get-session 返回用户；纯 Bearer curl 得 307。
- Observation: enrich 幂等需按"跑过一次即算补齐"判定词级时间戳：个别词（跨句重对齐失败）匹配不上属正常降级（客户端按比例估算），若按"任一词缺"判定会每次重跑 Groq 浪费 ~20s。
  Evidence: 第三次 enrich 调用 20.8s 返回 enriched:true；改为 anyWordTs 判定后 0.29s 返回 enriched:false。
- Observation: 本环境 Groq API 可达（chat 200）；转写整课（95s 音频分块 + LLM 富化）耗时 ~300s，主要在各 LLM 批次与限流退避。
- Observation: 长期运行的 dev server 持有旧的 Prisma client（进程启动早于 `prisma generate`），新增模型的路由（`prisma.speakingProgress`）在重启前一直 500。新增模型后需重启 dev server。
  Evidence: 进程 lstart Aug 16、client 生成 Aug 18 12:27；重启后 GET/POST speak 正常。
- Observation: shared `speakingProgressSchema.bestScores` 全 number 时，含 null 的稀疏数组校验失败，接口回退成 null——改为允许 null 元素。
- Observation: 录音 hook 的 onstop 里 `cleanupStream()`（清空 chunksRef）先于 `new Blob(chunksRef)` 执行 → 永远报"未检测到语音"；且 `isRecording` 未在 onstop 复位 → 麦克风按钮永久"正在录音…"。agent-browser + Fake MediaRecorder 桩驱动录音全流程才暴露。
  Evidence: 真机录音 1.5s 桩 blob 100KB 仍报"未检测到语音"；修复顺序后评分全链路通。
- Observation: gstack browse `eval` 对含 `await` 的脚本走块包裹（`(async()=>{code})()`）丢弃返回值 → 异步脚本用 Promise 链写；browse 每次调用重启 server，cookie/标签不跨调用 → 全流程必须单条 `chain`（cookie-import→goto→eval→snapshot）。
  Evidence: 含 await 的 eval 返回空；改 Promise 链后返回正常；分两次调用 cookie 丢失跳 /login。

（随执行继续填充。计划阶段已知事实：转写管线仅请求 `timestamp_granularities[]=segment`，无词级时间戳——这是富化步骤的出发点。）

## Decision Log

- Decision: 口语录音单元为单句，镜像听力的逐句结构
  Rationale: 用户 grilling 确认。与听力页逐句推进一致，评分粒度清晰。
  Date/Author: 2026-08-18 / grilling

- Decision: 难度 = 提示程度。简单=显示原文+自动播放+手动重播；中等=提示"请根据记忆说出英文"+自动播放+手动重播；困难=仅显示中文译文+手动播放
  Rationale: 用户 grilling 确认。难度不改材料、不改评分标准，只改录音前可见/可听内容。
  Date/Author: 2026-08-18 / grilling

- Decision: 评分引擎抽象为 `ScoreProvider` 接口（录音+目标文本 → 逐词评分与录音内偏移+综合评分），引擎选型延后
  Rationale: 用户 grilling 确认。转写置信度 ≠ 发音准确度（ADR 0001）。接口先立，本计划用 mock 打通闭环。
  Date/Author: 2026-08-18 / grilling

- Decision: 中文译文在转写时用 LLM 预翻译存入 transcript；已存在的 READY 课程走 enrich 路由补富化
  Rationale: 用户确认"转写时预翻译"。一次性成本，困难难度直接读。存量课程不能重转写全部，需轻量补料。
  Date/Author: 2026-08-18 / grilling

- Decision: 口语进度独立新表 `SpeakingProgress`（每用户每课程每难度），不复用 CourseProgress
  Rationale: 用户确认。听力/口语双轨同构卡片 input/output；复用会在单行混合两种状态与历史分数，脏。
  Date/Author: 2026-08-18 / grilling

- Decision: 只持久化综合评分（各句历史最好成绩）；逐词评分仅当次展示；录音不持久化（仅当前句会话内 Blob URL，重录替换）
  Rationale: 用户确认。逐词分数据量大且仅用于即时反馈；录音属隐私且无回看场景。
  Date/Author: 2026-08-18 / grilling

- Decision: 一句可无限重录，记最高综合分；完成 = 该难度全部句子至少录过一遍（不设分数门槛），按难度分别算完成，有完成页
  Rationale: 用户确认。鼓励练习而非追求一次完美；与听力"逐句做完"对称。
  Date/Author: 2026-08-18 / grilling

- Decision: 逐词弹窗含音标（转写时 LLM 预生成 IPA）+ 原音频（词级时间戳，mimo 回落按字符占比估算）+ 用户录音片段（评分引擎返回录音内偏移）
  Rationale: 用户确认。音标零请求成本随转写生成；词级时间戳由 Groq word granularity 提供。
  Date/Author: 2026-08-18 / grilling

- Decision: 录音边界：最短 0.5s（报提示不评分），最长 120s 自动截断；静音/无词可识别报错可重录
  Rationale: 用户确认。
  Date/Author: 2026-08-18 / grilling

- Decision: ScoreProvider 接口增加 `durationMs` 输入（客户端上报录音时长）
  Rationale: mock 与真实引擎都需要时长来铺词级录音内偏移；客户端在 MediaRecorder 停止时已知时长。
  Date/Author: 2026-08-18 / claude

- Decision: `SpeakingProgress.bestScores` 为按句 idx 对齐的稀疏数组（null = 未录），schema 允许 null 元素
  Rationale: 与"只存综合分最好成绩"一致；避免对象 map 的序列化噪音。曾因 schema 全 number 导致校验回退 null（见 Surprises）。
  Date/Author: 2026-08-18 / claude

- Decision: 课程列表"开始/继续学习"改为弹窗：听力按钮 + 三个难度按钮（各显进度 x/y 句与开始/继续），难度在弹窗选择后直达口语页
  Rationale: 用户确认。
  Date/Author: 2026-08-18 / grilling

## Outcomes & Retrospective

成果：课程口语学习闭环全链路上线——transcript 富化（Groq 词级时间戳 + LLM 逐句中译 + 逐词 IPA，存量课程经 enrich 幂等补全）→ `SpeakingProgress`（每用户每课程每难度，重录记最高综合分）→ `ScoreProvider` 抽象（mock 默认打通闭环，真实引擎按 ADR 0001 后续接入）→ 口语学习页（三难度提示、按住 space/鼠标录音、评分展示逐词角标+录音回放、逐词弹窗音标+原音频+录音片段、续学、完成页）→ 课程列表弹窗双轨入口（听力 + 三难度带进度）。156 web 单测 + 45 shared 单测 + type-check + lint 全绿；agent-browser 真实浏览器端到端验证通过（含用 Fake MediaRecorder 桩驱动录音全流程）。

差距与经验：
1. 评分引擎是 mock——真实发音评分（Azure/Qwen-Omni）未接入，逐词分数对真实发音无意义，属预期后续工作（ADR 0001 已定接口与取舍）。
2. Groq 词级时间戳在"segment+word 同请求"时落在顶层 `words` 而非 segment 内——初版解析踩坑，`parseGroqResponse` 已固化；mimo 回落无词级时间戳（客户端按字符占比估算播放）。
3. 录音 hook 的 E2E 驱动揪出两个仅靠单测不可见的真 bug（chunks 清理顺序、isRecording 不复位）——再次验证"必须浏览器实测"的价值。
4. gstack browse 每次调用重启 server + eval 含 await 丢返回值——浏览器验证流程必须单条 chain + Promise 链脚本，这是本环境的事实约束。

对比原始目标：口语学习 MVP 完整交付。真实评分引擎、移动端、口语进 SM-2、逐词评分持久化均未做（明确 out of scope）。

## Context and Orientation

### 现状落点（假设读者一无所知）

- Prisma schema：`apps/web/prisma/schema.prisma`。`Course`（mediaType/mediaPath/durationMs/status/transcript Json）、`CourseProgress`（每用户每课程，sentenceIndex + completedSentenceIds + status）、枚举 `MediaType/CourseStatus/CourseProgressStatus`。
- shared：`packages/shared/src/zod.ts` 定义 `transcriptWordSchema`（text + isProperNoun）、`transcriptSentenceSchema`（idx/text/startMs/endMs/words）、`transcriptSchema`、`updateCourseProgressSchema`；`types.ts` 导出 `CourseSummary` 等。
- 转写流水线：`apps/web/app/lib/course-transcribe.ts`。`callGroqTranscription`（verbose_json，`timestamp_granularities[]=segment`，分块 25s+2s 重叠去重）、`callTranscriptionModel`（mimo 回落）、`calibrateTimestamps`（mimo 时间轴线性校准）、`markProperNouns`（Groq gpt-oss-120b 主 / zen deepseek 回落 / glm-5.1 兜底，20 句/批）。转写路由：`apps/web/app/api/courses/[id]/transcribe/route.ts`（ffmpeg 转 16kHz wav → 分块 → 校准 → 专有名词 → 写 transcript）。媒体流：`apps/web/app/api/courses/[id]/media/route.ts`（Range 206）。
- 页面：列表 `apps/web/app/(pages)/courses/courses-client.tsx`（"开始学习/继续学习" 是 `<Link href=/courses/[id]>`）；听力学习页 `apps/web/app/(pages)/courses/[id]/learn-client.tsx` + `use-sentence-audio.ts`（单 audio seek 句区间连播）。
- LLM 通道：`apps/web/app/lib/ai-provider.ts`（opencode.ai zen 端点，glm-5.1 兜底）；Groq key 与 free 模型走 `fetch` 直连。
- 迁移方式：PG10 无 shadow DB 支持 → 手写 SQL + `prisma migrate deploy`（`apps/web/prisma/migrations/<ts>_add_*`，ts 格式 `YYYYMMDD000000`）。

### 相关已完成计划

- 005-course-listening（plan-summary 要点）：上传→转写→听写闭环；mimo-v2.5 为端点唯一可用音频模型；手写 SQL 迁移法确立；错词红/对绿/专有名词免输/完成页。

## Plan of Work

五个纵向切片，每个切片内部"类型 + 实现 + 测试"做通。任务按此顺序推进，每完成一个重新审视下一个。

1. **T1 数据模型 + shared schema**：`transcriptWordSchema` 增 `phonetic`/`startMs`/`endMs`（均可空，兼容存量 transcript）；`transcriptSentenceSchema` 增 `translation`（可空）；新增 `scoreResultSchema`（overall + words[{text, score, startMs?, endMs?}]）；新增 `SpeakingDifficulty` 枚举与 `SpeakingProgress` Prisma 模型（bestScores Json 存各句最好综合分，按句 idx 对齐）；User/Course 加反向关系；手写迁移 SQL + migrate deploy。同步更新既有 course-schema 测试。
2. **T2 转写流水线富化 + enrich 路由**：Groq 请求加 `timestamp_granularities[]=word`，把词级时间戳并入 words；新增 `enrichTranscript`（LLM 批量为逐句出中文译文 + 逐词 IPA，复用 Groq→zen→glm 链，按词对齐，失败降级字段留空）；转写路由收尾调用；新增 `POST /api/courses/[id]/enrich`（存量 READY 课程补富化，幂等：已富化直接返回）。
3. **T3 ScoreProvider + 评分/进度 API**：`app/lib/score-provider.ts` 定义接口 `scoreRecording({ audio, mime, referenceText }) → Promise<ScoreResult>`；env `SCORE_PROVIDER=mock|...` 选实现，先实现 `mock`（按录音时长生成确定性分数与按比例偏移，供联调）；`POST /api/courses/[id]/speak`（multipart：audio+sentenceIdx+difficulty+referenceText → 校验 → ScoreProvider → 更新 SpeakingProgress 最好成绩 → 返回 ScoreResult + progress）；`GET /api/courses/[id]/speak`（返回三难度进度）。
4. **T4 口语学习页**：`use-hold-recording.ts`（getUserMedia + MediaRecorder，pointer/space 按住录松开停，0.5s 下限、120s 上限、静音/空内容检测、Blob URL 回放）；`speak-client.tsx`（/courses/[id]/speak?level=）：按难度呈现（简单原文+自动播+重播 / 中等提示语+自动播+重播 / 困难中文+手动播），录音 → 评分 → 展示原文 + 逐词分数角标 + 综合分 + 录音回放 + 重录；逐词可点 → 弹窗（音标 + 原音频 seek 词区间 + 录音内偏移片段）；句推进 + 进度持久化 + 续学；全句录完 → 完成页（本次综合分 + 历史最佳 + 各句成绩一览 + 返回/换难度）。
5. **T5 列表弹窗入口**：`courses-client.tsx` 的"开始学习/继续学习"改为打开 modal：听力学习按钮（按 CourseProgress 标开始/继续）+ 口语学习三难度按钮（按 SpeakingProgress 标 x/y 句与开始/继续），点击直达对应页面。

## Validation and Acceptance

验收命令（仓库根目录执行）：

    pnpm type-check          # turbo 全仓类型检查，预期全绿
    pnpm lint                # turbo 全仓 lint，预期全绿
    pnpm --filter web test   # vitest，新增/更新测试全过
    pnpm --filter @ebbinghaus/shared test

端到端验收（agent-browser，CLAUDE.md 要求）：

1. 登录 → `/courses` → 对已 READY 课程点"开始学习" → 弹窗出现"听力学习"+ 三个难度按钮（各显示 0/N 句）。
2. 选"简单" → `/courses/[id]/speak?level=easy`：显示原文并自动播放；按住 space 录音（≥0.5s）松开 → 显示原文逐词分数角标 + 综合分 + 录音回放按钮；点击某词 → 弹窗显示音标、可播放原音频与该词录音片段。
3. 录完一句进下一句；全部录完 → 完成页显示本次综合分 + 历史最佳 + 各句成绩。
4. 刷新页面 → 口语进度保留（继续学习从上次句号续）；返回列表 → 弹窗中该难度显示 N/N 已完成。
5. 难度切换（困难）→ 显示中文译文，手动播放，无自动播；无译文课程的困难难度降级提示。
6. 边界：录 <0.5s 报提示不评分；静音录音报错可重录；录音 ≥120s 自动截断。

## Idempotence and Recovery

- 迁移 SQL 幂等：`migrate deploy` 天然可重复；新枚举/新表用 `CREATE TYPE IF NOT EXISTS`/`CREATE TABLE IF NOT EXISTS` 风格手写（参考 005 迁移），失败回滚 = 删除该迁移目录 + 恢复 schema.prisma 后重跑。
- enrich 路由幂等：transcript 已含 translation/phonetic 时直接返回，不重复调用 LLM。
- 评分 API 幂等：重复 POST 同一句 = 重录语义，bestScores 取更高分，无副作用。
- 录音采集失败（无麦克风权限）：页面提示并停留在当前句，不丢进度。

## Interfaces and Dependencies

### 新 Zod schemas（`packages/shared/src/zod.ts`）

    transcriptWordSchema = z.object({
      text, isProperNoun,
      phonetic: z.string().nullable().optional(),       // IPA，富化生成
      startMs: z.number().int().min(0).nullable().optional(),  // 原音频词区间
      endMs: z.number().int().min(0).nullable().optional(),
    })
    transcriptSentenceSchema = z.object({
      idx, text, startMs, endMs, words,
      translation: z.string().nullable().optional(),    // 中译文，困难难度
    })
    scoreWordResultSchema = z.object({
      text, score: 0-100,
      startMs: z.number().int().min(0).nullable().optional(),  // 录音内偏移
      endMs: z.number().int().min(0).nullable().optional(),
    })
    scoreResultSchema = z.object({ overall: 0-100, words: scoreWordResultSchema[] })
    speakingProgressSchema = z.object({
      difficulty: 'EASY'|'MEDIUM'|'HARD',
      sentenceIndex, completedSentenceIds, status,
      bestScores: z.array(z.number().min(0).max(100)).nullable(),  // 按句 idx 对齐
    })

### 新 Prisma 模型（`apps/web/prisma/schema.prisma`）

    enum SpeakingDifficulty { EASY MEDIUM HARD }
    model SpeakingProgress {
      id, courseId, userId, difficulty,
      sentenceIndex Int @default(0),
      bestScores Json?,          // number[] 各句最好综合分，缺省=未录
      completedSentenceIds Int[] @default([]),
      status CourseProgressStatus @default(IN_PROGRESS),
      updatedAt,
      @@unique([userId, courseId, difficulty])
    }
    // User / Course 各加 speakingProgresses 反向关系

### ScoreProvider 接口（`apps/web/app/lib/score-provider.ts`）

    interface ScoreProvider {
      scoreRecording(input: {
        audio: Blob | Buffer
        mime: string
        referenceText: string
      }): Promise<{ overall: number; words: { text: string; score: number; startMs: number | null; endMs: number | null }[] }>
    }
    // 实现选择：process.env.SCORE_PROVIDER ?? 'mock'；后续 Azure/Qwen-Omni 各自成实现文件

### 新 API 路由

    POST /api/courses/[id]/speak     // multipart: audio + sentenceIdx + difficulty + referenceText → { result, progress }
    GET  /api/courses/[id]/speak     // → { progress: SpeakingProgress[3] }
    POST /api/courses/[id]/enrich    // 存量课程补富化 → { enriched: boolean }

### 依赖说明

- 无新增 npm 依赖。录音用浏览器原生 `getUserMedia` + `MediaRecorder`（webm/opus，Safari 回落 audio/mp4）。
- LLM 富化复用现有 Groq free / zen / glm-5.1 链（同 markProperNouns 模式）。
- 评分引擎真实接入（Azure/Qwen-Omni）为后续独立工作，本计划以 mock 打通全链路。