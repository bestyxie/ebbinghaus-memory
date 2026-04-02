# AI 记忆辅助功能

## 概述

集成 **智谱 AI（Zhipu AI）GLM-4 模型**，为词汇类卡片批量生成助记文本，帮助用户通过联想故事、语音记忆等方式更牢固地记住单词。

---

## 功能入口

**位置**：仪表盘 → 操作栏 → "AI 记忆"按钮

**组件**：`/workspace/app/(pages)/dashboard/components/ai-memory-modal.tsx`

---

## 使用流程

```
用户在仪表盘勾选多张闪卡
          │
          ▼
点击"AI 记忆"按钮
          │
          ▼
打开 AIMemoryModal 弹窗
  ┌──────────────────────────────────────┐
  │  已选词汇：                            │
  │  ephemeral / ubiquitous / serendipity │
  │  ─────────────────────────────────── │
  │  [生成记忆文本]                        │
  └──────────────────────────────────────┘
          │
          ▼
POST /api/ai/generate-memory-text {
  cardFronts: ["ephemeral", "ubiquitous", "serendipity"]
}
          │
          ▼
调用 Zhipu AI GLM-4
          │
          ▼
显示生成结果（Markdown 格式）
  ┌──────────────────────────────────────┐
  │  ## 记忆故事                           │
  │  在一个无处不在（ubiquitous）的数字...  │
  │                                       │
  │  ## 词汇详解                           │
  │  **ephemeral** [ɪˈfem.ər.əl]          │
  │  - 含义：短暂的，昙花一现的             │
  │  - 助记：e + femoral → 女性的腿...     │
  │  - 同义词：transient, fleeting         │
  └──────────────────────────────────────┘
```

---

## API 接口

**端点**：`POST /api/ai/generate-memory-text`

**文件**：`/workspace/app/api/ai/generate-memory-text/route.ts`

### 请求体

```json
{
  "cardFronts": ["ephemeral", "ubiquitous", "serendipity"]
}
```

**验证**：Zod Schema `generateMemoryTextSchema`

### 响应

成功：
```json
{
  "text": "## 记忆故事\n\n..."
}
```

失败：
```json
{
  "error": "生成失败：..."
}
```

---

## AI 调用实现

**文件**：`/workspace/app/lib/ai.ts`

### 调用参数

| 参数 | 值 | 说明 |
|------|----|------|
| 模型 | GLM-4 | 智谱 AI 旗舰模型 |
| temperature | 0.7 | 创意性与一致性平衡 |
| 调用方式 | Chat Completion API | 标准 OpenAI 兼容接口 |

### 系统提示（System Prompt）逻辑

AI 被指示执行以下任务：
1. **语义分组**：将输入词汇按含义/用法相似度分组
2. **创作记忆故事**：将词汇串联成有意义的上下文场景
3. **词汇详解**：为每个词提供：
   - 音标（国际音标）
   - 中文含义
   - 联想助记技巧
   - 同义词/近义词
4. **Markdown 格式**输出，便于渲染

---

## 输出示例（Markdown）

```markdown
## 记忆故事

在一个科技**无处不在**（ubiquitous）的未来城市里，一次**偶然的美好发现**
（serendipity）让主角找到了一种**短暂**（ephemeral）但珍贵的平静...

---

## 词汇详解

### ephemeral [ɪˈfem.ər.əl]
**含义**：短暂的、转瞬即逝的
**助记**：想象 "e + femoral"（股骨），骨头坚固但生命短暂
**同义词**：transient, fleeting, momentary

### ubiquitous [juːˈbɪk.wɪ.təs]
**含义**：无处不在的、普遍存在的
**助记**："u + bi（两个）+ quit（退出）+ us" → 两个出口都有我们
**同义词**：omnipresent, pervasive, universal

### serendipity [ˌser.ənˈdɪp.ɪ.ti]
**含义**：意外的好运、偶然发现美好事物的能力
**助记**：来自波斯故事《锡兰三王子》（Serendip 是斯里兰卡旧名）
**同义词**：fortune, luck, happy chance
```

---

## 环境变量

| 变量 | 用途 |
|------|------|
| `ZHIPU_API_KEY` | 智谱 AI API 密钥 |

---

## 错误处理

| 错误场景 | 处理方式 |
|----------|----------|
| API 密钥无效 | 返回 500 错误，显示友好提示 |
| 网络超时 | 捕获错误，返回 `{ error: "..." }` |
| 输入为空 | Zod 验证拦截，返回 400 |
| 生成内容为空 | 返回提示"生成失败，请重试" |

---

## 适用场景

- **词汇记忆**：英语单词、专业术语
- **概念记忆**：需要理解关联的知识点
- **批量处理**：一次处理多个相关词汇，建立关联记忆

> 注意：AI 生成内容仅供参考，用户可根据自己的理解方式调整记忆技巧。
