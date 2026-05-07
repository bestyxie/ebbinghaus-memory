-- CreateEnum
CREATE TYPE "CardType" AS ENUM ('FLASHCARD', 'ARTICLE');

-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "articleContent" TEXT,
ADD COLUMN     "articleTitle" TEXT,
ADD COLUMN     "cardType" "CardType" NOT NULL DEFAULT 'FLASHCARD',
ADD COLUMN     "lastStudyAt" TIMESTAMP(3),
ADD COLUMN     "readTimeMins" INTEGER,
ADD COLUMN     "recallBlocks" JSONB,
ADD COLUMN     "totalStudyTimeMs" INTEGER DEFAULT 0,
ADD COLUMN     "wordCount" INTEGER;
