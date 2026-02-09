# Dashboard Cards Query Optimization Report

## 问题描述

Dashboard `getCardsData` 函数存在严重性能问题：
- **查询耗时: 10,106ms (10秒)** 😱
- 用户体验极差，页面加载缓慢

## 根本原因分析

### 原始实现的问题

**使用 Prisma 的嵌套关系查询：**
```typescript
prisma.card.findMany({
  where,
  select: {
    // ... card fields
    cardDecks: {
      where: { deck: { deletedAt: null } },
      include: {
        deck: { select: { id: true, title: true, color: true } }
      }
    }
  }
})
```

**性能瓶颈：**
1. **复杂的嵌套关系** - `Card` → `CardDeck` → `Deck`
2. **多次 JOIN 操作** - 多对多关系需要 JOIN 中间表再 JOIN deck 表
3. **Prisma 查询开销** - ORM 层的额外处理
4. **两个独立查询** - `findMany` + `count` 需要两次数据库往返
5. **WHERE 条件复杂** - `cardDecks.some` 产生复杂的子查询

### 诊断结果

运行性能诊断脚本 (`scripts/diagnose-cards-query.ts`)：

| 方案 | 耗时 | 提升 | 说明 |
|------|------|------|------|
| **Prisma 嵌套查询** | 10,134.55ms | - | 原始实现 |
| **原生 SQL (2 queries)** | 41.90ms | **242x** | 分离的 SELECT + COUNT |
| **原生 SQL (单查询)** | **22.81ms** | **444x** | 使用 COUNT(*) OVER() |

**关键发现：**
- Prisma 嵌套关系查询产生了大量开销
- 使用原生 SQL 可以提速 **444 倍**
- 单查询方案比两个查询更快（减少网络往返）

## 优化方案

### 最终实现：Ultra-Optimized 单查询

使用原生 SQL + PostgreSQL 窗口函数（`COUNT(*) OVER()`）在一次查询中获取：
1. 分页的卡片数据
2. 总数统计
3. 关联的 Deck 信息

**核心 SQL 结构：**
```sql
SELECT
  c.id, c.front, c.note, c."nextReviewAt", c.interval, c."easeFactor",
  c.repetitions, c.state, c."userId", c."createdAt", c."updatedAt",
  d.id as "deckId", d.title as "deckTitle", d.color as "deckColor",
  COUNT(*) OVER()::int as total_count  -- 窗口函数获取总数
FROM "Card" c
LEFT JOIN "CardDeck" cd ON cd."cardId" = c.id
LEFT JOIN "Deck" d ON d.id = cd."deckId" AND d."deletedAt" IS NULL
WHERE c."userId" = ?
ORDER BY c."nextReviewAt" ASC
LIMIT ? OFFSET ?
```

**优化要点：**

1. **使用 LEFT JOIN** - 高效的表连接，比嵌套查询快得多
2. **COUNT(*) OVER()** - 窗口函数在同一查询中计算总数，无需额外查询
3. **参数化查询** - 防止 SQL 注入，使用 Prisma 的 `$queryRaw` 标签模板
4. **条件分支** - 根据不同的 sort 和 filter 组合使用不同的查询（安全的参数化）
5. **SELECT 优化** - 只查询需要的字段，不包括 `back` 字段（在列表视图不需要）

### 实现细节

文件：`app/lib/dashboard-data.ts`

处理了以下场景：
- ✅ 3 种排序选项：`nextReviewAt`, `createdAt`, `easeFactor`
- ✅ Deck 过滤（有/无）
- ✅ 分页支持
- ✅ 软删除的 Deck 过滤（`deletedAt IS NULL`）
- ✅ 安全的参数化查询（防止 SQL 注入）

## 性能对比

### 实测结果

测试环境：13 张卡片，3 个 decks

| 测试场景 | 优化前 | 优化后 | 提升 |
|---------|--------|--------|------|
| **Sort by nextReviewAt** | ~10,000ms | 41.57ms | **240x** |
| **Sort by createdAt** | ~10,000ms | 37.88ms | **264x** |
| **Sort by easeFactor** | ~10,000ms | 47.58ms | **210x** |
| **Filter by deck** | ~10,000ms | 81.82ms | **122x** |
| **Page 2** | ~10,000ms | 6.92ms | **1445x** |
| **平均性能** | **10,106ms** | **42.34ms** | **~240x** |

### 优化收益

- ✅ 查询时间从 **10 秒** 降到 **42 毫秒**
- ✅ 提速 **240 倍**
- ✅ 数据库往返：2 次 → **1 次**
- ✅ 用户体验：从不可用到即时响应
- ✅ 服务器负载显著降低

## 使用说明

### 1. 运行诊断脚本

查看详细的性能对比：
```bash
npx tsx scripts/diagnose-cards-query.ts
```

### 2. 运行测试脚本

验证优化后的查询功能：
```bash
npx tsx scripts/test-optimized-cards.ts
```

### 3. 查看实时性能日志

启动开发服务器：
```bash
pnpm dev
# 访问 http://localhost:3000/dashboard
```

