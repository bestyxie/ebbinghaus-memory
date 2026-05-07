# 输出轨道 SM-2 数据迁移

## 概述

此脚本用于为现有卡片计算并初始化输出轨道的 SM-2 字段：
- `outputRepetitions` - 输出练习连续正确次数
- `outputInterval` - 输出轨道间隔天数
- `outputEaseFactor` - 输出轨道易记因子
- `outputNextReviewAt` - 输出轨道下次复习时间

## 迁移逻辑

### 1. 有 OutputPracticeLog 记录的卡片
基于历史练习记录使用 SM-2 算法重新计算：
- Level 1-2: 自动判题，正确=5分，错误=1分
- Level 3-4: 用户自评，正确=4分，错误=2分
- 按时间顺序遍历所有记录，计算最终的 SM-2 值

### 2. 无 OutputPracticeLog 但已激活的卡片
如果 `repetitions >= 3`（输入轨道已激活）：
- 设置初始值：`outputInterval=1`, `outputRepetitions=0`, `outputEaseFactor=2.5`
- 设置 `outputNextReviewAt` 为当前时间（立即可复习）

### 3. 新卡片
保持初始值不变：
- `outputInterval=0`, `outputRepetitions=0`, `outputEaseFactor=2.5`
- `outputNextReviewAt=null`

## 运行方式

### 方式一：使用 npm 脚本
```bash
pnpm migrate:output-track
```

### 方式二：直接运行
```bash
npx tsx prisma/migrations/20260403141031_add_output_track_sm2/migrate_output_track.ts
```

## 注意事项

1. **备份数据**：运行前请备份数据库
2. **停止服务**：建议在低峰期运行，避免并发问题
3. **幂等性**：脚本可以安全地多次运行
4. **时间消耗**：取决于卡片数量，可能需要几分钟到几十分钟

## 验证结果

迁移完成后，可以检查：
```sql
-- 查看输出轨道已激活的卡片数
SELECT COUNT(*) FROM "cards" WHERE "outputNextReviewAt" IS NOT NULL;

-- 查看具体的输出轨道状态
SELECT
  id,
  "outputRepetitions",
  "outputInterval",
  "outputEaseFactor",
  "outputNextReviewAt"
FROM "cards"
WHERE "outputNextReviewAt" IS NOT NULL
LIMIT 10;
```
