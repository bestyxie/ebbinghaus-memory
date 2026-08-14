# T4: 学习页听写交互

## Goal

`/courses/[id]` 学习页：逐句听写完整交互（空格键流），进度持久化，课程完成态。

## Steps

1. 页面骨架：顶部标题 + `第 N / M 句` + 退出；中间句子区；底部按钮区（播放语音/提交/显示正确答案）。桌面优先
2. 单 `<audio>` 元素加载 `/api/courses/[id]/media`；`playSentenceTwice(sentence)`：`currentTime=startMs/1000` 播放，`timeupdate` 到 endMs 暂停，间隔 ~400ms 再播一遍
3. 句子渲染：`words.map`——isProperNoun → 正常样式纯文本；普通词 → 下划线输入框（`width: ch` 按词长，min 3ch），仅末尾无空格纯文本输入
4. 空格键流（核心，对照设计文档状态机）：
   - keydown 空格（值非空）→ preventDefault → 跳下一框
   - 最后一框空格 → 自动比对（compareWord）
   - 全对：整句绿锁定 → 显示"下一句"按钮 + Enter 键进下一句
   - 有错：错框红（保留输入可改）、对框灰锁定 readOnly；焦点进第一个错框
   - 修正后最后一框空格或"提交"按钮：只比未锁定框
   - Backspace 在空框 → preventDefault → 回上一未锁定框
5. "播放语音"按钮：再听两遍；"显示正确答案"：全部填入正确词、与用户输入不同的框标红、锁定整句、出现"下一句"
6. 进度：每句完成（全对/揭示）→ `PUT progress`（sentenceIndex、completedSentenceIds 追加）；首句开始前恢复进度；最后一句完成 → status=COMPLETED + 完成态 UI（重来按钮 = 清零 progress）
7. 组件拆分：`SentenceBoard`（词框渲染）、`useSentenceAudio`（播放 hook）、`useDictationFlow`（状态机 hook）；状态机纯逻辑提为可测函数放 lib 并单测

## Verification

- `pnpm --filter web test`（状态机纯逻辑测试）全绿；`type-check`/`lint` 通过
- agent-browser 实测完整流：进入句子自动播两遍 → 逐词输入空格跳格 → 末框空格全对变绿 → 回车进下一句；故意输错 → 红框可改、对框灰锁；显示答案 → 红标差异 → 下一句；刷新页面进度恢复
- 截图留证

## Non-Goals

- 口语模式；倍速/快捷键设置；错词生成卡片
