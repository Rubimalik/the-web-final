"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, PackageSearch, Search, SlidersHorizontal } from "lucide-react";
import { getProductImagePlaceholderUrl } from "@/lib/product-image-placeholder";
import { safeReadJsonResponse } from "@/lib/safe-json";
import { useDealerCart } from "@/components/dealer/DealerCartProvider";
import {
  PARTS_AND_TONER_BRANDS,
  PARTS_AND_TONER_TYPES,
  PRODUCT_MAIN_CATEGORIES,
  getConsumableGroupBySlug,
  getMainCategoryBySlug,
  getPartsBrandBySlug,
  getPartsTypeBySlug,
} from "@/lib/product-taxonomy";

interface ProductImage {
  id: number;
  url: string;
  isPrimary: boolean;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface DealerProduct {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  dealerPrice: number | null;
  dealerNotes: string | null;
  status: string;
  visibility: "public" | "dealer" | "both";
  images: ProductImage[];
  category: Category | null;
}

function formatPrice(value: number | null | undefined) {
  return typeof value === "number" ? `\u00a3${value.toFixed(2)}` : "POA";
}

function buildDealerProductsHref(category: string, type?: string, brand?: string) {
  const params = new URLSearchParams({ category });
  if (brand) params.set("brand", brand);
  if (type) params.set("type", type);
  return `/dealer/products?${params.toString()}`;
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-black/10 animate-pulse">
      <div className="aspect-[4/3] bg-black/5" />
      <div className="p-3 space-y-2">
        <div className="h-3.5 bg-black/10 rounded w-3/4" />
        <div className="h-3 bg-black/10 rounded w-1/2" />
        <div className="h-8 bg-black/10 rounded-md w-full" />
      </div>
    </div>
  );
}

