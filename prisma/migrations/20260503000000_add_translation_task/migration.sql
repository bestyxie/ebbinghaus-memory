-- AlterEnum
CREATE TYPE "TranslationTaskStatus" AS ENUM ('PENDING', 'COMPLETED', 'NEEDS_REVIEW');

-- CreateTable
CREATE TABLE "TranslationTask" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "sourceText" TEXT NOT NULL,
    "userTranslation" TEXT,
    "score" INTEGER,
    "accuracyScore" INTEGER,
    "fluencyScore" INTEGER,
    "vocabScore" INTEGER,
    "aiFeedback" TEXT,
    "aiPolished" TEXT,
    "aiNativeAlt" TEXT,
    "hintUsed" BOOLEAN NOT NULL DEFAULT false,
    "hintWords" JSONB,
    "timeSpentMs" INTEGER,
    "status" "TranslationTaskStatus" NOT NULL DEFAULT 'PENDING',
    "nextReviewAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "interval" INTEGER NOT NULL DEFAULT 0,
    "easeFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "repetitions" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TranslationTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TranslationTask_userId_nextReviewAt_idx" ON "TranslationTask"("userId", "nextReviewAt");

-- CreateIndex
CREATE INDEX "TranslationTask_userId_status_idx" ON "TranslationTask"("userId", "status");

-- AddForeignKey
ALTER TABLE "TranslationTask" ADD CONSTRAINT "TranslationTask_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
