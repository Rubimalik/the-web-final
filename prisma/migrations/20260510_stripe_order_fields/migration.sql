ALTER TABLE "Order"
  ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT,
  ADD COLUMN IF NOT EXISTS "stripeSessionId" TEXT,
  ADD COLUMN IF NOT EXISTS "stripePaymentIntentId" TEXT;

UPDATE "Order"
SET "stripeSessionId" = "paymentSessionId"
WHERE "paymentProvider" = 'stripe'
  AND "stripeSessionId" IS NULL
  AND "paymentSessionId" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "Order_stripeSessionId_idx" ON "Order"("stripeSessionId");
CREATE INDEX IF NOT EXISTS "Order_stripePaymentIntentId_idx" ON "Order"("stripePaymentIntentId");
