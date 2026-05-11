export const PRODUCT_MAIN_CATEGORIES = [
  { label: "Printers", slug: "photocopiers" },
  { label: "Consumables", slug: "consumables" },
] as const;

export const PARTS_AND_TONER_BRANDS = [
  { label: "Canon", slug: "canon" },
  { label: "Ricoh", slug: "ricoh" },
] as const;

export const PARTS_AND_TONER_TYPES = [
  { label: "Waste Toner Bottles", slug: "waste-toner-bottles" },
  { label: "Staples", slug: "staples" },
  { label: "Toner", slug: "toner" },
  { label: "Drum Units", slug: "drum-units" },
  { label: "Parts", slug: "parts" },
] as const;

export const CONSUMABLE_MAIN_GROUPS = [
  { label: "Toner", slug: "toner" },
  { label: "Parts", slug: "parts" },
] as const;

export const PARTS_AND_TONER_LEAF_CATEGORIES = PARTS_AND_TONER_BRANDS.flatMap((brand) =>
  PARTS_AND_TONER_TYPES.map((type) => ({
    name: `${brand.label} ${type.label}`,
    slug: `${brand.slug}-${type.slug}`,
    brandLabel: brand.label,
    brandSlug: brand.slug,
    typeLabel: type.label,
    typeSlug: type.slug,
  })),
);

const LEGACY_CONSUMABLE_TYPE_CATEGORIES = [
  ...PARTS_AND_TONER_TYPES,
  { label: "Toner Cartridges", slug: "toner-cartridges" },
  { label: "Copier Parts", slug: "copier-parts" },
] as const;

export const PRODUCT_CATEGORY_SEEDS = [
  { name: "Printers", slug: "photocopiers" },
  { name: "Consumables", slug: "consumables" },
  ...PARTS_AND_TONER_LEAF_CATEGORIES.map((category) => ({
    name: category.name,
    slug: category.slug,
  })),
  ...LEGACY_CONSUMABLE_TYPE_CATEGORIES.map((category) => ({
    name: category.label,
    slug: category.slug,
  })),
] as const;

export function slugifyProductName(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getMainCategoryBySlug(slug?: string | null) {
  if (slug === "parts-and-toner") {
    return PRODUCT_MAIN_CATEGORIES.find((category) => category.slug === "consumables") ?? null;
  }
  return PRODUCT_MAIN_CATEGORIES.find((category) => category.slug === slug) ?? null;
}

export function getPartsBrandBySlug(slug?: string | null) {
  return PARTS_AND_TONER_BRANDS.find((brand) => brand.slug === slug) ?? null;
}

export function getPartsTypeBySlug(slug?: string | null) {
  if (slug === "toner-cartridges") {
    return PARTS_AND_TONER_TYPES.find((type) => type.slug === "toner") ?? null;
  }
  if (slug === "copier-parts") {
    return PARTS_AND_TONER_TYPES.find((type) => type.slug === "parts") ?? null;
  }
  return PARTS_AND_TONER_TYPES.find((type) => type.slug === slug) ?? null;
}

export function getPartsLeafCategory(brandSlug?: string | null, typeSlug?: string | null) {
  if (!brandSlug || !typeSlug) return null;
  return (
    PARTS_AND_TONER_LEAF_CATEGORIES.find(
      (category) => category.brandSlug === brandSlug && category.typeSlug === typeSlug,
    ) ?? null
  );
}

export function getPartsLeafCategoryBySlug(slug?: string | null) {
  return PARTS_AND_TONER_LEAF_CATEGORIES.find((category) => category.slug === slug) ?? null;
}

export function getConsumableGroupBySlug(slug?: string | null) {
  return CONSUMABLE_MAIN_GROUPS.find((group) => group.slug === slug) ?? null;
}

export function getConsumableTypeSlugsForGroup(groupSlug?: string | null) {
  if (!groupSlug) return PARTS_AND_TONER_TYPES.map((type) => type.slug);
  if (groupSlug === "toner") return ["toner", "waste-toner-bottles"];
  if (groupSlug === "parts") return ["parts", "drum-units", "staples"];
  return [];
}

export function getConsumablesSlugs(brandSlug?: string | null, typeSlug?: string | null) {
  const leafSlugs = PARTS_AND_TONER_LEAF_CATEGORIES.filter((category) => {
    if (brandSlug && category.brandSlug !== brandSlug) return false;
    if (typeSlug && category.typeSlug !== typeSlug) return false;
    return true;
  }).map((category) => category.slug);

  if (brandSlug || typeSlug) return leafSlugs;

  return [
    "consumables",
    ...LEGACY_CONSUMABLE_TYPE_CATEGORIES.map((category) => category.slug),
    ...leafSlugs,
  ];
}

export function getProductCategoryPath(slug?: string | null) {
  if (!slug) return { mainSlug: "", brandSlug: "", typeSlug: "" };

  if (slug === "photocopiers") {
    return { mainSlug: "photocopiers", brandSlug: "", typeSlug: "" };
  }

  if (slug === "consumables" || slug === "parts-and-toner") {
    return { mainSlug: "consumables", brandSlug: "", typeSlug: "" };
  }

  const leafCategory = getPartsLeafCategoryBySlug(slug);
  if (leafCategory) {
    return {
      mainSlug: "consumables",
      brandSlug: leafCategory.brandSlug,
      typeSlug: leafCategory.typeSlug,
    };
  }

  const type = getPartsTypeBySlug(slug);
  if (!type) return { mainSlug: "", brandSlug: "", typeSlug: "" };

  return {
    mainSlug: "consumables",
    brandSlug: "",
    typeSlug: type.slug,
  };
}

export function getConsumableProductHref(product: {
  id: number;
  name: string;
  category?: { slug?: string | null } | null;
}) {
  const path = getProductCategoryPath(product.category?.slug);
  if (path.mainSlug === "consumables" && path.brandSlug && path.typeSlug) {
    return `/consumables/${path.brandSlug}/${path.typeSlug}/${slugifyProductName(product.name)}`;
  }
  return `/products/${product.id}`;
}

export const CONSUMABLE_CATEGORY_SLUGS = getConsumablesSlugs();
