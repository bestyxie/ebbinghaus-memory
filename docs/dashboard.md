# 仪表盘

## 概述

仪表盘是用户的学习管理中心，提供学习统计概览、卡片列表管理、创建入口和快速复习入口。采用 Next.js Server Components + Suspense 流式渲染，保证首屏速度。

**路由**：`/dashboard`

---

## 页面布局

```
┌──────────────────────────────────────────────────────────┐
│  侧边栏                   主内容区                         │
│ ┌────────────┐  ┌────────────────────────────────────┐  │
│ │ 牌组列表    │  │  统计卡片区 (StatsGrid)              │  │
│ │            │  │  ┌─────────┐┌─────────┐┌─────────┐ │  │
│ │ ● 英语词汇  │  │  │ 总卡片数 ││ 今日待复││ 记忆保留 │ │  │
│ │ ● 数学公式  │  │  │   157   ││ 习  42  ││率  87%  │ │  │
│ │ ● 历史笔记  │  │  └─────────┘└─────────┘└─────────┘ │  │
│ │            │  ├────────────────────────────────────┤  │
│ │ + 新建牌组  │  │  操作栏 (FiltersBar)                 │  │
│ │            │  │  [排序▼] [牌组过滤▼] [创建▼] [复习▼] │  │
│ └────────────┘  ├────────────────────────────────────┤  │
│                 │  卡片列表 (CardTable)                │  │
│                 │  ┌────────────────────────────────┐ │  │
│                 │  │ 卡片内容  状态标签  牌组  操作   │ │  │
│                 │  │ ──────────────────────────────  │ │  │
│                 │  │  ...卡片行...                   │ │  │
│                 │  └────────────────────────────────┘ │  │
│                 │  分页器                               │  │
│                 └────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

---

## 统计数据（StatsGrid）

**组件**：`/workspace/app/(pages)/dashboard/components/stats-grid.tsx`（Server Component）

**API**：`GET /api/dashboard/stats`

### 三个统计指标

#### 1. 总卡片数

```sql
SELECT COUNT(*) FROM Card WHERE userId = ?
```

#### 2. 今日待复习

```sql
SELECT COUNT(*) FROM Card
WHERE userId = ?
  AND nextReviewAt <= NOW()
```

#### 3. 记忆保留率

```
保留率 = 评分 >= 3 的复习次数 / 总复习次数 × 100%
```

```sql
-- 分子
SELECT COUNT(*) FROM ReviewLog WHERE userId = ? AND rating >= 3

-- 分母
SELECT COUNT(*) FROM ReviewLog WHERE userId = ?
```

---

## 卡片列表（CardTable）

**组件**：`/workspace/app/(pages)/dashboard/components/card-table-server.tsx`（Server Component）

**API**：`GET /api/dashboard/cards`

### 列表字段

| 列 | 说明 |
|----|------|
| 内容 | 卡片正面文字（预览） |
| 状态 | NEW / LEARNING / REVIEW / RELEARNING 标签 |
| 牌组 | 所属牌组名称和颜色 |
| 下次复习 | `nextReviewAt` 格式化显示 |
| 操作 | 编辑 / 删除 / 单卡复习 |

### 分页

- 每页 10 条
- URL 参数：`?page=2`
- 服务端渲染，每页独立请求

### 排序

URL 参数：`?sortBy=...`

| sortBy 值 | 说明 |
|-----------|------|
| `nextReviewAt`（默认） | 按复习时间排序，最近到期的在前 |
| `createdAt` | 按创建时间排序，最新的在前 |
| `easeFactor` | 按难度系数排序，最难的在前 |

### 牌组过滤

URL 参数：`?deckId=<deckId>`

- 侧边栏点击牌组自动传入
- 清除过滤显示所有卡片

---

## 创建入口

**组件**：仪表盘操作栏中的"创建"下拉菜单

```
[创建 ▼]
 ├── 新建闪卡
 └── 新建文章
```

- **新建闪卡**：打开 `CreateCardModal` 弹窗
- **新建文章**：跳转到 `/article-editor` 页面

---

## 复习入口

**组件**：仪表盘操作栏中的"复习"下拉菜单

```
[复习 ▼]
 ├── 复习全部  → /review
 ├── 仅闪卡   → /review?type=flashcard
 └── 仅文章   → /review?type=article
```

---

## AI 记忆辅助入口

**组件**：`/workspace/app/(pages)/dashboard/components/ai-memory-modal.tsx`

**按钮**：仪表盘操作栏中的"AI 记忆"按钮

功能：选择多张闪卡，批量生成 AI 助记文本（详见 [AI 功能文档](./ai-features.md)）

---

## 服务端渲染与 Suspense

仪表盘使用 Next.js 15 的流式渲染（Streaming SSR）：

```
页面请求进入
      │
      ▼
立即返回 HTML 骨架 + Loading 占位符
      │
      ├── StatsGrid 数据加载中...
      │       └── 加载完成 → 流式注入统计数据
      │
      └── CardTable 数据加载中...
              └── 加载完成 → 流式注入卡片列表
```

这样用户能快速看到页面结构，数据逐步显示，体验流畅。

---

## 页面缓存与重新验证

- 仪表盘数据在创建/编辑/删除卡片后通过 `revalidatePath('/dashboard')` 自动刷新
- 统计数据实时反映最新状态
- 复习评分后统计数据在下次页面加载时更新

---

## URL 参数汇总

| 参数 | 示例 | 说明 |
|------|------|------|
| `page` | `?page=2` | 分页页码（默认1） |
| `sortBy` | `?sortBy=createdAt` | 排序字段 |
| `deckId` | `?deckId=cld...` | 牌组过滤 |

多参数组合示例：`/dashboard?sortBy=nextReviewAt&deckId=cld...&page=3`
