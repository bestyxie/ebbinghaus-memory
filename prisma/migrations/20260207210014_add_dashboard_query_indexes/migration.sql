-- CreateIndex
-- Add indexes for dashboard query performance optimization
CREATE INDEX "Card_userId_createdAt_idx" ON "Card"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Card_userId_easeFactor_idx" ON "Card"("userId", "easeFactor");
