-- Add dealer-aware product fields.
-- Visibility values:
-- public = public website only
-- dealer = dealer website only
-- both = public and dealer websites

ALTER TABLE "Product"
  ADD COLUMN IF NOT EXISTS "dealerPrice" DOUBLE PRECISION;

ALTER TABLE "Product"
  ADD COLUMN IF NOT EXISTS "dealerNotes" TEXT;

ALTER TABLE "ProductImage"
  ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "Product"
  ADD COLUMN IF NOT EXISTS "visibility" TEXT;

ALTER TABLE "Product"
  ALTER COLUMN "visibility" DROP DEFAULT;

ALTER TABLE "Product"
  ALTER COLUMN "visibility" TYPE TEXT
  USING CASE
    WHEN "visibility"::text = 'public_and_dealer' THEN 'both'
    WHEN "visibility"::text IN ('public', 'dealer', 'both') THEN "visibility"::text
    ELSE 'public'
  END;

UPDATE "Product"
SET "visibility" = 'public'
WHERE "visibility" IS NULL OR "visibility" NOT IN ('public', 'dealer', 'both');

ALTER TABLE "Product"
  ALTER COLUMN "visibility" SET DEFAULT 'public',
  ALTER COLUMN "visibility" SET NOT NULL;

ALTER TABLE "Product"
  DROP CONSTRAINT IF EXISTS "Product_visibility_check";

ALTER TABLE "Product"
  ADD CONSTRAINT "Product_visibility_check"
  CHECK ("visibility" IN ('public', 'dealer', 'both'));

DROP TYPE IF EXISTS "ProductVisibility";
