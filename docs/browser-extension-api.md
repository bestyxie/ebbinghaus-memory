# Browser Extension API

本文档介绍如何通过 API Token 从浏览器插件（或其他外部客户端）访问 Ebbinghaus Memory 的接口。

## 认证方式

所有 Extension API 使用 **Bearer Token** 认证，在请求头中携带：

```
Authorization: Bearer emb_<token>
```

Token 通过 Web 端的 **Settings → API Tokens** 页面生成，原始值仅在创建时显示一次，请立即复制保存。

---

## 第一步：生成 API Token

1. 登录 Web 应用，访问 `/settings`
2. 点击 **New Token**，输入名称（如 "Chrome Extension"）
3. 创建后复制显示的 token（格式：`emb_` + 48位十六进制字符串）

> Token 以 SHA-256 哈希形式存储，原始值不可恢复。若丢失请撤销后重新创建。

---

## API 端点

所有 Extension API 路由支持 CORS，允许来自 `chrome-extension://` 和 `moz-extension://` 的跨域请求。

### 获取卡组列表

```
GET /api/extension/decks
```

**请求示例：**

```typescript
const res = await fetch('https://your-app.com/api/extension/decks', {
  headers: { 'Authorization': 'Bearer emb_...' },
})
const { decks } = await res.json()
```

**响应：**

```json
{
  "decks": [
    { "id": "clxxx", "title": "英语四级", "color": "#137fec" },
    { "id": "clyyy", "title": "前端面试", "color": "#e53e3e" }
  ]
}
```

---

### 创建闪卡

```
POST /api/extension/cards
Content-Type: application/json
```

**请求体：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `front` | string | ✅ | 卡片正面（单词/问题） |
| `back` | string | ✅ | 卡片背面（释义/答案） |
| `note` | string | — | 助记提示 |
| `deckId` | string | — | 所属卡组 ID |
| `quality` | number | — | 初始难度：`3`=难 `4`=中（默认） `5`=易 |

**请求示例：**

```typescript
const res = await fetch('https://your-app.com/api/extension/cards', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer emb_...',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    front: 'ephemeral',
    back: 'lasting for only a short time',
    note: 'ep-HEM-er-al',
    deckId: 'clxxx',
    quality: 4,
  }),
})
const { card } = await res.json()
```

**响应（201）：**

```json
{
  "card": {
    "id": "clzzz",
    "front": "ephemeral",
    "back": "lasting for only a short time",
    "createdAt": "2026-04-10T08:00:00.000Z"
  }
}
```

---

## Token 管理 API

以下接口使用 session cookie 认证（Web 端登录后可用），也支持 Bearer Token。

### 列出所有 Token

```
GET /api/tokens
```

### 创建 Token

```
POST /api/tokens
Content-Type: application/json

{ "name": "Chrome Extension" }
```

响应中的 `rawToken` 字段为原始 token，**仅返回一次**。

### 撤销 Token

```
DELETE /api/tokens/:id
```

---

## 完整使用示例

```typescript
const SERVER = 'https://your-app.com'
const TOKEN  = 'emb_a3f8c2d1e4b7...'

async function addFlashcard(front: string, back: string, deckId?: string) {
  // 1. 可选：获取卡组列表供用户选择
  const { decks } = await fetch(`${SERVER}/api/extension/decks`, {
    headers: { 'Authorization': `Bearer ${TOKEN}` },
  }).then(r => r.json())

  // 2. 创建闪卡
  const { card } = await fetch(`${SERVER}/api/extension/cards`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ front, back, deckId, quality: 4 }),
  }).then(r => r.json())

  return card
}
```

---

## 错误响应

| 状态码 | 原因 |
|--------|------|
| 401 | Token 无效或已过期 |
| 400 | 请求体字段缺失或格式错误 |
| 404 | 资源不存在（如 deckId 不属于该用户） |
