INSERT INTO "Category" ("name", "slug", "updatedAt")
VALUES
  ('Toner', 'toner', NOW()),
  ('Toner Cartridges', 'toner-cartridges', NOW()),
  ('Waste Toner Bottles', 'waste-toner-bottles', NOW()),
  ('Parts', 'parts', NOW()),
  ('Copier Parts', 'copier-parts', NOW()),
  ('Drum Units', 'drum-units', NOW()),
  ('Staples', 'staples', NOW())
ON CONFLICT ("slug")
DO UPDATE SET
  "name" = EXCLUDED."name",
  "updatedAt" = NOW();
