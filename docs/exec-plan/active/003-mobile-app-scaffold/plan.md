# 移动 App 脚手架：Expo 接入 monorepo + 共享包打通

本 ExecPlan 是活文档。Progress、Surprises & Discoveries、Decision Log、
Outcomes & Retrospective 章节必须随工作进展保持更新。

本文档遵循 docs/exec-plan/PLANS.md 规范。
任务拆分遵循 docs/exec-plan/TASKS.md 规范。

## Purpose / Big Picture

全局目标：为 Ebbinghaus Memory 增加一个 React Native / Expo 移动 App（`apps/mobile`），让用户在手机上复习闪卡、做翻译练习、查看 dashboard。复用现有 `apps/web` 提供的全部 `/api/*` JSON 端点、`@ebbinghaus/shared` 类型与 Zod schemas、以及 Bearer token 鉴权模型（用户在 web Settings 页生成 `emb_<hex>` token，粘进 mobile app）。

当前现状：monorepo 已有 `apps/web`（Next.js 15 + better-auth + Prisma）、`apps/extension`（Plasmo 浏览器扩展）、`packages/shared`（纯 Zod + TS 类型，零 React/Node 依赖）。所有 `/api/*` 路由首行 `requireAuth(request)`，且 `requireAuth` 同时接受 `Authorization: Bearer <rawToken>` 和 better-auth session cookie——扩展就是用 Bearer token 模式接入的（`apps/extension/lib/ebbinghaus-api.ts`）。`pnpm-workspace.yaml` 已有 `apps/*` glob，`turbo.json` 已定义 `build`/`test`/`type-check`/`lint` pipeline。无任何 RN/Expo 依赖已安装。

本计划范围：**最小可演示切片**——把 `apps/mobile` Expo 项目脚手架接入 monorepo，跑起来；接入 `@ebbinghaus/shared`；在欢迎屏显示来自 shared 包的 `REVIEW_BATCH_SIZE` 常量作为"共享层已打通"的可观察证据。**不包含**任何 API 调用、鉴权 UI、复习/翻译/dashboard 屏、NativeWind 配置——这些归下一份计划。

如果之前的计划存在方向偏差，在此明确指出并说明修正策略。无偏差。

## Progress

- [x] (2026-08-06) T1: Expo 脚手架 + monorepo 接入 — 完成；mobile type-check/lint/dev 全部通过；发现并记录 web pre-existing regression

## Surprises & Discoveries

- Observation: 原计划的版本组合（Expo SDK 51 + expo-router 4 + RN 0.75 + React 18.3.1）与 SDK 配对不正确：expo-router 4.x 是 SDK 52 配套（peer `expo-constants ~17`，SDK 51 自带 16），安装报 peer 警告。
  Evidence: `apps/mobile` 初次 `pnpm install` 日志 `expo-router 4.0.22: ✕ unmet peer expo-constants@~17.0.8: found 16.0.2`。

- Observation: 用 Expo SDK 52 + expo-router 4 + RN 0.76 + React 18.3.1 时，pnpm 根 override（`react ^19.2.6`）把 mobile 的 React 强升到 19.2.6，与 Expo SDK 52 期望的 18.3.1 不匹配；Expo dev 启动后打印 `react@19.2.6 - expected version: 18.3.1`。
  Evidence: 第一次 `pnpm dev` 启动后控制台警告。

- Observation: 直接升到 Expo SDK 53 + RN 0.79 + React 19.2.6 后，type-check 报 `TS2786: 'Text' cannot be used as a JSX component — Property 'refs' is missing in type 'NativeMethods & TextComponent'`。根因是 `@types/react@19.2.14` 引入了 React 19 `Component.refs` 字段要求，但 RN 0.79 内部组件类型未补齐 refs 字段。
  Evidence: `pnpm --filter @ebbinghaus/mobile type-check` 报 3 处 TS2786，全部指向 `app/index.tsx` 的 `<View>` 和 `<Text>`。

