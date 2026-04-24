import { query, pool } from "@/lib/db";

async function main() {
  await query(
    `
      INSERT INTO "Category" ("name", "slug", "updatedAt")
      VALUES ($1, $2, NOW())
      ON CONFLICT ("slug")
      DO UPDATE SET
        "name" = EXCLUDED."name",
        "updatedAt" = NOW()
    `,
    ["Photocopiers", "photocopiers"],
  );

  await query(
    `
      INSERT INTO "Category" ("name", "slug", "updatedAt")
      VALUES ($1, $2, NOW())
      ON CONFLICT ("slug")
      DO UPDATE SET
        "name" = EXCLUDED."name",
        "updatedAt" = NOW()
    `,
    ["Consumables", "consumables"],
  );

  console.log("✓ Seeded: Photocopiers + Consumables");
}

main()
  .catch(console.error)
  .finally(() => pool.end());
