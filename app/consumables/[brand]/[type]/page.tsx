import { ConsumablesProductsPage } from "@/components/ConsumablesCategoryFlow";
import { notFound } from "next/navigation";

export default async function ConsumablesBrandTypeRoute({
  params,
}: {
  params: Promise<{ brand: string; type: string }>;
}) {
  const { brand, type } = await params;
  const allowedBrands = ["canon", "ricoh"];
  if (!allowedBrands.includes(brand)) {
    notFound();
  }
  return <ConsumablesProductsPage brandSlug={brand} typeSlug={type} />;
}
