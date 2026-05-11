import { PRODUCT_MAIN_CATEGORIES } from "@/lib/product-taxonomy";

export const ADMIN_PRODUCT_CATEGORIES = PRODUCT_MAIN_CATEGORIES.map((category) => ({
  label: category.label,
  slug: category.slug,
}));

export type AdminProductCategorySlug = (typeof ADMIN_PRODUCT_CATEGORIES)[number]["slug"];

export function getAdminProductCategoryBySlug(slug?: string | null) {
  return ADMIN_PRODUCT_CATEGORIES.find((category) => category.slug === slug) ?? null;
}
