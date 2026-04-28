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

`CLAUDE.md` 是地图，不是百科全书。只作为入口索引（控制在约 100 行内），不承载大段细则。知识库放在 `docs/` 结构化目录中，智能体按需导航到更深层上下文，而非一开始就被淹没。

## Docs 写作规范

`docs/` 下所有 `.md` 都会作为 AI 上下文发送，token 即成本。

- **一句话能说清不写两句**。删掉套话、过渡句、总结段。
- **有 lint 强制执行的规则**：规则名 + 一行摘要，不需要正反示例。
- **没有 lint 兜底的规则**：最小必要示例（一个 ❌ + 一个 ✅）。
- **禁止填充语**："原则是…"、"换句话说…"、"需要注意的是…"。
- 表格优于散文，列表优于段落。

## 开发环境自体验自验证

完成一个阶段的前端开发后，必须通过 `agent-browser` 在浏览器中实际查看效果，不接受"写完代码即完成"。

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
├── features/                              # 现有功能详细说明文档
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
    └── specs/                             #   设计规格
```

### Caveat

- The `Tag` interface (`{ id, name, color }`) maps to the `Deck` model fields: `id → id`, `name → title`, `color → color`
