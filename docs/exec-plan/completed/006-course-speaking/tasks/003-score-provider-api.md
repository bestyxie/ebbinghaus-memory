# T3: ScoreProvider 抽象 + mock + 评分/进度 API

**Status**: done
**Started**: 2026-08-18
**Completed**: 2026-08-18

## 目标

做完后：存在 `ScoreProvider` 抽象接口（录音 + 目标文本 + 录音时长 → 每词评分与录音内偏移 + 综合评分），默认 mock 实现返回确定性分数供联调；`POST /api/courses/[id]/speak` 完成录音评分并更新 `SpeakingProgress`（重录记最高综合分、全部句子录过即 COMPLETED）；`GET /api/courses/[id]/speak` 返回三难度进度。评分结果与进度有 zod 校验。

## 涉及文件

- `apps/web/app/lib/score-provider.ts` — ScoreProvider 接口 + 环境选型 + mock 实现
- `apps/web/app/lib/speaking-progress.ts` — 纯函数 `applySpeakingResult`（重录最高分 + 完成判定）
- `apps/web/__tests__/lib/score-provider.test.ts` — mock 确定性、偏移比例、区间
- `apps/web/__tests__/lib/speaking-progress.test.ts` — 最高分保留/完成判定/续学句号
- `apps/web/app/api/courses/[id]/speak/route.ts` — POST 评分 + GET 三难度进度
- `packages/shared/src/zod.ts` — `speakingProgressSchema.bestScores` 改为可含 null（按句 idx 对齐的稀疏数组）

## 验证方式

    npx vitest run "__tests__"    # 单测全过
    pnpm type-check && pnpm lint
    # 集成：curl POST 评分（mock）→ SpeakingProgress 落库；GET 返回三难度进度

## 执行记录

- ScoreProvider 接口比计划多了 `durationMs` 输入：客户端知道录音时长，mock/真实引擎据此铺词级偏移；真实引擎（Azure/Qwen）本就需要音频时长。
- mock 实现：分数 = 70 + 词哈希%26（确定性、可复现），偏移按归一化字符占比铺满 durationMs。
- `applySpeakingResult` 纯函数：bestScores 按句 idx 对齐（null=未录），重录取最高分；全部句子录过 → COMPLETED；sentenceIndex 推进到第一个未录句。
- 坑 1：Prisma Json 字段不接受顶层 null（TS 类型），且 `Array.isArray` 收窄不到 `(number|null)[]` → 用 `bestScoresFromJson` 清洗。
- 坑 2：shared `speakingProgressSchema.bestScores` 原是全 number 数组，含 null 的稀疏数组校验失败 → 响应里 bestScores 被回退成 null。改为允许 null 元素。
- 坑 3：dev server（Aug 16 启动）持有旧的 Prisma client，没有 `speakingProgress` → 重启后 GET/POST 正常。
- 集成验证：GET 三难度初始进度；POST 句0 得 overall 90 + bestScores[0]=90 + sentenceIndex=1；重录保持最高分；循环录 1-24 → 25/25 COMPLETED；清理测试数据。
- 注：系统 python3 已损坏（CoreFoundation 加载失败），用 node 解析 JSON。

## 产出摘要

评分闭环服务端就位：ScoreProvider 抽象（mock 默认）+ 评分 API（服务端取 transcript 文本，不信客户端）+ SpeakingProgress 更新（最高分/完成/续学）+ 三难度进度查询。156 web 单测 + 45 shared 单测 + type-check + lint 全绿；真实课程 curl 集成验证通过（含 COMPLETED）。