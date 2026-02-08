-- CreateIndex
-- Add indexes for ReviewLog query performance optimization
CREATE INDEX "ReviewLog_userId_idx" ON "ReviewLog"("userId");

-- CreateIndex
CREATE INDEX "ReviewLog_userId_rating_idx" ON "ReviewLog"("userId", "rating");
