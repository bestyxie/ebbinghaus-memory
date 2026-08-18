# T1: 数据模型 + shared schema + 迁移

**Status**: done
**Started**: 2026-08-18
**Completed**: 2026-08-18

## 目标

做完后：数据库有 `SpeakingProgress` 表与 `SpeakingDifficulty` 枚举；shared 的 transcript schema 支持 `translation` / 词级 `phonetic` / `startMs` / `endMs`，并新增 `scoreResultSchema` 与 `speakingProgressSchema`；既有 course-schema 测试全部更新通过。存量 transcript JSON 不受影响（新字段全可空）。

## 涉及文件

- `packages/shared/src/zod.ts` — 扩展 transcriptWord/transcriptSentence schema；新增 scoreResult/speakingProgress schema
- `packages/shared/src/types.ts` — 新增 `SpeakingDifficultyValue`、`ScoreWordResult`、`ScoreResult`、`SpeakingProgress` 类型导出
- `packages/shared/src/__tests__/course-schema.test.ts` — 更新 + 新增 schema 测试
- `apps/web/prisma/schema.prisma` — 新增 `SpeakingDifficulty` 枚举、`SpeakingProgress` 模型；User/Course 加反向关系
- `apps/web/prisma/migrations/<ts>_add_course_speaking/migration.sql` — 手写 SQL（PG10 无 shadow DB，参考 005 迁移法）

## 验证方式

    pnpm --filter @ebbinghaus/shared test        # course-schema 测试全过
    pnpm --filter web test                       # 既有测试不被破坏
    pnpm --filter web type-check                 # prisma client 生成后类型通过
    cd apps/web && npx prisma migrate deploy     # 迁移应用成功；psql \d "SpeakingProgress" 结构正确

## 执行记录

- shared schema：`transcriptWordSchema` 增 phonetic/startMs/endMs（可空，兼容存量）；`transcriptSentenceSchema` 增 translation（可空）；新增 `speakingDifficultySchema`/`scoreWordResultSchema`/`scoreResultSchema`/`speakingProgressSchema`；types.ts 对应导出。
- 测试：新增 transcriptWord/speakingDifficulty/scoreResult/speakingProgress 用例，扩展 transcriptSentence 兼容性用例；shared 44 测试全过 + type-check 绿。
- Prisma：`SpeakingDifficulty` 枚举 + `SpeakingProgress` 模型（@@unique([userId, courseId, difficulty])，bestScores Json 按句 idx 对齐）；User/Course 反向关系。`prisma validate` + `generate` 通过。
- 迁移：手写 SQL（PG10 shadow DB 不兼容，沿用 005 手写+migrate deploy 法）；`migrate deploy` 应用成功；psql 验证表结构、索引、外键、枚举值 {EASY,MEDIUM,HARD}。
- web：136 单测全过（`vitest run "__tests__"`）；type-check 绿；lint 绿。
- 备注：`pnpm test` 全量跑会把 `tests/e2e/*.spec.ts`（Playwright）当 vitest 用例加载而报 4 个文件失败——既有问题（vitest.config.ts 未 exclude），与本次改动无关，已确认 e2e 文件未被触碰。

## 产出摘要

数据层与共享契约就位：transcript 结构向后兼容地支持口语所需的中译文/音标/词级时间戳；口语评分结果与三难度进度有 Zod schema 与 TS 类型；`SpeakingProgress` 已迁移入库。T2 可在转写流水线上叠加富化步骤。