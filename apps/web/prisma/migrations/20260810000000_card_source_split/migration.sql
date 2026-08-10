-- Step 1: Add new columns
ALTER TABLE "Card" ADD COLUMN "sourceUrl"        VARCHAR(2048);
ALTER TABLE "Card" ADD COLUMN "sourceWord"       TEXT;
ALTER TABLE "Card" ADD COLUMN "sourceAnchor"     JSONB;
ALTER TABLE "Card" ADD COLUMN "sourceTitle"      VARCHAR(512);
ALTER TABLE "Card" ADD COLUMN "capturedAt"       TIMESTAMP(3);
ALTER TABLE "Card" ADD COLUMN "sourceProvenance" VARCHAR(64);

-- Step 2: Migrate URL data from old `source` column
UPDATE "Card"
SET "sourceUrl"  = "source",
    "capturedAt" = "createdAt"
WHERE "source" ~ '^https?://';

-- Step 3: Migrate provenance tags from old `source` column
UPDATE "Card"
SET "sourceProvenance" = "source"
WHERE "source" !~ '^https?://';

-- Step 4: Drop old column
ALTER TABLE "Card" DROP COLUMN "source";
