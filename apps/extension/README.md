# Hunter Plugin

一款 Chrome 浏览器扩展，帮助用户在浏览网页时随手捕获生词，自动同步到 Ebbinghaus 间隔复习平台进行学习。

## 项目概览

用户在任意网页上选中单词，插件弹出释义气泡，点击保存后单词连同上下文句子一起进入本地队列，后台定时批量同步到服务器。

**技术栈**：React 18 · TypeScript 5 · Plasmo · Vite · Vitest · Chrome Manifest V3

---

## 目录结构

```
hunter-plugin/
├── 入口文件（Extension Entry Points）
│   ├── background.ts
│   ├── content.tsx / content.css
│   ├── popup.tsx / popup.css
│   └── options.tsx / options.css
│
├── lib/                  核心逻辑
├── content-scripts/      内容脚本组件
├── components/           可复用 UI 组件
├── onboarding/           首次安装引导
├── tabs/                 Tab 页面
├── options/              设置页组件
├── test/                 测试辅助
└── assets/               静态资源
```

---

## 文件详解

### 入口文件

| 文件 | 作用 |
|------|------|
| `background.ts` | Service Worker。监听 `chrome.alarms` 定时同步队列，处理来自内容脚本的 `addToQueue` 消息，管理安装后的初始化逻辑。 |
| `content.tsx` | 内容脚本主入口。监听 `mouseup` / `selectionchange` / `keyup` 事件（300ms 防抖），检测用户划词后挂载气泡组件，验证单词长度（2–50 字符）并过滤输入框内的选中。 |
| `content.css` | 内容脚本全局样式，包含气泡定位、过渡动画等。 |
| `popup.tsx` | 点击扩展图标弹出的 Popup 页面。展示已保存词数、同步状态、上次同步时间，并提供"立即同步"按钮。 |
| `popup.css` | Popup 页面样式（状态徽章、按钮等）。 |
| `options.tsx` | 扩展设置页面入口。提供 API Key 的输入、校验与保存功能。 |
| `options.css` | 设置页面样式（表单、分区等）。 |

---

### lib/ — 核心逻辑层

