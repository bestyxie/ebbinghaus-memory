# T2: 转写流水线富化 + enrich 路由

**Status**: done
**Started**: 2026-08-18
**Completed**: 2026-08-18

## 目标

做完后：新转写（含存量课程触发 enrich）的 transcript 每句带 `translation`（中译文）、每词带 `phonetic`（IPA）与词级 `startMs/endMs`（原音频逐词播放用）；Groq 主通道走 word granularity 真实词级时间戳，mimo 回落时词级时间戳为 null（客户端估算）。新增 `POST /api/courses/[id]/enrich`，对已 READY 的存量课程幂等补富化。已有数据的听力学习页不受影响。

## 涉及文件

- `apps/web/app/lib/course-transcribe.ts` — Groq 请求加 `timestamp_granularities[]=word`；解析词级时间戳并入 words；新增 `enrichTranscript`（LLM 批量中译+音标）
- `apps/web/app/lib/course-transcribe-enrich.test.ts`（或并入现有测试） — 富化解析/对齐测试
- `apps/web/app/api/courses/[id]/transcribe/route.ts` — 转写收尾调用富化
- `apps/web/app/api/courses/[id]/enrich/route.ts` — 存量课程补富化（幂等）

## 验证方式

    npx vitest run "__tests__"    # 转写/富化单测全过
    pnpm type-check && pnpm lint
    # 集成：curl 触发 enrich 存量课程 → transcript 出现 translation/phonetic/词级时间戳

## 执行记录

- Groq word granularity 的坑：同时请求 segment+word 时，词级时间戳在**顶层 `words`**（`[{word,start,end}]`），不在 `segments[].words`。初版按 segment 内解析返回 0 词；改为 `parseGroqResponse`（segments + 顶层 words）+ `assignWordsToSentences` 按词起点归属句。
- 提取 `runLLMChain`（Groq gpt-oss-120b → zen deepseek → glm-5.1 三级链），重构 markProperNouns 复用，新增 enrichTranscript 同链复用。
- 富化合并做成纯函数 `applyEnrichment`（translation + words[{text,phonetic}] 按归一化文本贪心匹配），单测不依赖网络/env。
- `toStandardWav` 从 transcribe 路由提升到 course-transcribe.ts 导出，enrich 路由复用。
- lint 强约束（禁 as）：两处 `as string` / `as Record` 改为 typeof 收窄 + Object.entries。
- enrich 幂等性：词级时间戳"重跑一次即算补齐"（个别词匹配不上属正常降级，客户端估算），`anyWordTs` 判定避免每次重跑 Groq 浪费 20s。
- 集成验证（curl + 手工签发的 better-auth 会话）：存量课程 enrich 成功（translation/phonetic/248 词时间戳）；二次调用 0.29s 返回 enriched:false；FAILED 重置后全量重转写成功（25 句，全部字段齐备）。
  - 注：better-auth 会话 cookie = `rawToken.HMAC-SHA256(rawToken, AUTH_SECRET) base64`，且 middleware 只认 cookie（Bearer 会 307 到 /login）。

## 产出摘要

转写流水线现在产出口语所需的完整 transcript：Groq 词级时间戳（mimo 回落无，客户端估算兜底）+ LLM 逐句中译 + 逐词 IPA 音标。存量课程经 `POST /api/courses/[id]/enrich` 幂等补全。145 web 单测 + 44 shared 单测 + type-check + lint 全绿。