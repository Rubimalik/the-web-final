-- Dealer storefront order lookup support.

CREATE INDEX IF NOT EXISTS "Order_source_idx" ON "Order"("source");
CREATE INDEX IF NOT EXISTS "Order_userId_source_createdAt_idx" ON "Order"("userId", "source", "createdAt");
