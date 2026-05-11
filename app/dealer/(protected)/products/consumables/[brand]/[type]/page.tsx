"use client";

import React from "react";
import { DealerConsumablesProductsPage } from "@/components/dealer/DealerConsumablesCategoryFlow";
import { notFound } from "next/navigation";

export default function DealerConsumableProductsPage({
  params,
}: {
  params: Promise<{ brand: string; type: string }>;
}) {
  const { brand, type } = React.use(params);
  const allowedBrands = ["canon", "ricoh"];
  if (!allowedBrands.includes(brand)) {
    notFound();
  }
  return <DealerConsumablesProductsPage brandSlug={brand} typeSlug={type} />;
}
