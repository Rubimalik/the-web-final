-- Admin panel database support:
-- - Order and OrderItem tables for checkout/order management.
-- - Product/catalogue indexes used by admin filters and storefront visibility.
-- - Defensive constraints for status/visibility fields.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

ALTER TABLE "Product"
  ADD COLUMN IF NOT EXISTS "url" TEXT;

ALTER TABLE "Product"
  DROP CONSTRAINT IF EXISTS "Product_status_check";

ALTER TABLE "Product"
  ADD CONSTRAINT "Product_status_check"
  CHECK ("status" IN ('draft', 'active', 'archived'));

ALTER TABLE "Product"
  DROP CONSTRAINT IF EXISTS "Product_visibility_check";

ALTER TABLE "Product"
  ADD CONSTRAINT "Product_visibility_check"
  CHECK ("visibility" IN ('public', 'dealer', 'both'));

CREATE INDEX IF NOT EXISTS "Product_status_idx" ON "Product"("status");
CREATE INDEX IF NOT EXISTS "Product_visibility_idx" ON "Product"("visibility");
CREATE INDEX IF NOT EXISTS "Product_categoryId_idx" ON "Product"("categoryId");
CREATE INDEX IF NOT EXISTS "Product_createdAt_idx" ON "Product"("createdAt");
CREATE INDEX IF NOT EXISTS "Product_updatedAt_idx" ON "Product"("updatedAt");
CREATE INDEX IF NOT EXISTS "ProductImage_productId_idx" ON "ProductImage"("productId");
CREATE INDEX IF NOT EXISTS "ProductImage_categoryId_idx" ON "ProductImage"("categoryId");
CREATE INDEX IF NOT EXISTS "ProductImage_order_idx" ON "ProductImage"("order");

CREATE TABLE IF NOT EXISTS "Order" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID,
  "customerName" TEXT,
  "customerEmail" TEXT,
  "customerPhone" TEXT,
  "notes" TEXT,
  "adminNotes" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "paymentStatus" TEXT NOT NULL DEFAULT 'unpaid',
  "paymentProvider" TEXT,
  "paymentSessionId" TEXT,
  "amountTotal" DOUBLE PRECISION,
  "currency" TEXT NOT NULL DEFAULT 'gbp',
  "source" TEXT NOT NULL DEFAULT 'checkout',
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Order_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Order_status_check" CHECK ("status" IN ('pending', 'confirmed', 'paid', 'fulfilled', 'cancelled')),
  CONSTRAINT "Order_paymentStatus_check" CHECK ("paymentStatus" IN ('unpaid', 'pending', 'paid', 'failed', 'refunded')),
  CONSTRAINT "Order_amountTotal_check" CHECK ("amountTotal" IS NULL OR "amountTotal" >= 0)
);

CREATE TABLE IF NOT EXISTS "OrderItem" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "orderId" UUID NOT NULL,
  "productId" INTEGER,
  "productName" TEXT NOT NULL,
  "unitPrice" DOUBLE PRECISION,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "lineTotal" DOUBLE PRECISION,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "OrderItem_quantity_check" CHECK ("quantity" > 0),
  CONSTRAINT "OrderItem_unitPrice_check" CHECK ("unitPrice" IS NULL OR "unitPrice" >= 0),
  CONSTRAINT "OrderItem_lineTotal_check" CHECK ("lineTotal" IS NULL OR "lineTotal" >= 0)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'OrderItem_orderId_fkey'
  ) THEN
    ALTER TABLE "OrderItem"
      ADD CONSTRAINT "OrderItem_orderId_fkey"
      FOREIGN KEY ("orderId") REFERENCES "Order"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'OrderItem_productId_fkey'
  ) THEN
    ALTER TABLE "OrderItem"
      ADD CONSTRAINT "OrderItem_productId_fkey"
      FOREIGN KEY ("productId") REFERENCES "Product"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS "Order_status_idx" ON "Order"("status");
CREATE INDEX IF NOT EXISTS "Order_paymentStatus_idx" ON "Order"("paymentStatus");
CREATE INDEX IF NOT EXISTS "Order_userId_idx" ON "Order"("userId");
CREATE INDEX IF NOT EXISTS "Order_customerEmail_idx" ON "Order"("customerEmail");
CREATE INDEX IF NOT EXISTS "Order_paymentSessionId_idx" ON "Order"("paymentSessionId");
CREATE INDEX IF NOT EXISTS "Order_createdAt_idx" ON "Order"("createdAt");
CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX IF NOT EXISTS "OrderItem_productId_idx" ON "OrderItem"("productId");

CREATE OR REPLACE FUNCTION public.set_prisma_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS "set_Order_updatedAt" ON "Order";
CREATE TRIGGER "set_Order_updatedAt"
BEFORE UPDATE ON "Order"
FOR EACH ROW EXECUTE FUNCTION public.set_prisma_updated_at();
