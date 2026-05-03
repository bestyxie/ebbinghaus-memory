# TypeScript 类型安全指引

零妥协策略。类型系统是防止运行时错误的第一道防线。

---

## 禁止的模式（均有 lint 强制）

### 禁止 `as` 类型断言（`as const` 除外）

lint: `typescript/consistent-type-assertions`。用类型守卫或 Zod 在边界处解析替代。

### 禁止 `any`

lint: `typescript/no-explicit-any`。用 `unknown` + 类型收窄替代。

### 禁止 `@ts-ignore` / `@ts-expect-error`

lint: `typescript/ban-ts-comment`。测试文件中 `@ts-expect-error` 豁免。

### 禁止 `!` 非空断言

lint: `typescript/no-non-null-assertion`。用 `?.` + `??` 或条件检查替代。

---
