# T1: 数据模型 — TranslationTask + Prisma migration

**Status**: pending
**Started**: —
**Completed**: —

## 目标

在 Prisma schema 中新增 TranslationTask 模型和 TranslationTaskStatus 枚举。运行 migration 后数据库包含新表，Prisma Client 类型可用。

## 涉及文件

- `prisma/schema.prisma` — 新增 TranslationTask 模型、TranslationTaskStatus 枚举、User 模型添加关系

## 验证方式

    npx prisma generate  # 生成客户端
    npx prisma migrate dev --name add-translation-task  # 创建迁移
    pnpm type-check      # 类型检查通过

## 执行记录

## 产出摘要
