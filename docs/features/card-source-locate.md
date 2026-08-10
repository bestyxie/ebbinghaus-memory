# 卡片来源定位（Card Source Locate）

## 概述

单词卡片背面展示来源（source）信息，点击跳转到第三方网页，并由扩展在该网页上定位到该单词出现的位置。来源信号以浏览器原生 Text Fragment 为单一传输载体，扩展仅做增强定位。

---

## 领域模型

### Card 字段变更（inline，非独立实体）

**新增六列**（五字段原子化 + provenance 拆出）：

```prisma
// 来源定位 —— 五字段原子化：全有或全无
sourceUrl        String?   @db.VarChar(2048)   // 捕获页绝对 URL（含 Text Fragment）
sourceWord       String?                        // 捕获时的精确单词/短语
sourceAnchor     Json?                          // 定位载荷 { sel, ctx, occ }
sourceTitle      String?   @db.VarChar(512)     // 捕获时页面标题（UI 标签）
capturedAt       DateTime?                      // 捕获时间

// provenance —— 从旧 Card.source 拆分出的来源标识
sourceProvenance String?   @db.VarChar(64)      // 'chrome-extension' | 'translate' | 'import' | ...
```

**删除一列**：`Card.source`（旧列，迁移后移除）。

### 历史数据迁移（拆分迁移策略）

旧 `Card.source` 当前被重载为两种语义：URL（扩展捕获流）或 provenance tag（translate/import）。迁移脚本：

```sql
-- 1. URL 语义 → 写入新五字段（仅 sourceUrl，其余四字段为 null，需扩展后续补全）
UPDATE "Card"
SET "sourceUrl" = "source",
    "capturedAt" = "createdAt"
WHERE "source" ~ '^https?://';

-- 2. provenance 语义 → 写入 sourceProvenance
UPDATE "Card"
SET "sourceProvenance" = "source"
WHERE "source" !~ '^https?://';

-- 3. 删除旧列
ALTER TABLE "Card" DROP COLUMN "source";
```

**迁移后的部分填充状态**：历史卡片只有 `sourceUrl`，`sourceWord/sourceAnchor/sourceTitle` 为 null。UI 对 `sourceUrl` 存在但 `sourceAnchor` 为 null 的卡片：仅渲染可点击链接，不触发扩展定位。新捕获的卡片五字段齐全。

### 不变量

- `sourceUrl && sourceWord && sourceAnchor && sourceTitle && capturedAt` 同时存在或同时为 null。Zod 在 API 边界校验；`app/lib/` 内信任输入已验证。
- `sourceProvenance` 独立可空，不受上述五字段约束。
- 一张 Card 至多一个 source（Q5 决策）。
- 旧 `Card.source` 已删除，不再存在语义冲突。

### sourceAnchor 结构

```json
{
  "sel": "article > p:nth-child(7)",   // 捕获时 CSS 路径（best-effort，不可单独信任）
  "ctx": "the ephemeral nature of",    // ~40 字符上下文（搜索回退 + 消歧）
  "occ": 2                             // sourceWord 在父块内第 N 次出现，1 索引，父块内作用域
}
```

- `sel` 用 CSS（非 XPath）：与 DevTools "Copy JS path" 一致，调试友好，Plasmo 兼容。
- `occ` 作用域为父块（非全局文档索引）：页面在上方插入段落不会移位，抗编辑。

---

## 传输契约

### URL Fragment 格式（单一传输）

