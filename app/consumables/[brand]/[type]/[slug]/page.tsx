"use client";

import { useParams } from "next/navigation";
import { ConsumableSlugResolver } from "@/components/ConsumablesCategoryFlow";
import ProductDetailClient from "@/components/ProductDetailClient";

export default function ConsumableProductSlugRoute() {
  const params = useParams<{ brand: string; type: string; slug: string }>();

  return (
    <ConsumableSlugResolver
      brandSlug={params.brand}
      typeSlug={params.type}
      productSlug={params.slug}
      render={(productId) => (
        <ProductDetailClient
          productId={productId}
          breadcrumbContext={{ brandSlug: params.brand, typeSlug: params.type }}
        />
      )}
    />
  );
}
