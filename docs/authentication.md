# 认证系统

## 概述

使用 **better-auth v1.5.3** 实现基于 Session 的邮箱/密码认证，数据通过 Prisma Adapter 持久化到 PostgreSQL。

---

## 注册流程

```
用户填写表单                 better-auth 处理               数据库写入
┌──────────────┐     POST     ┌──────────────────┐    ┌──────────────────┐
│  /register   │ ──────────▶ │ /api/auth/signup  │ ──▶│ 创建 User 记录   │
│  - email     │             │  Zod 验证          │    │ 创建 Account 记录│
│  - password  │             │  密码哈希          │    │ 创建 Session 记录│
│  - name(可选)│             │  生成 Session Token│    └──────────────────┘
└──────────────┘             └──────────────────┘              │
                                      │                         │
                              设置 Session Cookie               │
                                      │                         │
                              跳转到 /dashboard ◀──────────────┘
```

---

## 登录流程

```
用户填写表单                 better-auth 处理               数据库操作
┌──────────────┐     POST     ┌──────────────────┐    ┌──────────────────┐
│  /login      │ ──────────▶ │ /api/auth/signin  │ ──▶│ 查询 User        │
│  - email     │             │  验证邮箱存在      │    │ 验证密码哈希      │
│  - password  │             │  比对密码哈希      │    │ 创建 Session 记录│
└──────────────┘             │  生成 Session Token│    └──────────────────┘
                             └──────────────────┘              │
                                      │                         │
                              设置 Session Cookie (7天)         │
                                      │                         │
                              跳转到 /dashboard ◀──────────────┘
```

---

## Session 管理

### 配置参数

| 参数 | 值 | 说明 |
|------|----|------|
| 过期时间 | 7 天 | Session 有效期 |
| 刷新间隔 | 1 天 | 活跃时自动续期 |
| Cookie 缓存 | 5 分钟 | 减少数据库查询 |
| 存储位置 | PostgreSQL `Session` 表 | 持久化存储 |

### Session 数据结构

```typescript
Session {
  id:        string    // 唯一标识
  token:     string    // 随机 Token (唯一索引)
  userId:    string    // 关联用户
  expiresAt: DateTime  // 过期时间
  ipAddress: string?   // 客户端 IP
  userAgent: string?   // 浏览器信息
}
```

---

## 路由保护

### Middleware 保护机制

**文件**：`/workspace/middleware.ts`

```
请求进入
    │
    ▼
获取 Session (GET /api/auth/get-session)
    │
    ├── 无 Session ──▶ 是否为公开路由？
    │                      │
    │                  ┌───┴───┐
    │                  是      否
    │                  │       │
    │                  ▼       ▼
    │               放行   重定向到 /login
    │
    └── 有 Session ──▶ 是否访问 /login 或 /register？
                           │
                       ┌───┴───┐
                       是      否
                       │       │
                       ▼       ▼
                  重定向到   放行请求
                  /dashboard
```

### 公开路由

- `/login`
- `/register`

### 所有其他路由均需登录

---

## API 路由保护

所有受保护的 API 路由使用 `requireAuth()` 辅助函数：

**文件**：`/workspace/app/lib/api-helpers.ts`

```typescript
// 使用方式
const userId = await requireAuth(request);
if (userId instanceof NextResponse) return userId; // 返回 401

// 验证逻辑
async function requireAuth(request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return session.user.id;
}
```

### 数据隔离保障

所有数据库查询都包含 `userId` 条件，确保用户只能访问自己的数据：

```typescript
// 示例：获取卡片列表
await prisma.card.findMany({
  where: {
    userId,          // ← 强制过滤当前用户
    nextReviewAt: { lte: now }
  }
});
```

---

## 环境变量

| 变量 | 用途 |
|------|------|
| `NEXT_PUBLIC_APP_URL` | 应用根 URL，用于 better-auth 回调 |
| `AUTH_SECRET` | Session Token 签名密钥 |
| `DATABASE_URL` | PostgreSQL 连接字符串 |

---

## 测试账号

开发环境内置测试账号：
- **邮箱**：`test@test.com`
- **密码**：`1234567890`
