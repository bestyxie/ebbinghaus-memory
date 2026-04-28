# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ebbinghaus Memory - a spaced repetition flashcard app implementing the Ebbinghaus forgetting curve and SM-2 algorithm. Built with Next.js 15, Prisma, PostgreSQL, and better-auth.

## Development Commands

```bash
# Development server (with Turbopack)
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Lint
pnpm lint

# type check
pnpm type-check

# Generate Prisma client (after schema changes)
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Open Prisma Studio (database GUI)
npx prisma studio

```

## Architecture

### Tech Stack

- **Next.js 15** with App Router (using Turbopack for dev)
- **React 19** with TypeScript
- **Prisma 7** with PostgreSQL
- **better-auth** 1.5.3 for authentication
- **Tailwind CSS 4**
- **Zod** for validation

### Docs

```
docs/
├── README.md                              # 功能文档索引
├── architecture.md                        # 高层架构概览与代码导览
├── ai-features.md                         # AI 辅助记忆：批量生成助记文本（智谱 GLM-4）
├── article-system.md                      # 文章系统：Markdown 录入 + 召回块 + SM-2 调度
├── authentication.md                      # 认证系统：better-auth Session 邮箱/密码登录
├── browser-extension-api.md               # 浏览器插件 API：通过 API Token 外部访问接口
├── card-lifecycle.md                      # 卡片生命周期：闪卡与文章从创建到复习的完整流转
├── dashboard.md                           # 仪表盘：学习统计、卡片管理、创建与快速复习入口
├── database-schema.md                     # 数据库结构：Prisma 7 + PostgreSQL Schema 说明
├── deck-management.md                     # 牌组管理：卡片的分类容器（名称、颜色、描述）
├── dual-track-sm2-plan.md                 # 双轨 SM-2 实施计划：输入轨道与输出轨道独立调度
├── flashcard-management.md                # 闪卡管理：创建、编辑、删除、按牌组分类
├── review-system.md                       # 复习系统：SM-2 间隔复习 + 4 级渐进式输出练习
├── srs-algorithm.md                       # SM-2 算法详解：间隔重复调度核心逻辑
├── exec-plan/                             # 执行计划规范
|   ├── PLANS.md       #   ExecPlan 规范（计划层级方法论）
│   ├── TASKS.md       #   任务拆分规范（任务层级方法论）
│   ├── active/        #   进行中的计划（每个计划是一个目录）
│   │   └── <序号>-<描述>/
│   │       ├── plan.md          # 原始计划
│   │       ├── tasks.md         # 任务调度台
│   │       └── tasks/           # 各 task 详情文件
│   └── completed/     #   已完成的计划（同上结构 + plan-summary.md）
└── superpowers/                           # Superpowers 功能迭代记录
    ├── plans/                             #   实施计划（含任务清单 checkbox）
    │   ├── 2026-04-10-browser-extension-flashcard.md  # 浏览器插件创建闪卡
    │   ├── 2026-04-16-dashboard-text-search.md        # 仪表盘文本搜索
    │   └── 2026-04-19-rich-text-editor.md             # TipTap 富文本编辑器
    └── specs/                             #   设计规格
        ├── 2026-04-16-dashboard-text-search-design.md  # 文本搜索设计
        └── 2026-04-19-rich-text-editor-design.md       # 富文本编辑器设计
```

### Caveat

- The `Tag` interface (`{ id, name, color }`) maps to the `Deck` model fields: `id → id`, `name → title`, `color → color`
