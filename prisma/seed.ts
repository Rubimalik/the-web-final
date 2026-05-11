import { query, pool } from "@/lib/db";
import { PRODUCT_CATEGORY_SEEDS } from "@/lib/product-taxonomy";

async function main() {
  await query(
    `
      UPDATE "Category"
      SET
        "name" = 'Consumables',
        "slug" = 'consumables',
        "updatedAt" = NOW()
      WHERE "slug" = 'parts-and-toner'
        AND NOT EXISTS (
          SELECT 1 FROM "Category" existing WHERE existing."slug" = 'consumables'
        )
    `,
  );

  for (const category of PRODUCT_CATEGORY_SEEDS) {
    await query(
      `
        INSERT INTO "Category" ("name", "slug", "updatedAt")
        VALUES ($1, $2, NOW())
        ON CONFLICT ("slug")
        DO UPDATE SET
          "name" = EXCLUDED."name",
          "updatedAt" = NOW()
      `,
      [category.name, category.slug],
    );
  }

  console.log("Seeded product categories");
}

main()
  .catch(console.error)
  .finally(() => pool.end());