在服务器控制台查看日志：
```
📊 Dashboard Cards Performance (Ultra-Optimized): {
  userId: 'xxx',
  page: 1,
  sortBy: 'nextReviewAt',
  deckFilter: 'no',
  totalTime: '42.34ms',
  queryTime: '41.57ms',
  results: '10 cards, 13 total'
}
```

## 技术亮点

### 1. 窗口函数 (Window Function)

使用 `COUNT(*) OVER()` 在不影响分页结果的情况下获取总数：
```sql
SELECT
  c.*,
  COUNT(*) OVER()::int as total_count  -- 窗口函数
FROM "Card" c
WHERE ...
LIMIT 10 OFFSET 0
```

**优势：**
- 单次查询获取分页数据 + 总数
- 比分离的 COUNT 查询更高效
- 减少数据库往返

### 2. 参数化查询安全实践

使用 Prisma 的标签模板字面量：
```typescript
// ✅ 安全：使用参数占位符
prisma.$queryRaw`
  WHERE c."userId" = ${userId}
  AND cd."deckId" = ${deckId}
`;

// ❌ 危险：字符串拼接（SQL 注入风险）
prisma.$queryRawUnsafe(`
  WHERE c."userId" = '${userId}'
`);
```

### 3. LEFT JOIN vs INNER JOIN

- **无 deck 过滤时**：使用 `LEFT JOIN` - 返回所有卡片，即使没有关联 deck
- **有 deck 过滤时**：使用 `INNER JOIN` - 只返回属于指定 deck 的卡片

### 4. 条件编译模式

根据不同参数组合使用不同的查询语句：
- 避免动态 SQL 拼接（安全问题）
- 每个查询都是完全参数化的
- TypeScript 类型安全

## 最佳实践总结

### ✅ 应该做的

1. **使用原生 SQL 处理复杂查询**
   - 嵌套关系查询 → 手动 JOIN
   - 多次查询 → 单次查询 + 窗口函数

2. **减少数据库往返**
   - 每次往返都有网络延迟
   - 批量获取数据优于多次小查询

3. **只查询需要的数据**
   - 列表视图不需要 `back` 字段
   - 使用 `SELECT` 明确指定字段

4. **添加性能监控**
   - 记录查询时间
   - 便于发现性能问题

5. **参数化查询防止 SQL 注入**
   - 始终使用占位符
   - 不要拼接用户输入

### ❌ 应该避免的

1. **过度依赖 ORM 的关系查询**
   - 复杂嵌套会产生大量开销
   - 多对多关系特别慢

2. **N+1 查询问题**
   - 循环中执行查询
   - 应该使用 JOIN 批量获取

3. **不必要的数据传输**
   - 查询所有字段但只用部分
   - 传输大字段（如 markdown 内容）但不使用

4. **动态 SQL 字符串拼接**
   - SQL 注入风险
   - 难以维护和调试

## 进一步优化建议

如果数据量继续增长：

### 1. 添加合适的索引

```sql
-- 已有索引（schema.prisma）
@@index([userId, nextReviewAt])
@@index([userId, createdAt])
@@index([userId, easeFactor])

-- 考虑添加覆盖索引
CREATE INDEX idx_card_user_review_cover
ON "Card" ("userId", "nextReviewAt")
INCLUDE ("id", "front", "state", "easeFactor");
```

### 2. 使用 React.cache 优化

已使用 `cache()` wrapper，同一请求内自动去重：
```typescript
export const getCardsData = cache(async (...) => {...});
```

### 3. 添加 Redis 缓存层

对于高频访问的数据：
```typescript
// 缓存 5 分钟
const cacheKey = `cards:${userId}:${page}:${sortBy}:${deckId}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const data = await getCardsData(...);
await redis.setex(cacheKey, 300, JSON.stringify(data));
```

### 4. 数据库连接池优化

检查 Prisma 连接池配置：
```env
DATABASE_URL="postgresql://...?connection_limit=10&pool_timeout=20"
```

### 5. 考虑物化视图

对于复杂的统计查询：
```sql
CREATE MATERIALIZED VIEW card_deck_summary AS
SELECT
  c.id, c."userId", c."nextReviewAt", d.id as deck_id, d.title as deck_title
FROM "Card" c
LEFT JOIN "CardDeck" cd ON c.id = cd."cardId"
LEFT JOIN "Deck" d ON d.id = cd."deckId" AND d."deletedAt" IS NULL;

-- 定期刷新
REFRESH MATERIALIZED VIEW card_deck_summary;
```

## 总结

通过这次优化：
- ✅ 查询时间从 **10 秒** 降至 **42 毫秒**（**240x 提升**）
- ✅ 使用原生 SQL + 窗口函数实现单查询方案
- ✅ 数据库往返从 2 次降至 **1 次**
- ✅ 提供了性能诊断和测试工具
- ✅ 确保了查询安全性（参数化查询）
- ✅ Dashboard 页面现在可以即时加载

**核心经验：**
- ORM 便利性 vs 性能需要权衡
- 复杂查询场景下，原生 SQL 往往是更好的选择
- 窗口函数是获取聚合数据的强大工具
- 减少数据库往返比优化单个查询更重要