使用浏览器原生 [Text Fragment](https://developer.mozilla.org/en-US/docs/Web/URI/Fragment/Text_fragments)，扩展不引入自定义 fragment。

```
https://example.com/article#:~:text=the%20ephemeral%20nature%20of
```

- 前缀/后缀（`prefix-,suffix`）用于消歧同一页面多次出现的词（Q3：命中同一实例）。
- 无扩展时，Chrome 原生滚动到该文本（Q6(b)）。
- 扩展读取同一 fragment 做增强定位。

### Web App 点击行为

```
<a href={sourceUrl} target="_blank" rel="noopener noreferrer">
  {sourceTitle}
  ↗ <em>{sourceWord}</em>
</a>
```

- 标签用 `sourceTitle`（Q12），单词作为定位目标提示。
- 不做任何扩展探测；原生 fragment 负责无扩展降级。

---

## 插件端改动

### 概览

两条链路需改动：**捕获写入链路**（选词 → 入队 → API）和**定位链路**（新增 content-script）。

```
捕获写入链路（改动）：
  WordCapture.tsx ──选词时计算 anchor──▶ CaptureTooltip.tsx ──▶ QueuedWord ──▶ to-flashcard-dto.ts ──▶ FlashcardDTO ──▶ POST /api/extension/cards

定位链路（新增）：
  webNavigation.onCompleted ──▶ SourceLocate content-script ──▶ locate() 算法 ──▶ highlight
```

### 1. 捕获写入链路

#### 1a. `QueuedWord` 类型扩展（`apps/extension/lib/storage.ts`）

```ts
export interface SourceAnchor {
  sel: string;   // CSS 路径
  ctx: string;   // ~40 字符上下文
  occ: number;   // 父块内第 N 次出现，1 索引
}

export interface QueuedWord {
  word: string;
  pronunciation?: string;
  definition: string;
  context: {
    sentence: string;
    source_url: string;       // 保留，迁移期间向后兼容
    source_anchor?: SourceAnchor;  // 新增
    source_title?: string;         // 新增：document.title
    captured_at?: string;          // 新增：ISO 8601
  };
  timestamp: number;
  retryCount: number;
}
```

#### 1b. Anchor 计算（`apps/extension/components/WordCapture.tsx`）

选词时已有 `range = selection.getRangeAt(0)`（line 57），在该处计算 anchor：

```ts
// 新增工具函数 compute-source-anchor.ts
function computeSourceAnchor(range: Range, selectedText: string): SourceAnchor {
  const element = range.startContainer.parentElement;
  const sel = computeCssPath(element);              // 向上遍历到唯一祖先
  const ctx = extractContext(range, 40);            // 选区前后共 ~40 字符
  const occ = countOccurrenceInParent(element, selectedText);  // 父块内第 N 次
  return { sel, ctx, occ };
}

// 同时计算 Text Fragment URL
function buildTextFragmentUrl(sourceUrl: string, ctx: string): string {
  // https://example.com/art#:~:text=prefix-,ephemeral,-suffix
  const [prefix, suffix] = splitContext(ctx);
  const frag = `:~:text=${prefix}-${selectedText},-${suffix}`;
  return `${sourceUrl}#${frag}`;
}
```

`WordCapture.tsx` 的 `handleSelection` 内，将 `sourceUrl` 从 `window.location.href` 改为 `buildTextFragmentUrl(window.location.href, ctx)`，并将 `anchor + sourceTitle + capturedAt` 一并存入 `translateButtonData`。

#### 1c. `CaptureTooltip.tsx` 传透

`handleSave` 构建 `QueuedWord` 时（line 92-101），将 anchor/title/capturedAt 写入 `context`：

```ts
const wordData: Omit<QueuedWord, 'timestamp'> = {
  // ... 现有字段 ...
  context: {
    sentence,
    source_url: sourceUrl,            // 现已含 Text Fragment
    source_anchor: anchorData,        // 新增
    source_title: document.title,     // 新增
    captured_at: new Date().toISOString(),  // 新增
  },
  retryCount: 0,
};
```

#### 1d. DTO 映射（`apps/extension/lib/to-flashcard-dto.ts`）

```ts
export function toFlashcardDTO(word: QueuedWord): FlashcardDTO {
  return {
    front: word.word,
    back: word.definition,
    note: word.context.sentence,
    // 新增：替代旧 source 字段
    sourceUrl: word.context.source_url,
    sourceWord: word.word,
    sourceAnchor: word.context.source_anchor,
    sourceTitle: word.context.source_title,
    capturedAt: word.context.captured_at,
    sourceProvenance: 'chrome-extension',
  };
}
```

#### 1e. `FlashcardDTO` / `CreateCardInput` 类型扩展（`packages/shared`）

`FlashcardDTO = Omit<CreateCardInput, 'quality'>`，需在 `CreateCardInput` 新增字段：

```ts
interface CreateCardInput {
  // ... 现有 ...
  source?: string;                    // 废弃，迁移后移除
  sourceUrl?: string;
  sourceWord?: string;
  sourceAnchor?: SourceAnchor;
  sourceTitle?: string;
  capturedAt?: string;
  sourceProvenance?: string;
}
```

#### 1f. API 写入（`apps/web/app/api/extension/cards/route.ts`）

`POST` 路由 Zod 校验新增字段，持久化到 `Card` 六列。`source` 旧字段废弃不写。

### 2. 定位链路（新增）

#### 2a. 新增 content-script：`apps/extension/content-scripts/source-locate.ts`

```
触发：chrome.webNavigation.onCompleted
  → 匹配 URL 含 #:~:text= 或已知 sourceUrl
  → 注入 source-locate content-script
  → 运行 locate() 算法（见下节）
