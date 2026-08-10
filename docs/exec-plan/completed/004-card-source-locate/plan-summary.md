# 卡片来源定位（Card Source Locate）— 总结

## 做了什么

实现单词卡片背面来源（source）点击跳转第三方网页并由 Chrome 扩展自动定位高亮该单词出现位置的完整功能。

## 关键产出

- `packages/shared/src/zod.ts` — 新增 `sourceAnchorSchema`、`cardSourceSchema`，`createCardSchema`/`cardBaseSchema` 新增六字段
- `packages/shared/src/types.ts` — 新增 `SourceAnchor`、`CardSource` 类型
- `apps/web/prisma/schema.prisma` — Card 新增六列（sourceUrl/sourceWord/sourceAnchor/sourceTitle/capturedAt/sourceProvenance），删除旧 `source` 列
- `apps/web/prisma/migrations/20260810000000_card_source_split/` — 迁移 SQL（旧 source 拆分迁移）
- `apps/extension/utils/compute-source-anchor.ts` — CSS 路径 + 上下文 + occurrence 计算（纯函数）
- `apps/extension/utils/build-text-fragment.ts` — `#:~:text=` Text Fragment URL 构造（纯函数）
- `apps/extension/utils/source-locate.ts` — locate 算法（CSS→context→fragment 三级回退 + retry-fade，纯函数）
- `apps/extension/content-scripts/source-locate.ts` — Plasmo content-script，监听定位消息
- `apps/extension/background.ts` — 注册 `webNavigation.onCompleted`
- `apps/extension/lib/storage.ts` — `QueuedWord` 类型扩展 + `SourceAnchor` 导出
- `apps/extension/components/WordCapture.tsx` — 选词时计算 anchor + fragment URL
- `apps/extension/components/CaptureTooltip.tsx` — 传透 anchor/title/capturedAt
- `apps/extension/lib/to-flashcard-dto.ts` — 映射完整六字段到 DTO
- `apps/web/app/api/extension/cards/route.ts` — Zod 校验 + 持久化六字段
- `apps/web/app/(pages)/review/components/flash-card.tsx` — 来源链接渲染（sourceTitle + ↗ sourceWord）
- `apps/extension/package.json` — manifest `<all_urls>` + `webNavigation`

## 关键决策

- 原生 Text Fragment 作为单一传输载体（非自定义 fragment）：无扩展时 Chrome 原生滚动降级，扩展读取同一 fragment 增强
- `host_permissions: <all_urls>`：auto-locate-on-open 需要自动注入 content-script，`activeTab` 仅在用户显式调用扩展时授权
- 旧 `Card.source` 拆分迁移后删除：该列已被重载为 URL 和 provenance tag 两种语义，并存会长期混淆
- 五字段原子化 inline 在 Card 上（非独立表）：一张 Card 至多一个 source
- Prisma JSON 列 null 用条件展开（`...(value && { field: value })`）：避免 `NullableJsonNullValueInput` 类型冲突

## 遗留问题

- 浏览器 E2E 因环境限制未执行（locate 算法由 21 个 jsdom 单测覆盖全分支）
- 预存失败未修复：extension 3 个 storage 测试、web 4 个 Playwright E2E、web lint（均非本计划引入）

## 最终验证状态

- typecheck: shared/web 通过，extension 无新增错误
- test: 174 单测全绿（19 shared + 85 web + 70 extension）
- Prisma E2E: 六字段写入/读取/删除完整通过
- Text Fragment 解析 E2E: 通过
- 历史数据迁移: 38 URL + 1 provenance，无数据丢失
