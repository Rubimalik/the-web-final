import "dotenv/config";
import { seedDefaultCategories } from "@/lib/catalog-store";

async function main() {
  await seedDefaultCategories();
  console.log("✓ Seeded: Photocopiers + Consumables");
}

main().catch(console.error);
