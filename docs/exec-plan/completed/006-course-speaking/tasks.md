# Tasks

## 已完成任务摘要

**T1 后**：数据层与共享契约就位——transcript schema 支持中译文/音标/词级时间戳（向后兼容）；口语评分结果与三难度进度 schema 落地；`SpeakingProgress` 模型（每用户每课程每难度）迁移入库。

**T2 后**：转写流水线产出完整富化 transcript——Groq 词级时间戳（`parseGroqResponse` 读顶层 `words`）+ LLM 逐句中译 + 逐词 IPA（`enrichTranscript`，三级 LLM 链复用）；存量 READY 课程经 `POST /api/courses/[id]/enrich` 幂等补全（LLM 富化 + Groq 词时间戳回填，二次调用短路径返回）。

**T3 后**：评分闭环服务端就位——`ScoreProvider` 抽象（mock 默认，确定性分数 + 按字符占比铺偏移）+ `applySpeakingResult` 纯函数（重录记最高分、全录即 COMPLETED、句号推进到未录句）+ `POST/GET /api/courses/[id]/speak`（评分落库 + 三难度进度查询，服务端取 transcript 文本）。curl 集成验证：评分→落库→重录保最高→25/25 COMPLETED。

**T4 后**：口语学习页全流程 agent-browser 实测通过——三难度呈现（简单原文/中等提示语/困难中文）、按住录音→评分（逐词角标+综合分+录音回放+重录）、逐词弹窗（音标+原音频+我的录音）、续学、25 句完成页。录音 hook 两个真 bug 由 E2E 揪出并修复（chunks 清理顺序、isRecording 不复位）。

**T5 后**：课程列表"开始/继续学习"改为弹窗——听力学习入口 + 三难度口语入口（各带 x/y 句进度与开始/继续/已完成），口语进度打开时按需拉取。agent-browser 实测弹窗三状态标签与难度直达正确。

当前：**本计划全部 task 完成**。156 web 单测 + 45 shared 单测 + type-check + lint 全绿；agent-browser 端到端验证通过。

## 下一个待执行任务

**当前**: 无（全部 task 完成，可归档）

## 任务列表

- [x] T1: 数据模型 + shared schema + 迁移 — tasks/001-schema-shared.md
- [x] T2: 转写流水线富化 + enrich 路由 — tasks/002-transcript-enrich.md
- [x] T3: ScoreProvider 抽象 + mock + 评分/进度 API — tasks/003-score-provider-api.md
- [x] T4: 口语学习页（录音流 + 评分 + 逐词弹窗 + 完成页） — tasks/004-speak-page.md
- [x] T5: 课程列表弹窗入口 + 进度展示 — tasks/005-list-popup.md
> 说明：按 TASKS.md 规范，task 详情文件在执行时创建，先只拆下一个最清晰的 task（T1）。后续 task 在完成前一个后按 plan.md Plan of Work 与执行发现拆分。