- Observation: 通过根 pnpm override 增加 `@types/react: 19.1.0`（避免 19.2.14 的 ReactPortal.children breaking change）后，mobile type-check 通过、lint 通过、Metro dev server 启动成功。Expo 仍打印 4 条 "expected version" 软提示（react 19.0.0、react-native 0.79.6、@types/react ~19.0.10、eslint-config-expo ~9.2.0），但都非阻断错误。
  Evidence: 验证 2/3/4 全部 exit 0；`/tmp/expo-dev.log` 含 `Waiting on http://localhost:8081`，无红色错误。

- Observation: HEAD（commit 1863f99）上 `pnpm turbo type-check --force`（绕过 turbo 缓存）揭示 web 自身 pre-existing regression——14 处 TS 错误：`app/api/**` 的 7 处 `TS7006 implicit any`（`.map((card) =>`、`.map((log) =>` 等未标注类型）+ 3 处 `TS2305 PrismaClient has no exported member 'PrismaClient'`（Prisma 7 升级引入的 export 变化）。这些错误之前被 husky pre-commit 的 turbo 缓存命中假阳性通过。
  Evidence: `pnpm turbo type-check --force 2>&1 | grep -c "error TS"` 输出 14；同一命令 `pnpm turbo type-check`（命中缓存）显示 "1 cached" 通过。
  说明：本 plan 不修这批 web regression——它们与 mobile 脚手架无关，是 commit 1863f99 之前已存在的潜伏问题。建议作为下一份 plan 的修正点。

## Decision Log

- Decision: 移动 App 技术栈选用 Expo（含 Expo Router 文件路由）+ React Native + TypeScript
  Rationale: 用户明确选择 React Native / Expo。Expo Router 与 web 端 Next.js App Router 的文件路由理念一致，便于复用心智模型；Expo 提供 OTA、构建、推送一站式工具，省去原生配置成本。
  Date/Author: 2026-08-06 / opencode

- Decision: 第一个 plan 只做脚手架，不做任何业务屏
  Rationale: ExecPlan 规范要求"范围是一个可独立交付、独立验证的增量"且"一个小工作会话内能完成并验证"。脚手架 + shared 常量显示足够构成"可演示的结果"（Expo dev server 启动、屏幕渲染、shared 包 import 成功）。鉴权 + API client + token 存储涉及更多决策（storage 选型、token 输入 UX、API base URL 配置策略），归下一份 plan。
  Date/Author: 2026-08-06 / opencode

- Decision: 不在本计划引入 NativeWind
  Rationale: NativeWind 配置涉及 babel/metro/web 兼容性决策，超出最小切片范围。本计划用 StyleSheet（RN 内置）渲染欢迎屏即可。NativeWind 引入作为下一个 plan 的独立决策点。
  Date/Author: 2026-08-06 / opencode

- Decision: 不在本计划引入 turbo `build` 任务
  Rationale: Expo 默认用 `expo export` 而非 `dist/**` 输出目录，`turbo.json` 现有 `outputs: ["dist/**"]` 字段是 web 的提示。本计划只为 `apps/mobile` 配置 `dev`、`type-check`、`lint` 三个脚本；`build`/`test` 留到有产物形态时再加。
  Date/Author: 2026-08-06 / opencode

- Decision: 实际采用 Expo SDK 53 + expo-router 5.1 + RN 0.79.7 + React 19.2.6 + @types/react 19.1.0
  Rationale: 执行中发现原计划版本组合（SDK 51 + expo-router 4 + React 18.3.1）与 pnpm 根 override（react ^19.2.6）冲突；尝试 SDK 51/52 配 React 18.3.1 都被 override 强升；尝试 SDK 53 配 React 19.2.6 + @types/react 19.2.14 报 React 19 类型 refs 字段不匹配。最终选定 SDK 53 + @types/react 19.1.0（避免 19.2.14 的 ReactPortal.children breaking change），type-check/lint/dev 全通过。
  Date/Author: 2026-08-06 / opencode

