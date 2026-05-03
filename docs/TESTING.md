# 单元测试规范

技术栈：[vitest](https://vitest.dev/)。

---

## 文件放置与命名

每个 `src/` 下含 function/class 的 `.ts` 文件必须有对应 `.unit.test.ts`。lint: `local/require-unit-test`。

豁免：`.tsx`、`index.ts`、`.d.ts`、`*.config.ts`、测试文件自身、`__tests__/` 下的文件。

测试文件放同级 `__tests__/` 目录，命名 `<源文件名>.<类别>.test.ts`（类别：`unit` / `integration`）。

```
src/i18n/
├── __tests__/
│   └── detectLanguage.unit.test.ts
└── detectLanguage.ts
```

用例过多时可拆分：`buildTraceTree.unit.test.ts` + `buildTraceTree.edge-cases.unit.test.ts`。

---

## 测试结构

- 通过 `../` 导入被测模块
- `describe` 用被测函数名，`it` 用英文动词短语
- AAA 结构（Arrange → Act → Assert），短测试可合并

---

## 测试范围

**测试行为，不测实现。** 验证「给定 X 输出 Y」。

| 必须测试                     | 不需要测试     |
| ---------------------------- | -------------- |
| `shared/util/` 工具函数      | 组件渲染、样式 |
| 组件 `utils/`                | 第三方库行为   |
| Zod Schema 边界解析          | 纯类型定义     |
| 纯逻辑 hooks、状态机/reducer | 配置文件       |
| endpoints                    | 接口           |

---

## 覆盖率

所有函数和 class **100% 覆盖**，每条分支必须被测到。

```bash
pnpm test                    # 全部测试
pnpm test:coverage           # 覆盖率报告
```

---

## `__internal` 暴露内部实现

未导出的内部函数需要满足覆盖率时，通过 `__internal` 导出。优先通过公共 API 间接覆盖。

```ts
export function parseTrace(raw: string): Trace { ... }
function normalizeTimestamp(ts: string): number { ... }
export const __internal = { normalizeTimestamp };
```

- 不计入单文件单 export 限制（lint 已豁免）
- 生产代码禁止导入 `__internal`。lint: `local/no-internal-import`
- 也用于暴露状态重置方法（如 `resetCache`）

---

## Mock 与隔离

- 全局状态在 `beforeEach` 中通过 `__internal.resetCache()` 等重置
- 浏览器 API 用最小化手写 stub，不引入 mock 库
- `@ts-expect-error` 仅允许在测试文件中使用，每处必须附注释

---

## 风格要求

| 规则            | 说明                                     |
| --------------- | ---------------------------------------- |
| 测试间独立      | 不共享状态，不依赖执行顺序               |
| 断言精确        | 优先 `toBe`/`toEqual`，避免 `toBeTruthy` |
| 不用快照测试    | 快照易过时且审查成本高                   |
| 遵守 300 行上限 | 超过时拆分为多个测试文件                 |
| TS 严格模式     | `@ts-expect-error` 为唯一例外            |
