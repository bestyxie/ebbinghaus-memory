# GET /api/decks 网络请求性能分析报告

## 问题描述

GET `/api/decks` 接口的数据库查询很快（~50ms），但前端网络请求却非常慢。

## HAR 文件分析结果

### 关键指标

| 指标 | 时间 | 说明 |
|------|------|------|
| **总请求时间** | **9,398ms (9.4秒)** | ⚠️ 严重超时 |
| 排队/阻塞时间 | 173ms | 浏览器排队等待 |
| DNS 查询 | -1 (复用) | localhost 无 DNS 查询 |
| 连接建立 | -1 (复用) | 连接已建立 |
| **发送请求** | **0.08ms** | ✅ 正常 |
| **等待响应 (TTFB)** | **9,216ms (9.2秒)** | ❌ 问题根源！ |
| 接收响应 | 9ms | ✅ 正常 |
| 响应体大小 | 816 bytes | ✅ 很小 |

### 时间线分解

```
0ms          173ms        173.08ms                  9389ms      9398ms
├─────────────┤───┤────────────────────────────────────┤──────────┤
   Blocked    Send            Wait (TTFB)              Receive
  (队列等待)  (发送)     (服务器处理时间)           (下载数据)
```

## 问题根本原因

### ⚠️ 核心问题：服务器端等待时间（Wait Time）高达 9.2 秒

**Wait Time (TTFB - Time To First Byte)** 表示：
- 从浏览器**发送完请求**到收到服务器**第一个字节**的时间
- 这个时间包括：
  1. 网络传输时间（localhost 几乎为 0）
  2. **服务器端处理时间**（主要问题所在）
  3. 服务器返回第一个字节的时间

**已知数据**：
- 数据库查询只需 50ms
- 响应体只有 816 bytes
- 网络是 localhost（无延迟）

**结论**：问题出在**服务器端处理**上，而不是数据库查询或网络传输。

## 可能原因分析

根据 HAR 文件和代码分析，可能的原因按优先级排列：

### 1. ⚠️ NextAuth Session 验证缓慢（最可能）

**分析**：
```typescript
// app/api/decks/route.ts
export async function GET() {
  const session = await auth();  // ← 可能是性能瓶颈
  // ...
}
```

**问题**：
- `auth()` 调用需要验证 JWT token
- 可能涉及数据库查询获取 user 信息
- NextAuth 5 (beta) 可能存在性能问题

**验证方法**：
```typescript
export async function GET() {
  const authStart = performance.now();
  const session = await auth();
  const authTime = performance.now() - authStart;
  console.log('Auth time:', authTime, 'ms');
  // ...
}
```

### 2. ⚠️ 开发模式性能问题

**分析**：
- Next.js 15 开发模式（with Turbopack）
- HMR (Hot Module Replacement) 可能阻塞请求
- Source map 生成
- 开发中间件开销

**特征**：
- 第一次请求特别慢
- 后续请求可能快一些
- 生产构建会快很多

### 3. ⚠️ 中间件（Middleware）处理缓慢

**分析**：
```typescript
// middleware.ts
export default auth((req) => {
  // 这里的逻辑可能很慢
});
```

**可能问题**：
- 中间件中的 auth 验证
- 路由匹配逻辑
- 重定向检查

### 4. ⚠️ Node.js 事件循环阻塞

**可能原因**：
- CPU 密集型同步操作
- 其他请求占用了事件循环
- 大量并发请求

### 5. ⚠️ 数据库连接池耗尽

**分析**：
虽然单个查询只需 50ms，但：
- 获取连接可能需要等待
- 连接池可能已满
- 等待其他查询释放连接

**Prisma 配置**：
```env
# DATABASE_URL 中的连接池配置
?connection_limit=10&pool_timeout=20
```

## 诊断方法

### 方法 1：添加详细的时间日志

修改 `app/api/decks/route.ts`：

```typescript
export async function GET() {
  const startTime = performance.now();

  // 测试 1: Auth 时间
  const authStart = performance.now();
  const session = await auth();
  const authTime = performance.now() - authStart;

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 测试 2: 数据库查询时间
  const dbStart = performance.now();
  const decks = await prisma.deck.findMany({
    where: { userId: session.user.id, deletedAt: null },
    include: { _count: { select: { cardDecks: true } } },
    orderBy: { createdAt: 'asc' },
  });
  const dbTime = performance.now() - dbStart;

  // 测试 3: JSON 序列化时间
  const jsonStart = performance.now();
  const response = NextResponse.json({ decks });
  const jsonTime = performance.now() - jsonStart;

  const totalTime = performance.now() - startTime;

  console.log('🕐 GET /api/decks Detailed Timing:', {
    authTime: `${authTime.toFixed(2)}ms`,
    dbTime: `${dbTime.toFixed(2)}ms`,
    jsonTime: `${jsonTime.toFixed(2)}ms`,
    totalTime: `${totalTime.toFixed(2)}ms`,
    breakdown: {
      auth: `${((authTime / totalTime) * 100).toFixed(1)}%`,
      db: `${((dbTime / totalTime) * 100).toFixed(1)}%`,
      json: `${((jsonTime / totalTime) * 100).toFixed(1)}%`,
    }
  });

  return response;
}
```

### 方法 2：测试生产构建性能

```bash
# 构建生产版本
pnpm build

# 运行生产服务器
pnpm start

# 测试请求速度
curl -w "@curl-format.txt" http://localhost:3000/api/decks
```

