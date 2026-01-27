/*
  Warnings:

  - You are about to drop the column `deckId` on the `Card` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Card" DROP CONSTRAINT "Card_deckId_fkey";

-- AlterTable
ALTER TABLE "Card" DROP COLUMN "deckId";

-- AlterTable
ALTER TABLE "Deck" ADD COLUMN     "color" TEXT DEFAULT '#137fec',
ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "CardDeck" (
    "cardId" TEXT NOT NULL,
    "deckId" TEXT NOT NULL,

    CONSTRAINT "CardDeck_pkey" PRIMARY KEY ("cardId","deckId")
);

-- CreateIndex
CREATE INDEX "CardDeck_cardId_idx" ON "CardDeck"("cardId");

-- CreateIndex
CREATE INDEX "CardDeck_deckId_idx" ON "CardDeck"("deckId");

-- AddForeignKey
ALTER TABLE "CardDeck" ADD CONSTRAINT "CardDeck_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardDeck" ADD CONSTRAINT "CardDeck_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;