function ConsumablesFilters({
  brand,
  type,
  onBrandChange,
  onTypeChange,
  onClear,
}: {
  brand: string;
  type: string;
  onBrandChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-sm transition-all duration-200 animate-[fadeIn_320ms_ease_both]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <div className="flex items-center gap-2 pb-1 text-sm font-bold text-white lg:w-28">
          <SlidersHorizontal className="h-4 w-4 text-[var(--brand-cyan)]" />
          Filters
        </div>
        <label className="flex-1 space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-white/45">Brand</span>
          <span className="relative block">
            <select
              value={brand}
              onChange={(event) => onBrandChange(event.target.value)}
              className="w-full appearance-none rounded-lg border border-white/15 bg-black/40 px-3 py-3 pr-9 text-sm font-semibold text-white transition hover:border-[var(--brand-cyan)] focus:border-[var(--brand-cyan)] focus:outline-none"
            >
              <option value="">All Brands</option>
              {PARTS_AND_TONER_BRANDS.map((option) => (
                <option key={option.slug} value={option.slug}>{option.label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
          </span>
        </label>
        <label className="flex-1 space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-white/45">Consumable Subcategory</span>
          <span className="relative block">
            <select
              value={type}
              onChange={(event) => onTypeChange(event.target.value)}
              className="w-full appearance-none rounded-lg border border-white/15 bg-black/40 px-3 py-3 pr-9 text-sm font-semibold text-white transition hover:border-[var(--brand-cyan)] focus:border-[var(--brand-cyan)] focus:outline-none"
            >
              <option value="">All Product Types</option>
              {PARTS_AND_TONER_TYPES.map((option) => (
                <option key={option.slug} value={option.slug}>{option.label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
          </span>
        </label>
        <button
          type="button"
          onClick={onClear}
          disabled={!brand && !type}
          className="rounded-lg border border-white/15 px-4 py-3 text-sm font-semibold text-white/60 transition hover:border-[var(--brand-cyan)] hover:text-[var(--brand-cyan)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}

function DealerProductCard({ product }: { product: DealerProduct }) {
  const router = useRouter();
  const { addToDealerCart } = useDealerCart();
  const [quantity, setQuantity] = useState(1);
  const primaryImg = product.images?.find((image) => image.isPrimary) ?? product.images?.[0];
  const imageUrl = primaryImg?.url ?? getProductImagePlaceholderUrl();
  const unitPrice = product.dealerPrice ?? product.price;
  const hasRetailComparison =
    typeof product.price === "number" &&
    typeof product.dealerPrice === "number" &&
    product.dealerPrice < product.price;

  function handleQuantityChange(value: string) {
    const parsed = Number.parseInt(value, 10);
    setQuantity(Number.isFinite(parsed) ? Math.max(1, parsed) : 1);
  }

  function handleAddToCart() {
    addToDealerCart(
      {
        id: product.id,
        name: product.name,
        retailPrice: product.price,
        dealerPrice: product.dealerPrice,
        imageUrl,
        categoryName: product.category?.name ?? null,
        minQuantity: 1,
      },
      quantity,
    );
    setQuantity(1);
  }

  function handleBuyNow() {
    handleAddToCart();
    router.push("/dealer/cart");
  }

  return (
    <article className="group h-full rounded-2xl overflow-hidden bg-white border border-black/10 hover:border-[var(--brand-cyan)]/45 shadow-sm hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col">
      <Link href={`/dealer/products/${product.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl bg-cyan-50/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            decoding="async"
          />
        </div>
      </Link>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <Link href={`/dealer/products/${product.id}`} className="hover:text-[var(--brand-cyan)] transition-colors">
            <p className="text-base text-black font-bold line-clamp-2 leading-snug min-h-[44px]">
              {product.name}
            </p>
          </Link>
        </div>

        <div>
          <p className="text-lg text-black/80 font-bold">{formatPrice(unitPrice)}</p>
          {hasRetailComparison ? (
            <p className="text-xs text-black/45">
              Retail <span className="line-through">{formatPrice(product.price)}</span>
            </p>
          ) : (
            <p className="text-xs text-black/45">Account pricing</p>
          )}
        </div>

        {product.dealerNotes ? (
          <p className="rounded-lg border border-black/10 bg-cyan-50/35 px-3 py-2 text-xs leading-relaxed text-black/65 line-clamp-3">
            {product.dealerNotes}
          </p>
        ) : null}

        <div className="mt-auto flex flex-col gap-2.5 pt-1">
          <div className="flex items-center gap-2">
            <label className="text-xs uppercase tracking-wide text-black/50" htmlFor={`dealer-qty-${product.id}`}>
              Qty
            </label>
            <input
              id={`dealer-qty-${product.id}`}
              type="number"
              min={1}
              value={quantity}
              onChange={(event) => handleQuantityChange(event.target.value)}
              className="h-10 w-20 rounded-lg border border-black/20 bg-white px-3 text-sm text-black focus:border-[var(--brand-cyan)] focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full inline-flex items-center justify-center gap-2 brand-button rounded-lg py-2.5 px-3 text-sm font-semibold"
          >
            Add to Cart
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-black/25 bg-white py-2.5 px-3 text-sm font-semibold text-black transition hover:border-[var(--brand-cyan)] hover:text-[var(--brand-cyan)]"
          >
            Buy Now
          </button>
        </div>
      </div>
    </article>
  );
}

export default function DealerWholesaleProducts({
  title = "Products",
  subtitle = "Shop available stock, compare prices, and build an order.",
  limit = 12,
}: {
  title?: string;
  subtitle?: string;
  limit?: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get("category");
  const urlBrand = searchParams.get("brand");
  const urlType = searchParams.get("type");

  const activeMain = getMainCategoryBySlug(urlCategory) ?? PRODUCT_MAIN_CATEGORIES[0];
  const activeBrand = getPartsBrandBySlug(urlBrand);
  const activeGroup = getConsumableGroupBySlug(urlType);
  const activeType = activeGroup ? null : getPartsTypeBySlug(urlType);
  const activeConsumableLabel = activeGroup?.label ?? activeType?.label;
  const consumableFilter = activeMain.slug === "consumables"
    ? activeGroup
      ? { key: "consumableGroup", value: activeGroup.slug }
      : activeType
        ? { key: "consumableType", value: activeType.slug }
        : { key: "consumableGroup", value: "all" }
    : null;
  const consumableFilterKey = consumableFilter?.key;
  const consumableFilterValue = consumableFilter?.value;
  const consumableBrandValue = activeBrand?.slug;
  const productSlug = activeMain.slug === "photocopiers" ? activeMain.slug : null;

  const [products, setProducts] = useState<DealerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (urlCategory === "parts-and-toner") {
      router.replace(buildDealerProductsHref("consumables"), { scroll: false });
    }
  }, [router, urlCategory]);

  useEffect(() => {
    setPage(1);
    setSearch("");
    setSearchInput("");
  }, [activeBrand?.slug, activeMain.slug, activeGroup?.slug, activeType?.slug]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (productSlug) params.set("slug", productSlug);
      if (consumableBrandValue) params.set("consumableBrand", consumableBrandValue);
      if (consumableFilterKey && consumableFilterValue) {
        params.set(consumableFilterKey, consumableFilterValue);
      }
      if (search) params.set("search", search);

      const response = await fetch(`/api/dealer/product?${params}`, {
        cache: "no-store",
      });
      const payload = await safeReadJsonResponse<{
        error?: string;
        data?: DealerProduct[];
        pagination?: { totalPages?: number };
      }>(response, "DealerWholesaleProducts fetch");

      if (!response.ok) {
        throw new Error(payload?.error || "Failed to load products");
      }

      setProducts(payload?.data ?? []);
      setTotalPages(payload?.pagination?.totalPages ?? 1);
    } catch (err) {
      setProducts([]);
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [consumableBrandValue, consumableFilterKey, consumableFilterValue, limit, page, productSlug, search]);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  function switchCategory(slug: string) {
    router.push(buildDealerProductsHref(slug), { scroll: false });
  }

  function updateConsumablesFilters(nextType: string, nextBrand = activeBrand?.slug ?? "") {
    router.push(buildDealerProductsHref("consumables", nextType || undefined, nextBrand || undefined), { scroll: false });
  }

  const pageTitle = activeMain.label;
  const pageSubtitle = activeMain.slug === "consumables"
    ? activeConsumableLabel
      ? `Showing ${activeConsumableLabel.toLowerCase()} consumables.`
      : "Browse consumables and refine by subcategory."
    : title === "Wholesale Products"
      ? "Browse available printers with account pricing."
      : subtitle;

  return (
    <div>
      <div className="border-b border-black/10 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-wrap items-center justify-center gap-3">
          {PRODUCT_MAIN_CATEGORIES.map((category) => (
            <button
              key={category.slug}
              type="button"
              onClick={() => switchCategory(category.slug)}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 ${
                activeMain.slug === category.slug
                  ? "brand-button"
                  : "bg-white text-black border border-black/20 hover:border-[var(--brand-cyan)] hover:text-[var(--brand-cyan)]"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10">
        <nav className="mb-5 flex flex-wrap items-center gap-2 text-sm text-black/55">
          <Link href="/dealer/products" className="hover:text-[var(--brand-cyan)]">Products</Link>
          <span>/</span>
          <Link href={buildDealerProductsHref(activeMain.slug)} className="hover:text-[var(--brand-cyan)]">
            {activeMain.label}
          </Link>
          {activeConsumableLabel ? (
            <>
              <span>/</span>
              {activeBrand ? (
                <>
                  <Link href={buildDealerProductsHref("consumables", undefined, activeBrand.slug)} className="hover:text-[var(--brand-cyan)]">
                    {activeBrand.label}
                  </Link>
                  <span>/</span>
                </>
              ) : null}
              <span className="text-black/80">{activeConsumableLabel}</span>
            </>
          ) : activeBrand ? (
            <>
              <span>/</span>
              <span className="text-black/80">{activeBrand.label}</span>
            </>
          ) : null}
        </nav>

        <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold brand-title">{pageTitle}</h1>
            <p className="text-black/60 mt-1 text-sm sm:text-base">{pageSubtitle}</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <div className="relative w-full sm:w-[360px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40 pointer-events-none" />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-4 py-3 text-sm bg-white border border-black/15 text-black placeholder:text-black/45 rounded-lg focus:outline-none focus:border-[var(--brand-cyan)] transition-all"
              />
            </div>
          </div>
        </div>

        {activeMain.slug === "consumables" ? (
          <div className="mb-8">
            <ConsumablesFilters
              type={activeType?.slug ?? activeGroup?.slug ?? ""}
              brand={activeBrand?.slug ?? ""}
              onBrandChange={(value) => updateConsumablesFilters(activeType?.slug ?? activeGroup?.slug ?? "", value)}
              onTypeChange={(value) => updateConsumablesFilters(value)}
              onClear={() => updateConsumablesFilters("", "")}
            />
          </div>
        ) : null}

        <div className="h-px bg-black/10 mb-8" />

        {error ? <p className="text-center text-red-500 text-sm py-8">{error}</p> : null}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : null}

        {!loading && !error && products.length === 0 ? (
          <div className="mx-auto max-w-md rounded-2xl brand-surface p-8 text-center animate-[fadeIn_360ms_ease]">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cyan-50 text-[var(--brand-cyan)]">
              <PackageSearch className="h-5 w-5" />
            </div>
            <p className="font-semibold text-black">No products found</p>
            <p className="mt-2 text-sm leading-relaxed text-black/55">
              {activeGroup || activeType
                ? "No products found for the selected filters."
                : "This category is ready, but no products have been added yet."}
            </p>
          </div>
        ) : null}

        {!loading && !error && products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {products.map((product) => (
                <DealerProductCard key={product.id} product={product} />
              ))}
            </div>

            {totalPages > 1 ? (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  type="button"
                  onClick={() => setPage((current) => current - 1)}
                  disabled={page === 1}
                  className="px-4 py-1.5 text-sm text-black/60 border border-black/20 rounded-lg hover:border-[var(--brand-cyan)] hover:text-[var(--brand-cyan)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>
                <span className="text-sm text-black/50">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((current) => current + 1)}
                  disabled={page === totalPages}
                  className="px-4 py-1.5 text-sm text-black/60 border border-black/20 rounded-lg hover:border-[var(--brand-cyan)] hover:text-[var(--brand-cyan)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
