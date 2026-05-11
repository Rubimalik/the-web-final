INSERT INTO "Category" ("name", "slug", "updatedAt")
VALUES
  ('Canon Waste Toner Bottles', 'canon-waste-toner-bottles', NOW()),
  ('Canon Staples', 'canon-staples', NOW()),
  ('Canon Toner', 'canon-toner', NOW()),
  ('Canon Drum Units', 'canon-drum-units', NOW()),
  ('Canon Parts', 'canon-parts', NOW()),
  ('Ricoh Waste Toner Bottles', 'ricoh-waste-toner-bottles', NOW()),
  ('Ricoh Staples', 'ricoh-staples', NOW()),
  ('Ricoh Toner', 'ricoh-toner', NOW()),
  ('Ricoh Drum Units', 'ricoh-drum-units', NOW()),
  ('Ricoh Parts', 'ricoh-parts', NOW()),
  ('Konica Waste Toner Bottles', 'konica-waste-toner-bottles', NOW()),
  ('Konica Staples', 'konica-staples', NOW()),
  ('Konica Toner', 'konica-toner', NOW()),
  ('Konica Drum Units', 'konica-drum-units', NOW()),
  ('Konica Parts', 'konica-parts', NOW())
ON CONFLICT ("slug")
DO UPDATE SET
  "name" = EXCLUDED."name",
  "updatedAt" = NOW();
