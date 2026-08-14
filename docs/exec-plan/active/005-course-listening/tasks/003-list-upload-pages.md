# T3: 课程列表 + 上传页

## Goal

`/courses` 列表与 `/courses/new` 上传页可用，导航入口就位，上传→转写→READY 闭环走通。

## Steps

1. `navigation.tsx` navItems 加 `{ href: "/courses", label: "Courses", icon: "GraduationCap" }`（iconMap 补 lucide 图标）
2. `/courses` 页：封面卡片网格（无封面显示占位 icon），标题/时长/句数/进度条/状态徽标；PROCESSING 或 FAILED 卡片带"开始转写/重试"按钮（触发 transcribe 后轮询刷新）；READY 卡点击进 `/courses/[id]`；删除按钮（confirm）
3. `/courses/new` 页：
   - 文件选择（accept audio/*|video/*，>100MB 前端拦截）
   - 可选封面选择（accept image/*）
   - 标题输入（默认取文件名去扩展名）
   - 视频且未选封面：`URL.createObjectURL` + `<video>` + `canvas.drawImage` 截第一帧 → `toBlob('image/jpeg', 0.8)`
   - 提交：FormData（media/cover/title）→ `POST /api/courses` → `POST transcribe` 挂起 → 完成跳 `/courses`，失败显示错误与重试
   - 上传/转写过程显示进度态（禁用按钮）
4. 客户端数据获取：跟随现有页面模式（先读 dashboard/translate 页确认 fetch 方式），不引入新状态库

## Verification

- `pnpm --filter web type-check` / `lint` 通过
- agent-browser 实测（CLAUDE.md 强制）：登录（test@test.com）→ 导航见 Courses → 上传带封面的音频课程 → 转写 READY → 列表可见；上传无封面视频 → 列表封面为自动截帧
- 截图留证

## Non-Goals

- 学习页（T4）；课程编辑/重命名
