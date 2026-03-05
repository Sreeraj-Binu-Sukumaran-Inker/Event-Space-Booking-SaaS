-- Add missing column used by Prisma schema and plan service responses
ALTER TABLE "Plan"
ADD COLUMN "availableLayouts" TEXT[] NOT NULL DEFAULT ARRAY['BASIC']::TEXT[];

-- Backfill historical null features before enforcing non-null array semantics
UPDATE "Plan"
SET "features" = ARRAY[]::TEXT[]
WHERE "features" IS NULL;

ALTER TABLE "Plan"
ALTER COLUMN "features" SET NOT NULL;
