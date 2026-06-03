export const PARTS_AND_TONERS_SLUG = "parts-and-toners";

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

export interface ProductTaxonomyCategory {
  name?: string | null;
  slug?: string | null;
}

export interface ProductTaxonomyProduct {
  id?: number;
  name: string;
  slug?: string | null;
  tags?: string | null;
  category?: ProductTaxonomyCategory | null;
}

export interface ProductBreadcrumb {
  label: string;
  href: string;
}

export function slugifyProductName(value: string) {
  const slug = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "product";
}

export function getProductSlug(product: { id?: number; name: string; slug?: string | null }) {
  if (product.slug) return product.slug;

  const baseSlug = slugifyProductName(product.name);
  return typeof product.id === "number" ? `${baseSlug}-${product.id}` : baseSlug;
}

export function isKonicaMinoltaProduct(product: ProductTaxonomyProduct) {
  const text = normalizeSearchText(product);
  return /\b(konica|minolta|bizhub)\b/.test(text);
}

export function getProductHref(product: ProductTaxonomyProduct) {
  const categoryPath = getNormalizedProductCategoryPath(product);
  const productSlug = getProductSlug(product);

  if (categoryPath.mainSlug === PARTS_AND_TONERS_SLUG && categoryPath.brandSlug && categoryPath.typeSlug) {
    return `/products/${PARTS_AND_TONERS_SLUG}/${categoryPath.brandSlug}/${categoryPath.typeSlug}/${productSlug}`;
  }

  return `/products/${productSlug}`;
}

export function getMainCategoryBySlug(slug?: string | null) {
  if (slug === "parts-and-toner" || slug === PARTS_AND_TONERS_SLUG) {
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
    "parts-and-toner",
    PARTS_AND_TONERS_SLUG,
    ...LEGACY_CONSUMABLE_TYPE_CATEGORIES.map((category) => category.slug),
    ...leafSlugs,
  ];
}

export function getProductCategoryPath(slug?: string | null) {
  if (!slug) return { mainSlug: "", brandSlug: "", typeSlug: "" };

  if (slug === "photocopiers") {
    return { mainSlug: "photocopiers", brandSlug: "", typeSlug: "" };
  }

  if (slug === "consumables" || slug === "parts-and-toner" || slug === PARTS_AND_TONERS_SLUG) {
    return { mainSlug: PARTS_AND_TONERS_SLUG, brandSlug: "", typeSlug: "" };
  }

  const leafCategory = getPartsLeafCategoryBySlug(slug);
  if (leafCategory) {
    return {
      mainSlug: PARTS_AND_TONERS_SLUG,
      brandSlug: leafCategory.brandSlug,
      typeSlug: leafCategory.typeSlug,
    };
  }

  const type = getPartsTypeBySlug(slug);
  if (!type) return { mainSlug: "", brandSlug: "", typeSlug: "" };

  return {
    mainSlug: PARTS_AND_TONERS_SLUG,
    brandSlug: "",
    typeSlug: type.slug,
  };
}

function normalizeSearchText(product: ProductTaxonomyProduct) {
  return [
    product.name,
    product.tags,
    product.category?.name,
    product.category?.slug,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function inferPartsBrandSlug(product: ProductTaxonomyProduct) {
  const categorySlug = product.category?.slug;
  const leafCategory = getPartsLeafCategoryBySlug(categorySlug);
  if (leafCategory) return leafCategory.brandSlug;

  if (categorySlug && getPartsBrandBySlug(categorySlug)) return categorySlug;

  const text = normalizeSearchText(product);
  if (/\bcanon\b/.test(text)) return "canon";
  if (/\bricoh\b/.test(text)) return "ricoh";

  return "";
}

function inferPartsTypeSlug(product: ProductTaxonomyProduct) {
  const categorySlug = product.category?.slug;
  const leafCategory = getPartsLeafCategoryBySlug(categorySlug);
  if (leafCategory) return leafCategory.typeSlug;

  const categoryType = getPartsTypeBySlug(categorySlug);
  if (categoryType) return categoryType.slug;

  const text = normalizeSearchText(product);
  if (/\bwaste\s+toner\b|\bwaste\s+bottle\b/.test(text)) return "waste-toner-bottles";
  if (/\bstaple|staples\b/.test(text)) return "staples";
  if (/\bdrum\b|\bpcu\b|\bpcdu\b|\bphotoconductor\b|\bdeveloper\s+unit\b/.test(text)) return "drum-units";
  if (/\btoner\b|\bcartridge\b/.test(text)) return "toner";
  if (/\bfuser\b|\bfusing\b|\broller\b|\bbelt\b|\bpart\b|\bparts\b|\bunit\b/.test(text)) return "parts";

  return "";
}

export function getNormalizedProductCategoryPath(product: ProductTaxonomyProduct) {
  const basePath = getProductCategoryPath(product.category?.slug);

  if (basePath.mainSlug === "photocopiers") {
    return basePath;
  }

  const brandSlug = basePath.brandSlug || inferPartsBrandSlug(product);
  const typeSlug = basePath.typeSlug || inferPartsTypeSlug(product);

  if (brandSlug || typeSlug || basePath.mainSlug === PARTS_AND_TONERS_SLUG) {
    return {
      mainSlug: PARTS_AND_TONERS_SLUG,
      brandSlug,
      typeSlug,
    };
  }

  return basePath;
}

export function getProductCategoryBreadcrumbs(product: ProductTaxonomyProduct): ProductBreadcrumb[] {
  const productHref = getProductHref(product);
  const categoryPath = getNormalizedProductCategoryPath(product);
  const breadcrumbs: ProductBreadcrumb[] = [
    { label: "Products", href: "/products" },
  ];

  if (categoryPath.mainSlug === PARTS_AND_TONERS_SLUG) {
    breadcrumbs.push({
      label: "Parts and Toners",
      href: `/products/${PARTS_AND_TONERS_SLUG}`,
    });

    const brand = getPartsBrandBySlug(categoryPath.brandSlug);
    if (brand) {
      breadcrumbs.push({
        label: brand.label,
        href: `/products/${PARTS_AND_TONERS_SLUG}/${brand.slug}`,
      });
    }

    const type = getPartsTypeBySlug(categoryPath.typeSlug);
    if (brand && type) {
      breadcrumbs.push({
        label: type.label,
        href: `/products/${PARTS_AND_TONERS_SLUG}/${brand.slug}/${type.slug}`,
      });
    }
  } else if (categoryPath.mainSlug === "photocopiers") {
    breadcrumbs.push({
      label: "Printers",
      href: "/products?category=photocopiers",
    });
  } else if (product.category?.name) {
    breadcrumbs.push({
      label: product.category.name,
      href: product.category.slug ? `/products?category=${product.category.slug}` : "/products",
    });
  }

  breadcrumbs.push({
    label: product.name,
    href: productHref,
  });

  return breadcrumbs;
}

export function getConsumableProductHref(product: ProductTaxonomyProduct) {
  return getProductHref(product);
}

export const CONSUMABLE_CATEGORY_SLUGS = getConsumablesSlugs();
