# T5: 课程列表弹窗入口 + 进度展示

**Status**: done
**Started**: 2026-08-18
**Completed**: 2026-08-18

## 目标

做完后：课程列表"开始学习/继续学习"改为打开弹窗——听力学习按钮（按听力进度标开始/继续）+ 三个难度口语按钮（各显示 x/y 句与开始/继续，按 SpeakingProgress），点击直达对应页面。口语进度在弹窗打开时按需获取。

## 涉及文件

- `apps/web/app/(pages)/courses/courses-client.tsx` — 列表卡片按钮 → 弹窗；新增 `LearnModeModal`

## 验证方式

    pnpm type-check && pnpm lint
    # agent-browser：点"开始学习"→ 弹窗出现听力+三难度（各显 0/N）→ 难度按钮直达口语页

## 执行记录

- 卡片"开始学习/继续学习"由 `<Link>` 改为 button，打开 `LearnModeModal`。
- `LearnModeModal` 打开时 `GET /api/courses/[id]/speak` 按需取三难度进度；听力入口复用卡片已带的 CourseProgress；难度按钮显示 `x/y 句` + 开始/继续/已完成。
- 弹窗口语进度拉取失败不阻断听力入口（难度按钮显示 0/N 占位）。

## 产出摘要

agent-browser 实测：点"开始学习"→ 弹窗出现"听力学习 开始学习 + 简单/中等/困难 0/25 句开始"；播种进度后正确显示"简单 3/25 句继续""中等 0/25 句开始""困难 已完成"；点"简单"直达 `/speak?level=EASY`。156 web 单测 + type-check + lint 全绿。