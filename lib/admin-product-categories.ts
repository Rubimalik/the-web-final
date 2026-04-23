export const ADMIN_PRODUCT_CATEGORIES = [
  { label: "Photocopiers", slug: "photocopiers" },
  { label: "Consumables", slug: "consumables" },
] as const;

export type AdminProductCategorySlug = (typeof ADMIN_PRODUCT_CATEGORIES)[number]["slug"];

export function getAdminProductCategoryBySlug(slug?: string | null) {
  return ADMIN_PRODUCT_CATEGORIES.find((category) => category.slug === slug) ?? null;
}
