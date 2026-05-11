ALTER TABLE "Product"
ADD COLUMN IF NOT EXISTS "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "featuredOrder" INTEGER;

CREATE INDEX IF NOT EXISTS "Product_isFeatured_featuredOrder_idx"
ON "Product" ("isFeatured", "featuredOrder");