创建 `curl-format.txt`：
```
time_namelookup:  %{time_namelookup}s\n
time_connect:     %{time_connect}s\n
time_appconnect:  %{time_appconnect}s\n
time_pretransfer: %{time_pretransfer}s\n
time_starttransfer: %{time_starttransfer}s\n
time_total:       %{time_total}s\n
```

### 方法 3：检查数据库连接

```typescript
// 测试 Prisma 连接池
const poolStart = performance.now();
const result = await prisma.$queryRaw`SELECT 1`;
const poolTime = performance.now() - poolStart;
console.log('Database pool acquisition time:', poolTime, 'ms');
```

### 方法 4：检查中间件性能

在 `middleware.ts` 中添加日志：

```typescript
export default auth((req) => {
  const start = performance.now();

  // 现有逻辑...

  console.log('Middleware time:', performance.now() - start, 'ms');
  return NextResponse.next();
});
```

## 优化建议

### 短期优化（立即实施）

#### 1. 添加详细性能日志（已提供代码）

这将帮助我们精确定位问题。

#### 2. 优化 NextAuth 配置

```typescript
// auth.ts
export const { handlers, auth, signIn, signOut } = NextAuth({
  // ...其他配置
  session: {
    strategy: 'jwt', // 确保使用 JWT（更快）
    maxAge: 30 * 24 * 60 * 60, // 30 天
  },
  callbacks: {
    async session({ session, token }) {
      // 只返回必要的数据
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      // 减少 JWT 数据量
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
});
```

#### 3. 跳过不必要的中间件

```typescript
// middleware.ts
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/decks (排除这个 API)
     * - _next/static
     * - _next/image
     * - favicon.ico
     */
    '/((?!api/decks|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

#### 4. 使用 API Route Segment Config

```typescript
// app/api/decks/route.ts
export const dynamic = 'force-dynamic'; // 禁用静态优化
export const runtime = 'nodejs'; // 使用 Node.js runtime（默认，但明确指定）

export async function GET() {
  // ...
}
```

### 中期优化

#### 1. 实施缓存策略

```typescript
import { cache } from 'react';

// 使用 React cache 进行请求去重
export const getDecks = cache(async (userId: string) => {
  return prisma.deck.findMany({
    where: { userId, deletedAt: null },
    include: { _count: { select: { cardDecks: true } } },
    orderBy: { createdAt: 'asc' },
  });
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const decks = await getDecks(session.user.id);
  return NextResponse.json({ decks });
}
```

#### 2. 添加响应缓存头

```typescript
export async function GET() {
  // ...

  return NextResponse.json(
    { decks },
    {
      headers: {
        'Cache-Control': 'private, max-age=60', // 浏览器缓存 60 秒
      },
    }
  );
}
```

#### 3. 优化数据库连接池

```env
# .env
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=20&pool_timeout=30"
```

### 长期优化

#### 1. 迁移到服务器组件

将 decks 数据获取移到服务器组件中，避免客户端 API 调用：

```typescript
// app/components/decks-list.tsx (Server Component)
import { auth } from '@/auth';
import { prisma } from '@/app/lib/prisma';

export async function DecksList() {
  const session = await auth();

  const decks = await prisma.deck.findMany({
    where: { userId: session.user.id, deletedAt: null },
    include: { _count: { select: { cardDecks: true } } },
    orderBy: { createdAt: 'asc' },
  });

  return <div>{/* 渲染 decks */}</div>;
}
```

**优势**：
- 无需 API 路由
- 无需网络往返
- 直接在服务器端获取数据
- 更快的首次渲染

#### 2. 使用 Next.js 15 的 Partial Prerendering

```typescript
// app/layout.tsx
export const experimental_ppr = true;
```

#### 3. 考虑使用 Redis 缓存

```typescript
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 尝试从缓存获取
  const cacheKey = `decks:${session.user.id}`;
  const cached = await redis.get(cacheKey);

  if (cached) {
    return NextResponse.json(cached);
  }

  // 从数据库获取
  const decks = await prisma.deck.findMany({
    where: { userId: session.user.id, deletedAt: null },
    include: { _count: { select: { cardDecks: true } } },
    orderBy: { createdAt: 'asc' },
  });

  // 缓存 5 分钟
  await redis.setex(cacheKey, 300, { decks });

  return NextResponse.json({ decks });
}
```

## 立即行动计划

### Step 1: 诊断（5 分钟）

1. 在 `app/api/decks/route.ts` 中添加详细的时间日志
2. 刷新页面，查看服务器控制台输出
3. 确定是 auth、数据库还是其他部分慢

### Step 2: 快速修复（10 分钟）

根据诊断结果：
- 如果是 **auth 慢** → 优化 NextAuth 配置
- 如果是 **数据库慢** → 检查连接池配置
- 如果是 **JSON 序列化慢** → 减少返回数据量
- 如果是 **中间件慢** → 优化或跳过 middleware

### Step 3: 验证（5 分钟）

1. 测试开发模式性能
2. 构建并测试生产模式性能
3. 使用 curl 或 HAR 文件验证改善

## 预期结果

**优化前**：
- 开发模式：9,398ms (9.4秒)
- 生产模式：未知

**优化后（预期）**：
- 开发模式：200-500ms
- 生产模式：50-100ms

## 总结

**问题核心**：9.2 秒的等待时间（TTFB）意味着服务器端处理非常慢，而数据库查询只需 50ms，说明问题出在：
1. **NextAuth session 验证**（最可能）
2. **开发模式性能问题**
3. **中间件处理**
4. **数据库连接池等待**

**下一步**：添加详细的性能日志来精确定位问题，然后根据结果进行针对性优化。
