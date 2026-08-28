-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "transcribeProgress" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "transcribeStage" TEXT;

-- AlterTable
ALTER TABLE "CourseProgress" ALTER COLUMN "completedSentenceIds" SET DEFAULT ARRAY[]::INTEGER[];

-- AlterTable
ALTER TABLE "SpeakingProgress" ALTER COLUMN "completedSentenceIds" SET DEFAULT ARRAY[]::INTEGER[];
