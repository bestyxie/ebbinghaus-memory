# ADR 0001: 发音评分使用独立评分引擎，不复用语音转写

课程口语学习的逐词发音评分通过独立的评分引擎抽象（ScoreProvider，输入录音 + 目标文本 → 输出每词的评分与录音内起止偏移 + 综合评分）获得，而非复用现有的语音转写链路（Groq whisper-large-v3-turbo / mimo）。转写引擎返回的是识别置信度，对"读错但可辨认"的词（如 think 读成 sink）置信度仍接近满分，无法检测发音不准；发音评分必须由比对音素级声学输出的引擎提供。接口需含录音内偏移，用于逐词回放用户录音。将引擎隔离在接口之后，使选型可以独立于领域与数据模型决策：候选引擎（Azure Speech Pronunciation Assessment——真实音素级分数、免费 5h/月、eastasia 可达；Qwen-Omni via DashScope——中国原生、近免费、但分数为 LLM 判断未经标定）在免费额度、中国可达性与评分可信度上各有取舍，后续单独评估替换不影响上层。

**Status**: accepted

**Considered Options**:
- 复用转写（Groq/mimo）逐词比对——零新依赖，但只能判"对不对"，判不了"准不准"，已否定
- 自托管 OSS 流水线（MFA+GOP / ESPnet speechocean762）——2-4 人周成本，阶段不符，已否定
- 商用 API（Speechace/ELSA）——付费门槛 + 无中国节点，暂不采用