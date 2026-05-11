import "dotenv/config";
import { seedDefaultCategories } from "@/lib/catalog-store";

async function main() {
  await seedDefaultCategories();
  console.log("Seeded product categories");
}

main().catch(console.error);
