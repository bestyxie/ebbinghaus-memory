# T5: 扩展定位 content-script + locate 算法 + webNavigation 注册

**Status**: done
**Started**: 2026-08-10 13:05Z
**Completed**: 2026-08-10 13:15Z

## 目标

扩展在第三方页面打开含 Text Fragment 的 URL 时，自动定位并高亮目标单词。locate 算法为纯函数（CSS 锚点 → 上下文搜索 → fragment 兜底），带 MutationObserver retry-fade。完成后扩展单测覆盖 locate 算法三分支 + retry 逻辑，type-check 通过。

## 涉及文件

- `apps/extension/utils/source-locate.ts` — **新增**，纯函数 locate 算法
- `apps/extension/utils/__tests__/source-locate.unit.test.ts` — **新增**，测试三分支 + retry
- `apps/extension/content-scripts/source-locate.ts` — **新增**，Plasmo content-script，监听 background 消息执行 locate
- `apps/extension/background.ts` — 注册 `webNavigation.onCompleted`，发消息给 content-script
- `apps/extension/package.json` — manifest: `host_permissions: <all_urls>` + `permissions` 加 `webNavigation`

## 验证方式

    cd apps/extension && npx vitest run utils/__tests__/source-locate.unit.test.ts
    cd apps/extension && npx tsc --noEmit

预期：locate 算法单测通过；tsc 无新增错误。

## 执行记录

- `source-locate.ts`：纯函数实现 locate 算法——`locateByCss`（CSS 选择器快路径）、`locateByContext`（TreeWalker 上下文搜索）、`locateByFragment`（解析 Text Fragment 兜底）、`locate` 组合三者按 spec 顺序回退
- `locateWithRetry`：MutationObserver 式重试（setTimeout 链），maxRetries=8，exponential 100ms→1.6s cap，10s 总预算，耗尽静默 bail
- `highlightElement`：2px #ffd54f outline + smooth scrollIntoView + 点击外部取消高亮；scrollIntoView 加 typeof guard（jsdom 不支持）
- `parseTextFragment`：解析 `:~:text=[prefix-]text[,-suffix]` 格式，先从右边分离 `-suffix`，再从左边分离 `prefix-`，取中间 text
- `content-scripts/source-locate.ts`：Plasmo content-script，`document_idle`，监听 `ebbinghaus-source-locate` 消息调用 `locateWithRetry`
- `background.ts`：注册 `webNavigation.onCompleted`，仅处理 `frameId===0` + URL 含 `:~:text=` 的导航，解析 `#ebbinghaus-anchor=` 参数获取 anchor，发消息给 tab
- `package.json` manifest：`host_permissions` 加 `<all_urls>`，`permissions` 加 `webNavigation`
- 21 个 locate 单测通过（CSS/context/fragment 三分支 + retry 成功/失败 + retry delay 指数 + parseTextFragment 边界）
- 70 个 extension 总单测通过，shared/web type-check 通过，无新增 TS 错误（预存错误除外）

## 产出摘要

扩展定位链路完整实现：`source-locate.ts` 纯函数定位算法（CSS→context→fragment 三级回退 + retry-fade），21 个单测覆盖全部分支。`content-scripts/source-locate.ts` Plasmo content-script 监听消息。`background.ts` 注册 `webNavigation.onCompleted` 过滤含 Text Fragment 的导航。manifest 声明 `<all_urls>` + `webNavigation`。70 个 extension 单测通过，type-check 通过。