| 文件 | 作用 |
|------|------|
| `lib/storage.ts` | 类型安全的 `chrome.storage.local` 封装。管理三块数据：**队列**（`hunter-queue`，待同步的单词列表）、**设置**（`hunter-settings`，API Key、首次运行标志、累计保存数）、**缓存**（`hunter-cache`，释义缓存，TTL 24 小时）。同时维护 `syncMetrics`（上次同步时间、连续错误数等）。 |
| `lib/storage.test.ts` | storage.ts 的单元测试，覆盖队列增删、设置读写、缓存命中/过期等场景。 |
| `lib/dictionary-api.ts` | 调用免费的 [dictionaryapi.dev](https://api.dictionaryapi.dev) 获取单词释义、音标。先查本地缓存，命中则直接返回；未命中则发起请求后写入缓存。 |
| `lib/dictionary-api.test.ts` | dictionary-api.ts 的单元测试，包含正常响应和网络错误场景。 |
| `lib/ebbinghaus-api.ts` | Ebbinghaus 后端 API 客户端。支持批量保存（每批 10 个），带指数退避的 3 次重试，处理 429 限流和 401 鉴权失败。 |
| `lib/ebbinghaus-api.test.ts` | ebbinghaus-api.ts 的单元测试，覆盖批量同步、重试、限流等场景。 |

---

### content-scripts/ — 内容脚本组件

| 文件 | 作用 |
|------|------|
| `content-scripts/word-capture.tsx` | 划词气泡的 React 组件（`CaptureTooltip`）。展示加载态、单词、音标、简化释义，以及"保存"按钮。定位跟随选区坐标。 |
| `content-scripts/word-capture.css` | 气泡样式：阴影、圆角、入场动画、按钮状态。 |

---

### components/ — 通用 UI 组件

| 文件 | 作用 |
|------|------|
| `components/Popup.tsx` | Popup 的独立组件版本，可在其他页面复用。 |
| `components/Popup.css` | 对应样式。 |

---

### onboarding/ — 首次安装引导

| 文件 | 作用 |
|------|------|
| `onboarding/Onboarding.tsx` | 三步引导向导：① 欢迎介绍 → ② 输入并验证 API Key → ③ 使用教程。完成后写入设置并关闭引导页。 |
| `onboarding/Onboarding.css` | 引导页样式（步骤指示器、卡片布局）。 |

---

### tabs/ — Tab 页面入口

| 文件 | 作用 |
|------|------|
| `tabs/onboarding.tsx` | 将 `Onboarding` 组件挂载到独立 Tab 页面的入口文件（首次安装时由 background.ts 打开）。 |
| `tabs/onboarding.css` | Tab 页面基础样式。 |

---

### options/ — 设置页组件

| 文件 | 作用 |
|------|------|
| `options/Options.tsx` | Options 页面的独立组件，包含 API Key 表单及连接测试。 |
| `options/Options.css` | 对应样式。 |

---

### test/ — 测试基础设施

| 文件 | 作用 |
|------|------|
| `test/setup.ts` | Vitest 全局 setup 文件。Mock 了 `chrome.storage`、`chrome.runtime` 等浏览器扩展 API，使单元测试无需真实浏览器环境即可运行。 |

---

### 配置文件

| 文件 | 作用 |
|------|------|
| `package.json` | 项目依赖、npm 脚本、以及 Plasmo 扩展 manifest 配置（权限、host_permissions）。 |
| `tsconfig.json` | TypeScript 编译配置，包含 `@/` 路径别名。 |
| `vite.config.ts` | Vite 构建配置（路径别名、React 插件）。 |
| `vitest.config.ts` | 测试配置：jsdom 环境、全局 setup、80% 覆盖率阈值。 |
| `pnpm-workspace.yaml` | pnpm workspace 配置。 |
| `pnpm-lock.yaml` | 依赖锁定文件。 |

---

### 文档

| 文件 | 作用 |
|------|------|
| `API_SPEC.md` | Ebbinghaus API 和 DictionaryAPI 的接口契约（Mock 规范），供开发阶段参考。 |
| `TODOS.md` | 待办事项：P2 优先级的 Dictionary API 缓存优化。 |

---

### 静态资源 & 构建产物

| 路径 | 说明 |
|------|------|
| `assets/icon.png` | 扩展图标（360 bytes）。 |
| `build/chrome-mv3-dev/` | 开发构建产物（manifest.json、HTML、CSS、JS），加载到 Chrome 时指向此目录。 |
| `.plasmo/` | Plasmo 框架生成的缓存和类型定义，勿手动修改。 |

---

## 数据流

```
用户划词
   │
   ▼
content.tsx 检测选中文本
   │
   ├─→ dictionary-api.ts 查询/缓存释义
   │         │
   │         ▼
   │   CaptureTooltip 气泡显示释义
   │
用户点击"保存"
   │
   ▼
chrome.runtime.sendMessage(addToQueue)
   │
   ▼
background.ts 接收消息
   │
   ▼
storage.ts 写入 hunter-queue
   │
   ▼
chrome.alarms 每分钟触发
   │
   ▼
ebbinghaus-api.ts 批量同步（10个/批，重试3次）
   │
   ▼
Ebbinghaus 服务器
```

---

## 本地存储结构

```
chrome.storage.local
├── hunter-queue      QueuedWord[]   待同步队列
├── hunter-settings   Settings       { apiKey, firstRun, totalSaves }
├── hunter-cache      DefinitionCache 释义缓存（TTL 24h）
└── syncMetrics       SyncMetrics    { lastSyncTime, lastSyncStatus, consecutiveErrors }
```

---

## 扩展权限

```json
{
  "permissions": ["activeTab", "storage", "alarms"],
  "host_permissions": [
    "https://api.dictionaryapi.dev/*",
    "http://localhost/*"
  ]
}
```

---

## 开发命令

```bash
pnpm dev        # 启动开发模式（热重载）
pnpm build      # 生产构建
pnpm test       # 运行单元测试
pnpm test:ui    # 打开 Vitest UI 界面
```

构建完成后，在 Chrome 扩展页面（`chrome://extensions`）开启开发者模式，加载 `build/chrome-mv3-dev/` 目录即可。
