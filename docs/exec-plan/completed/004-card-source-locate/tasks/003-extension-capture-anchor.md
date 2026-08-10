# T3: 扩展捕获链路（anchor 计算 + DTO 映射 + 入库）

**Status**: done
**Started**: 2026-08-10 12:50Z
**Completed**: 2026-08-10 12:55Z

## 目标

扩展选词捕获时计算 sourceAnchor（CSS 路径 + 上下文 + occurrence）和 Text Fragment URL，透传到 QueuedWord → DTO → API 入库。完成后扩展单测覆盖 anchor 计算和 fragment 构造，DTO 含完整六字段，type-check 通过。

## 涉及文件

- `apps/extension/utils/compute-source-anchor.ts` — **新增**，纯函数：CSS 路径 + 上下文 + occurrence
- `apps/extension/utils/__tests__/compute-source-anchor.unit.test.ts` — **新增**，测试 anchor 计算
- `apps/extension/utils/build-text-fragment.ts` — **新增**，纯函数：构造 `#:~:text=` fragment URL
- `apps/extension/utils/__tests__/build-text-fragment.unit.test.ts` — **新增**，测试 fragment 构造
- `apps/extension/lib/storage.ts` — `QueuedWord.context` 新增 `source_anchor?` / `source_title?` / `captured_at?`，导出 `SourceAnchor` 类型
- `apps/extension/components/WordCapture.tsx` — `handleSelection` 内调用 anchor 计算 + fragment URL，存入 `translateButtonData`
- `apps/extension/components/CaptureTooltip.tsx` — props 新增 anchor/title/capturedAt，`handleSave` 写入 QueuedWord
- `apps/extension/lib/to-flashcard-dto.ts` — 映射 sourceAnchor + sourceTitle + capturedAt
- `apps/extension/lib/ebbinghaus-api.test.ts` — 更新 `toFlashcardDTO` 断言含新字段

## 验证方式

    cd apps/extension && npx vitest run lib/ebbinghaus-api.test.ts
    cd apps/extension && npx vitest run utils/__tests__/
    cd apps/extension && npx tsc --noEmit

预期：所有新增 + 现有测试通过；tsc 无新增错误（预存错误除外）。

## 执行记录

- 新增 `compute-source-anchor.ts`：`computeCssPath`（向上遍历到 body，ID 短路，nth-of-type 消歧）、`extractContext`（选区前后 ~40 字符）、`countOccurrenceInParent`（父块内出现次数）、`computeSourceAnchor` 组合三者
- 新增 `build-text-fragment.ts`：构造 `#:~:text=prefix-selected,-suffix`，前缀/后缀取 ctx 中选中词前后文本，各 trim 到 20 字符
- `QueuedWord.context` 新增 `source_anchor?` / `source_title?` / `captured_at?`，导出 `SourceAnchor` 类型
- `WordCapture.tsx`：`handleSelection` 调用 `computeSourceAnchor(range, selectedText)` + `buildTextFragmentUrl`，结果存入 `translateButtonData`；`handleTranslateButtonClick` 透传到 `tooltipData`
- `CaptureTooltip.tsx`：props 新增 `sourceAnchor` / `sourceTitle` / `capturedAt`；`handleSave` 写入 QueuedWord.context
- `to-flashcard-dto.ts`：条件展开 `sourceAnchor` / `sourceTitle` / `capturedAt`（无值时不包含，避免 null 传入 API）
- 测试：`compute-source-anchor.unit.test.ts` 13 个、`build-text-fragment.unit.test.ts` 7 个、`ebbinghaus-api.test.ts` 新增 3 个 anchor/title/capturedAt 断言，共 49 个通过
- 测试修正：CSS path 遇 ID 短路（设计如此），fragment prefix/suffix trim 后无空格
- shared/web type-check 通过

## 产出摘要

扩展捕获链路完整实现：选词时计算 `{ sel, ctx, occ }` anchor + Text Fragment URL，透传 `QueuedWord` → `CaptureTooltip` → `toFlashcardDTO` → API。`to-flashcard-dto` 现映射完整六字段（sourceUrl + sourceWord + sourceAnchor + sourceTitle + capturedAt + sourceProvenance）。49 个单测通过，type-check 通过。