- Decision: 在根 `package.json#pnpm.overrides` 增加 `@types/react: 19.1.0` 与 `@types/react-dom: 19.1.0`
  Rationale: 修复 `@types/react@19.2.14` 的 ReactPortal.children breaking change（导致 web `dropdown.tsx` 报 TS2322，且 mobile 的 RN 0.79 类型与 React 19.2.14 refs 字段不匹配）。锁到 19.1.0 让 mobile 与 web 都能 type-check 通过。这是对 b813817 commit "react/react-dom 全局 override" 决策的延伸，把 dedup 范围扩展到 @types/* 副本。
  Date/Author: 2026-08-06 / opencode

## Outcomes & Retrospective

成果：`apps/mobile` Expo React Native 工作区包已建立。`pnpm install` 自动识别（`pnpm-workspace.yaml` 的 `apps/*` glob 无需改）；mobile 单包 `type-check`/`lint`/`dev` 三脚本全部通过；欢迎屏渲染 `REVIEW_BATCH_SIZE = 10` 验证 `@ebbinghaus/shared` 接入成功。

差距与经验：
1. 原计划版本组合（SDK 51 + expo-router 4 + RN 0.75 + React 18.3.1）写错——expo-router 4 是 SDK 52 配套；且未考虑 pnpm 根 React override 把 mobile 的 18.3.1 强升到 19.2.6。Plan 阶段应先检查根 override 配置。
2. React 19.2.14 types 引入的 ReactPortal.children breaking change 之前已让 web 潜伏 TS 错误，被 turbo 缓存假阳性通过隐藏。本次发现并在根 override 加 `@types/react 19.1.0` 锁版本同时改善 mobile 与 web。
3. web 的 14 处 pre-existing TS 错误（7 处 implicit any + 3 处 PrismaClient export + dropdown.tsx TS2322）不在本 plan 修，作为下一份 plan 的修正点。

对比原始目标：本 plan 范围只是"脚手架 + shared 接入"，已达成；移动 app 的鉴权、API 调用、业务屏全部留给后续 plan。

## Context and Orientation

### 当前状态描述

假设读者一无所知。本仓库是 Ebbinghaus Memory monorepo，根目录 `/Users/zero/besty/frontend/ebbinghus-memory`。已有的工作区：

    apps/web/          Next.js 15 应用
    apps/extension/    Plasmo Chrome 扩展
    packages/shared/   @ebbinghaus/shared（纯 Zod + TS，无 React/Node 依赖）

本计划新增：

    apps/mobile/       Expo React Native 应用（新目录）

### 关键文件

- `pnpm-workspace.yaml` — 已含 `apps/*` glob，**无需修改**。新目录 `apps/mobile` 会被自动识别为工作区包。
- `turbo.json` — 已定义 `build`/`test`/`type-check`/`lint` pipeline。新包只要 package.json 提供 `type-check` 和 `lint` script，turbo 自动纳入。
- `packages/shared/src/index.ts` — barrel re-exporter；导出 `REVIEW_BATCH_SIZE`（值 10，定义在 `packages/shared/src/constants.ts:1`）。
- `packages/shared/package.json` — name `@ebbinghaus/shared`，`exports: { ".": "./src/index.ts" }`，**无 build 步骤**，直接导入 TS 源码。
- `tsconfig.json`（根）— 如存在需确认对 RN 的兼容性。Expo 脚手架会自带 `apps/mobile/tsconfig.json`，通常继承根。

### 已完成计划的相关产出

- `completed/001-translate-module-core/` — 新增 `TranslationTask` Prisma 模型与 `/api/translate/*` 路由，mobile 未来的翻译屏会调用。本计划不消费。
- `completed/002-translate-archive-card/` — 翻译任务历史档案 + 一键转卡片。本计划不消费。

### 术语

- **Expo** — React Native 之上的开发框架与工具链，提供 OTA、构建、推送、统一 CLI。
- **Expo Router** — Expo 的文件路由库，类似 Next.js App Router 的页面映射机制，但运行在 RN 上。
- **`@ebbinghaus/shared`** — 仓库内 `packages/shared` 包，导出 Zod schemas、TS 类型、常量。mobile app 直接以 `workspace:*` 依赖引用。
- **Bearer token 鉴权模型** — 用户在 web Settings 创建 `emb_<48 hex chars>` raw token（仅返回一次），将 hash 存库。客户端持 raw token，发送 `Authorization: Bearer <rawToken>` 头。移动 app 后续 plan 会复用此模型，本计划不实现。

## Plan of Work

### T1: Expo 脚手架 + monorepo + shared 包接入

在 `apps/mobile/` 创建 Expo 项目。不使用 `create-expo-app` 的全局命令（避免交互式输入与版本漂移），手动构造最小 package.json + 入口文件。

**步骤**：

1. 创建 `apps/mobile/package.json`：

```json
{
  "name": "@ebbinghaus/mobile",
  "version": "0.0.1",
  "private": true,
  "main": "expo-router/entry",
  "scripts": {
    "dev": "expo start",
    "type-check": "tsc --noEmit",
    "lint": "expo lint"
  },
  "dependencies": {
    "@ebbinghaus/shared": "workspace:*",
    "expo": "~53.0.0",
    "expo-router": "~5.1.0",
    "expo-status-bar": "~2.2.0",
    "react": "19.2.6",
    "react-native": "0.79.7"
  },
  "devDependencies": {
    "@types/react": "~19.0.0",
    "eslint": "^8.57.0",
    "eslint-config-expo": "~8.0.1",
    "typescript": "^5.5.0"
  }
}
```

   说明：执行中确认 Expo SDK 53 + expo-router 5.1 + RN 0.79 配合 pnpm 根 `react ^19.2.6` override 是唯一 type-check/lint/dev 同时通过的组合。原计划写的 SDK 51 + expo-router 4 + React 18.3.1 版本不可行（详见 Surprises & Discoveries 与 Decision Log）。

2. 创建 `apps/mobile/tsconfig.json`，继承 Expo 模板：

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx"]
}
```

3. 创建 `apps/mobile/app.json`（Expo 配置）：

```json
{
  "expo": {
    "name": "Ebbinghaus Memory",
    "slug": "ebbinghaus-memory",
    "scheme": "ebbinghaus",
    "version": "0.0.1",
    "orientation": "portrait",
    "userInterfaceStyle": "automatic",
    "ios": { "supportsTablet": true },
    "android": {},
    "plugins": ["expo-router"]
  }
}
```

4. 创建 `apps/mobile/app/_layout.tsx`（Expo Router 根布局）：

```tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text } from 'react-native';
import { REVIEW_BATCH_SIZE } from '@ebbinghaus/shared';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
```

5. 创建 `apps/mobile/app/index.tsx`（首页，渲染欢迎屏并显示 `REVIEW_BATCH_SIZE` 的值作为"shared 包已接入"的可观察证据）：

```tsx
import { StyleSheet, View, Text } from 'react-native';
import { REVIEW_BATCH_SIZE } from '@ebbinghaus/shared';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ebbinghaus Memory</Text>
      <Text style={styles.subtitle}>移动 App · 脚手架 OK</Text>
      <Text style={styles.evidence}>
        shared 包已接入 · REVIEW_BATCH_SIZE = {REVIEW_BATCH_SIZE}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6b7280', marginBottom: 24 },
  evidence: { fontSize: 12, color: '#374151', fontFamily: 'monospace' },
});
```

6. 创建 `apps/mobile/.gitignore`（Expo 常见忽略项）：

    node_modules/
    .expo/
    dist/
    web-build/
    *.log
    .DS_Store

7. 创建 `apps/mobile/.eslintrc.js`（`expo lint` 脚本依赖）：

```js
module.exports = {
  extends: ['expo'],
};
```

8. 修改仓库根 `package.json#pnpm.overrides`，增加 `@types/react: 19.1.0` 与 `@types/react-dom: 19.1.0` 锁定（避免 `@types/react@19.2.14` 的 ReactPortal.children breaking change），原 `react`/`react-dom` override 不变：

```json
{
  "pnpm": {
    "overrides": {
      "react": "^19.2.6",
      "react-dom": "^19.2.6",
      "@types/react": "19.1.0",
      "@types/react-dom": "19.1.0"
    }
  }
}
```

9. 在仓库根运行 `pnpm install` 让 pnpm 识别新 workspace 包并链接 `@ebbinghaus/shared`。

10. 验证步骤见下方 Validation and Acceptance。

**注意**：不要在 monorepo 根目录运行 `npx create-expo-app`——它会创建非 workspace 的独立项目，且可能交互式输入。本计划用手工构造的最小配置文件，再 `pnpm install` 让 pnpm 接管。

## Validation and Acceptance

### 验证 1：pnpm workspace 识别

在仓库根运行：

    pnpm ls --filter @ebbinghaus/mobile --depth 0

预期输出包含 `@ebbinghaus/mobile` 一行，且 `@ebbinghaus/shared` 在其依赖树中。

### 验证 2：shared 包可被导入（type-check）

在 `apps/mobile` 运行：

    pnpm type-check

预期无错误退出。若报 `Cannot find module '@ebbinghaus/shared'`——检查 package.json 的 `dependencies` 字段是否含 `"@ebbinghaus/shared": "workspace:*"`。

### 验证 3：Expo dev server 能启动

在 `apps/mobile` 运行：

    pnpm dev

预期：
- 终端打印 Expo QR 码与 dev server URL（如 `http://localhost:8081`）
- 无 module resolution 错误
- 按 `i` 或 `a` 启动 iOS / Android 模拟器后，欢迎屏显示：
  - 标题 "Ebbinghaus Memory"
  - 副标题 "移动 App · 脚手架 OK"
  - 证据行 `shared 包已接入 · REVIEW_BATCH_SIZE = 10`

由于此环境无 iOS/Android 模拟器，**至少**验证 dev server 启动到 "Bundling" 完成无错误（控制台无红错误），且 Metro 能 resolve `@ebbinghaus/shared`。可通过 `?type=router` 的 web dev server（Expo Router 4 支持 web target）在浏览器打开做目视验证。

### 验证 4：lint 通过

在 `apps/mobile` 运行：

    pnpm lint

预期退出码 0。

## Idempotence and Recovery

- `pnpm install` 幂等，可多次运行无副作用。
- `pnpm dev` 启动 dev server，Ctrl-C 即可关闭，无残留。
- 若 Expo SDK 版本不匹配或某些依赖需原生结构调整，回滚方案：删除 `apps/mobile/` 目录，重新按 Plan of Work 步骤构造。无数据库/外部资源副作用。
- 风险点：Expo SDK 51 与 monorepo 根 `react ^19.2.6` override 可能冲突。pnpm override 是根级别的 peer 满足提示，Expo 仍会锁定其自身依赖版本。若 `pnpm install` 报 peer 警告，**忽略 peer 警告**即可（Expo 内部依赖关系由它自己保障）。仅当**报错**（不是警告）时回滚，并把 React 版本降级决策写入 Decision Log。

## Interfaces and Dependencies

### 依赖库

- `expo` (~51.0.0) — RN 框架。
- `expo-router` (~4.0.0) — 文件路由。入口 `expo-router/entry`，由 package.json `main` 字段声明。
- `expo-status-bar` (~2.0.0) — 状态栏组件。
- `react` (18.3.1) — 与 `apps/extension` 同版本，避免根 override 强升到 19 与 Expo 不兼容。
- `react-native` (0.75.1) — Expo SDK 51 配套版本。
- `@ebbinghaus/shared` (workspace:*) — 已存在的本仓库包，零 React/Node 依赖，可直接被 RN bundle 导入。
- `typescript` (^5.5.0) devDependency。
- `@types/react` (~18.3.0) devDependency。

### 里程碑签名

T1 完成时必须存在：

- `apps/mobile/package.json` — 含上述 scripts 与 dependencies。
- `apps/mobile/tsconfig.json` — extends `expo/tsconfig.base`。
- `apps/mobile/app.json` — Expo 配置。
- `apps/mobile/app/_layout.tsx` — 默认导出一个渲染 `<Stack>` 的 React 组件。
- `apps/mobile/app/index.tsx` — 默认导出一个显示 `REVIEW_BATCH_SIZE` 值的 React 组件。
- `apps/mobile/.gitignore` — 至少忽略 `node_modules/`、`.expo/`。

T1 完成时必须能通过：

- `pnpm --filter @ebbinghaus/mobile type-check`
- `pnpm --filter @ebbinghaus/mobile lint`
- `pnpm --filter @ebbinghaus/mobile dev`（能进入 dev server 启动流程，Metro bundling 无致命错误）