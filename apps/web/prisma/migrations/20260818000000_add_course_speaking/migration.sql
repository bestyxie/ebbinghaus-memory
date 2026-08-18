-- CreateEnum
CREATE TYPE "SpeakingDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateTable
CREATE TABLE "SpeakingProgress" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "difficulty" "SpeakingDifficulty" NOT NULL,
    "sentenceIndex" INTEGER NOT NULL DEFAULT 0,
    "bestScores" JSONB,
    "completedSentenceIds" INTEGER[],
    "status" "CourseProgressStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpeakingProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SpeakingProgress_userId_courseId_difficulty_key" ON "SpeakingProgress"("userId", "courseId", "difficulty");

-- AddForeignKey
ALTER TABLE "SpeakingProgress" ADD CONSTRAINT "SpeakingProgress_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpeakingProgress" ADD CONSTRAINT "SpeakingProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;