```

Plasmo 配置：`content-scripts/source-locate.ts` 匹配 `<all_urls>`，但仅在 URL 含 fragment 时激活。

#### 2b. 新增工具函数：`apps/extension/utils/source-locate.ts`

locate 算法实现（纯函数，不碰 chrome.* API，可单测）：

```ts
function locate(anchor: SourceAnchor, fragment: ParsedFragment): LocateResult {
  // 1. CSS 锚点快路径
  const el = document.querySelector(anchor.sel);
  if (el) return highlight(el, anchor);

  // 2. 上下文搜索
  const ctxEl = findByText(anchor.ctx);
  if (ctxEl) return highlightInBlock(ctxEl, anchor);

  // 3. fragment 兜底
  if (fragment) return highlightByFragment(fragment);

  return { found: false };
}
```

#### 2c. `webNavigation` 注册（`apps/extension/background.ts`）

```ts
chrome.webNavigation.onCompleted.addListener((details) => {
  if (details.frameId !== 0) return;
  const url = new URL(details.url);
  if (url.hash.includes(':~:text=')) {
    chrome.tabs.sendMessage(details.tabId, { action: 'source-locate', url: details.url });
  }
});
```

### 3. 文件清单

| 文件 | 改动类型 | 说明 |
|------|----------|------|
| `apps/extension/lib/storage.ts` | 修改 | `QueuedWord` 新增 `SourceAnchor` 类型 + context 字段 |
| `apps/extension/utils/compute-source-anchor.ts` | **新增** | CSS 路径 + 上下文 + occurrence 计算 |
| `apps/extension/utils/build-text-fragment.ts` | **新增** | 构造 `#:~:text=` fragment URL |
| `apps/extension/components/WordCapture.tsx` | 修改 | `handleSelection` 内调用 anchor 计算 |
| `apps/extension/components/CaptureTooltip.tsx` | 修改 | `handleSave` 传透新字段 |
| `apps/extension/lib/to-flashcard-dto.ts` | 修改 | 映射新字段到 DTO |
| `apps/extension/lib/ebbinghaus-api.ts` | 修改 | `WordsListResponse` 字段更新 |
| `packages/shared/` | 修改 | `CreateCardInput` 新增字段 + Zod schema |
| `apps/web/app/api/extension/cards/route.ts` | 修改 | Zod 校验 + 持久化新字段 |
| `apps/extension/content-scripts/source-locate.ts` | **新增** | 定位 content-script |
| `apps/extension/utils/source-locate.ts` | **新增** | locate 算法纯函数 |
| `apps/extension/background.ts` | 修改 | 注册 `webNavigation.onCompleted` |
| `apps/extension/manifest.json` | 修改 | `host_permissions: <all_urls>` |

---

## 扩展定位算法

触发：`webNavigation.onCompleted`（需 `host_permissions: <all_urls>`，Q7 → P1）。

