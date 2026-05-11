import { ConsumablesBrandPage } from "@/components/ConsumablesCategoryFlow";

export default async function ConsumablesBrandRoute({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand } = await params;
  return <ConsumablesBrandPage brandSlug={brand} />;
}
