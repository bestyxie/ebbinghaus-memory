# T4: 口语学习页（录音流 + 评分 + 逐词弹窗 + 完成页）

**Status**: done
**Started**: 2026-08-18
**Completed**: 2026-08-18

## 目标

做完后：`/courses/[id]/speak?level=` 口语学习页完整可用——按难度呈现（简单原文+自动播+重播 / 中等提示语+自动播+重播 / 困难中文+手动播）、按住 space/鼠标录音（0.5s~120s、静音报错、重录）、评分展示（原文+逐词分数角标+综合分+录音回放）、逐词弹窗（音标+原音频+我的录音片段）、句推进+进度持久化+续学、全部录完显示完成页。

## 涉及文件

- `apps/web/app/(pages)/courses/[id]/speak/use-hold-recording.ts` — 按住录音 hook
- `apps/web/app/(pages)/courses/[id]/speak/speak-client.tsx` — 口语学习页客户端
- `apps/web/app/(pages)/courses/[id]/speak/page.tsx` — 路由（level 参数）

## 验证方式

    pnpm type-check && pnpm lint && npx vitest run "__tests__"
    # agent-browser：三难度呈现 / 录音→评分→逐词分→弹窗 / 续学 / 完成页

## 执行记录

- 录音 hook：pointer+space 按住录松开停；0.5s 下限、120s 上限自动截断、静音启发式（blob<2KB）报错可重录。
- **agent-browser 实测发现两个真 bug**（Fake MediaRecorder 桩驱动完整流程）：
  1. `cleanupStream()` 在 `onstop` 里先于 `new Blob(chunksRef)` 执行 → chunksRef 被清空 → 永远报"未检测到语音"。修复：先取 `chunks` 再清理。
  2. `isRecording` 在 onstop 里从未置 false → 麦克风按钮永久显示"正在录音…"。修复：onstop 里 `setIsRecording(false)`。
- gstack browse 的 `eval` 对含 `await` 的文件走块包裹（丢弃返回值）→ 用 Promise 链写 eval 脚本；且每次调用重启 server（cookie 不跨调用）→ 全流程必须单条 `chain`（cookie-import → goto → eval → snapshot）。
- 逐词弹窗播放：原音频用媒体元素 seek 词级时间戳（缺失按字符占比估算）；我的录音用 Blob URL + 引擎返回的录音内偏移（缺失同样估算）。

## 产出摘要

口语学习页全流程 agent-browser 实测通过：EASY（原文+自动播）/ MEDIUM（提示语）/ HARD（中文+手动播）三档呈现正确；按住录音→评分（逐词分数角标+综合分+录音回放+重录+下一句）→ 逐词弹窗（原音频/我的录音/关闭）→ 续学（句号推进）→ 25 句录完显示完成页（本次综合分+历史最佳+各句成绩）。156 web 单测 + type-check + lint 全绿。