```
function locate() {
  1. tryScrollTo(sel)                     // 先尝试 CSS 锚点（快路径）
  2. if found → highlightAndReturn()      // 命中即返回
  3. ctxMatch = findContext(ctx)          // 锚点失效 → 上下文搜索
  4. if ctxMatch → scrollTo(ctxMatch)      // 词在该上下文内的第 occ 次出现
  5. parseTextFragment() as fallback      // 仍失败 → 用 URL fragment 原生命中
  6. found → highlight() | not → retry()
}

retry: maxRetries=8, delay=100ms×1.6^n (cap 1.6s), total budget=10s
       via MutationObserver; exhausted → silent bail
```

### 高亮样式（Q10：留存至离开）

- `outline: 2px solid #ffd54f`，fade-out 3s（fade 仅装饰，高亮本体不清除）。
- 点击页面其他位置可关闭高亮。
- 重开同源 tab：重新跑 `locate()`，不复用旧高亮。

### 降级矩阵

| 扩展 | fragment | 结果 |
|------|----------|------|
| 无   | 有       | Chrome 原生滚动到文本，无高亮 |
| 有   | 有       | CSS锚点→上下文搜索→fragment 兜底，命中则高亮 |
| 有   | 无       | 跑 `locate()` 仅靠 `sourceAnchor`，无 fragment 兜底 |

---

## 权限声明（P1）

`manifest.json`:

```json
{
  "host_permissions": ["<all_urls>"],
  "permissions": ["webNavigation", "activeTab"]
}
```

- `<all_urls>`：install-time "Read and change all your data" 警告，一次性成本。
- `activeTab`：保留用于捕获流（选词手势触发，独立于本特性）。

---

## 组件契约

### Zod Schema（packages/shared）

```ts
const SourceAnchor = z.object({
  sel: z.string(),
  ctx: z.string(),
  occ: z.number().int().positive(),
});

const CardSource = z.object({
  sourceUrl: z.string().url(),
  sourceWord: z.string().min(1),
  sourceAnchor: SourceAnchor,
  sourceTitle: z.string(),
  capturedAt: z.string().datetime(),
}).nullable();
```

### API 契约

- **写入**（扩展捕获时）：`POST /api/extension/cards`，Zod 校验五字段原子化（全有或全无），持久化到 Card 六列。`sourceProvenance` 独立可空。
- **读取**（web app 复习页）：`GET /api/cards/:id` 返回 sourceBlock 字段。
- **查询**（扩展按 URL 查卡片）：`GET /api/extension/cards?source=<url>`，查询字段从 `source` 改为 `sourceUrl`。
- **边界**：每个 API 路由首行 `requireAuth()`；Zod 校验在路由层，`app/lib/` 内信任。

### 不做的事

- 不引入 `CardSource` 独立表（Q5 决策）。
- 不引入自定义 URL fragment（R-A 决策）。
- 不引入遥测（T1：v1 静默 bail，无 console 噪声）。
- 不做 JS 反序列化信任（anchor 只在扩展 content-script 内使用，DOM 操作前重新校验）。
- 不保留旧 `Card.source` 列（拆分迁移后删除，避免重载语义长期存在）。

---

## 决策索引

| 问题 | 决策 | 锁定轮次 |
|------|------|----------|
| Q1 信号传输 | 原生 Text Fragment（非自定义） | R1 → R-A 修正 |
| Q2 锚点陈旧 | 锚点+文本回退 | R1(i) |
| Q3 同一实例 | `sel` + `ctx` 消歧，`occ` 父块作用域 | R1 + Q8 |
| Q4 动态页面 | MutationObserver + retry-fade | R1 |
| Q5 单/多源 | 单源，inline 列 | R1 |
| Q6 无扩展 | 原生 fragment 滚动 | R1(b) |
| Q7 权限 | `<all_urls>`（P1） | R2 |
| Q8 anchor 形状 | `{sel, ctx, occ}` CSS + 父块作用域 | R3 |
| Q9 retry/遥测 | 8×1.6 / 10s budget / 静默 bail（T1） | R3 |
| Q10 高亮生命周期 | 留存至离开 | R1(a) |
| Q11 activeTab 悖论 | 弃 activeTab（auto-locate），保留捕获流 | R2 → P1 |
| Q12 UI 标签 | `sourceTitle` | R2 |
| 旧列冲突 | 拆分迁移：URL→sourceUrl，tag→sourceProvenance，旧列删除 | R4 |