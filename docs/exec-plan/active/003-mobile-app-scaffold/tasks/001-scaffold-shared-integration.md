# T1: Expo 脚手架 + monorepo + @ebbinghaus/shared 接入

**Status**: done
**Started**: 2026-08-06
**Completed**: 2026-08-06

## 目标

做完后系统多出 `apps/mobile` 一个 Expo React Native 工作区包。它能：

1. 被 `pnpm --filter @ebbinghaus/mobile` 识别。
2. `pnpm --filter @ebbinghaus/mobile type-check` 通过。
3. `pnpm --filter @ebbinghaus/mobile lint` 通过。
4. `pnpm --filter @ebbinghaus/mobile dev` 启动 Metro dev server，无 module resolution 错误。
5. 欢迎屏渲染正确，显示来自 `@ebbinghaus/shared` 的 `REVIEW_BATCH_SIZE` 常量值（10）作为"共享层已打通"的可观察证据。

## 涉及文件

新建：
- `apps/mobile/package.json`
- `apps/mobile/tsconfig.json`
- `apps/mobile/app.json`
- `apps/mobile/app/_layout.tsx`
- `apps/mobile/app/index.tsx`
- `apps/mobile/.eslintrc.js`
- `apps/mobile/.gitignore`

修改：
- `package.json`（根，加入 `pnpm.overrides` 字段 `@types/react: 19.1.0` 与 `@types/react-dom: 19.1.0`）

不修改：`pnpm-workspace.yaml`、`turbo.json` 已含 `apps/*` 与 `type-check`/`lint` pipeline。

## 验证方式

在仓库根依次运行：

    pnpm install
    pnpm --filter @ebbinghaus/mobile type-check
    pnpm --filter @ebbinghaus/mobile lint
    pnpm --filter @ebbinghaus/mobile dev

预期：
- type-check 退出码 0
- lint 退出码 0
- dev 启动后看到 Expo QR 与 dev server URL，控制台无红色错误
- 在 Expo web target 打开 dev server（或按 `w`）能看到欢迎屏，文本含 `REVIEW_BATCH_SIZE = 10`

## 执行记录

- 初版按 plan 写 SDK 51 + expo-router 4 + RN 0.75 + React 18.3.1 → `pnpm install` 报 `expo-router 4.0.22` peer `expo-constants ~17` 不匹配（SDK 51 自带 16）。说明 expo-router 4 是 SDK 52 配套。
- 改为 SDK 52 + expo-router 4 + RN 0.76 + React 18.3.1：`pnpm install` 通过，但 dev server 启动后 Expo 提示 `react@19.2.6 - expected version: 18.3.1`——根 pnpm override 把 mobile 的 React 强升到 19.2.6。
- 改为 SDK 53 + expo-router 5.1 + RN 0.79 + React 19.2.6 + `@types/react ~19.0.0`：type-check 报 TS2786（`Property 'refs' is missing in type 'NativeMethods & TextComponent'`），是 `@types/react@19.2.14` 的 React 19 refs 字段要求与 RN 0.79 内部类型不兼容。
- 在根 `package.json#pnpm.overrides` 增加 `@types/react: 19.1.0` 与 `@types/react-dom: 19.1.0` 锁版本避开 19.2.14 的 breaking change。
- 验证最终通过：mobile type-check exit 0、lint exit 0、`expo start` 启动 Metro Bundler 且 `Waiting on http://localhost:8081`，无红色错误。
- 期间验证 web 时发现 HEAD 上 `pnpm turbo type-check --force` 报 14 处 web pre-existing TS 错误（被 husky pre-commit 的 turbo 缓存假阳性通过隐藏），与 mobile 无关，本 task 不修，记为 plan 的 Surprise。

## 产出摘要

新增工作区包 `@ebbinghaus/mobile`（`apps/mobile/`），7 个新建文件 + 1 个对根 `package.json` 的 override 扩展。

- `apps/mobile/package.json`：Expo SDK 53 + expo-router 5.1 + RN 0.79 + React 19.2.6，三个 script（`dev`/`type-check`/`lint`），`@ebbinghaus/shared` 以 `workspace:*` 接入。
- `apps/mobile/tsconfig.json`：继承 `expo/tsconfig.base`，开启 strict。
- `apps/mobile/app.json`：Expo 配置（slug `ebbinghaus-memory`、scheme `ebbinghaus`、portrait、expo-router plugin）。
- `apps/mobile/app/_layout.tsx`：Expo Router 根布局，渲染 `<Stack>` + `<StatusBar>`。
- `apps/mobile/app/index.tsx`：欢迎屏，导入并显示 `@ebbinghaus/shared` 的 `REVIEW_BATCH_SIZE = 10`，作为"shared 包接入成功"的可观察证据。
- `apps/mobile/.eslintrc.js`：`extends: ['expo']`，让 `expo lint` 可用。
- `apps/mobile/.gitignore`：忽略 `node_modules/`、`.expo/`、`dist/`、`web-build/`、`*.log`、`.DS_Store`。
- 根 `package.json#pnpm.overrides`：扩展加 `@types/react: 19.1.0` 与 `@types/react-dom: 19.1.0`，避免 `@types/react@19.2.14` 的 ReactPortal.children breaking change。

意外发现（不在本 task 修复范围）：web 在 HEAD 上有 14 处 pre-existing TS 错误，被 husky pre-commit 的 turbo 缓存假阳性通过。下一份 plan 应专门修正。