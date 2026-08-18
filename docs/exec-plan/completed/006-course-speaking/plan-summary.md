# 课程口语学习 — 总结

## 做了什么

课程模块增加口语学习轨道：转写富化（中译/音标/词级时间戳）→ 逐句录音发音评分 → 三难度练习页 + 逐词详情弹窗 → 完成页，课程列表改为听力/口语双入口弹窗。

## 关键产出

- shared：transcript schema 扩展（translation/phonetic/词级时间戳，向后兼容）+ 评分结果与口语进度 schema/类型
- Prisma：`SpeakingDifficulty` 枚举 + `SpeakingProgress` 模型（每用户每课程每难度），手写迁移入库
- 转写流水线：Groq word granularity 词级时间戳（顶层 words 解析）+ `enrichTranscript`（LLM 三级链逐句中译+逐词 IPA）+ `POST /api/courses/[id]/enrich` 幂等补存量
- 服务端：`ScoreProvider` 抽象（mock 默认）+ `POST/GET /api/courses/[id]/speak`（评分落库、重录最高分、全录 COMPLETED、三难度进度）
- 前端：`/courses/[id]/speak` 口语学习页（三难度呈现/按住录音/评分展示/逐词弹窗/续学/完成页）+ 课程列表 `LearnModeModal` 双入口
- 文档：CONTEXT.md（课程学习术语表）+ docs/adr/0001-pronunciation-scoring-engine.md

## 关键决策

- 评分引擎抽象 `ScoreProvider`，引擎选型延后（ADR 0001）：转写置信度 ≠ 发音准确度，mock 打通闭环
- 口语进度独立 `SpeakingProgress`（每难度一行），双轨同构卡片 input/output
- 只持久化综合分最好成绩；逐词分与录音不持久化（录音仅会话内 Blob URL）
- 完成 = 该难度全部句子至少录过一遍（不设分数门槛），有完成页
- 转写时预翻译/预生成音标；存量课程 enrich 幂等补全

## 遗留问题

- 真实发音评分引擎（Azure Pronunciation Assessment / Qwen-Omni via DashScope）未接入——ADR 0001 已定接口与取舍，待单独评估
- mimo 回落无词级时间戳，逐词原音频播放为字符占比估算
- 移动端口语、口语进 SM-2、逐词评分持久化未做

## 最终验证状态

type-check / lint / test 全绿（web 156 + shared 45）。agent-browser 端到端验证：三难度呈现、录音→评分（逐词角标+综合分+回放+重录）、逐词弹窗、续学、25 句完成页、列表弹窗三状态标签与难度直达，全部通过。录音 hook 两个真 bug（chunks 清理顺序、isRecording 复位）由 E2E 揪出并修复。