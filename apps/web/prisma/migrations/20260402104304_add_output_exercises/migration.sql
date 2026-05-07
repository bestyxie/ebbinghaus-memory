-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "outputRepetitions" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "OutputExercise" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "targetWord" TEXT NOT NULL,
    "englishSentence" TEXT NOT NULL,
    "chineseSentence" TEXT NOT NULL,
    "fillBlankTemplate" TEXT NOT NULL,
    "wordList" JSONB NOT NULL,
    "standardAnswer" TEXT NOT NULL,
    "contextPrompt" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutputExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutputPracticeLog" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "userAnswer" TEXT NOT NULL,
    "aiVocabScore" INTEGER,
    "aiGrammarScore" INTEGER,
    "aiNativeScore" INTEGER,
    "aiFeedback" TEXT,
    "aiSuggestedAnswer" TEXT,
    "practicedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OutputPracticeLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OutputExercise_cardId_key" ON "OutputExercise"("cardId");

-- CreateIndex
CREATE INDEX "OutputExercise_cardId_idx" ON "OutputExercise"("cardId");

-- CreateIndex
CREATE INDEX "OutputPracticeLog_cardId_idx" ON "OutputPracticeLog"("cardId");

-- CreateIndex
CREATE INDEX "OutputPracticeLog_userId_idx" ON "OutputPracticeLog"("userId");

-- CreateIndex
CREATE INDEX "OutputPracticeLog_exerciseId_idx" ON "OutputPracticeLog"("exerciseId");

-- AddForeignKey
ALTER TABLE "OutputExercise" ADD CONSTRAINT "OutputExercise_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutputPracticeLog" ADD CONSTRAINT "OutputPracticeLog_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutputPracticeLog" ADD CONSTRAINT "OutputPracticeLog_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "OutputExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutputPracticeLog" ADD CONSTRAINT "OutputPracticeLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
