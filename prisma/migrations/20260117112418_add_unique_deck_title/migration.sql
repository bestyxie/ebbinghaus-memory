/*
  Warnings:

  - A unique constraint covering the columns `[userId,title]` on the table `Deck` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Card" ALTER COLUMN "deckId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Deck_userId_title_key" ON "Deck"("userId", "title");
