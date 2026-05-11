UPDATE "Category"
SET
  "name" = 'Consumables',
  "slug" = 'consumables',
  "updatedAt" = NOW()
WHERE "slug" = 'parts-and-toner'
  AND NOT EXISTS (
    SELECT 1 FROM "Category" existing WHERE existing."slug" = 'consumables'
  );
