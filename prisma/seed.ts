import { prisma } from "@/lib/db";

async function main() {
  await prisma.category.upsert({
    where: { slug: "photocopiers" },
    update: {},
    create: { name: "Photocopiers", slug: "photocopiers" },
  });
  await prisma.category.upsert({
    where: { slug: "consumables" },
    update: {},
    create: { name: "Consumables", slug: "consumables" },
  });
  console.log("✓ Seeded: Photocopiers + Consumables");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
