"use client";

import React from "react";
import { DealerConsumablesBrandPage } from "@/components/dealer/DealerConsumablesCategoryFlow";

export default function DealerConsumableBrandPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand } = React.use(params);
  return <DealerConsumablesBrandPage brandSlug={brand} />;
}
