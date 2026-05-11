"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PackageSearch, Search, ShoppingCart, Zap } from "lucide-react";
import NavBar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import FeaturedProductsSection from "@/components/FeaturedProductsSection";
import { useCart } from "@/components/CartProvider";
import { getProductImagePlaceholderUrl } from "@/lib/product-image-placeholder";
import { safeReadJsonResponse } from "@/lib/safe-json";
import { CATEGORY_IMAGES } from "@/lib/category-images";
import {
  CONSUMABLE_MAIN_GROUPS,
  CONSUMABLE_CATEGORY_SLUGS,
  PARTS_AND_TONER_TYPES,
  PRODUCT_MAIN_CATEGORIES,
  getMainCategoryBySlug,
  getConsumableGroupBySlug,
  getConsumableTypeSlugsForGroup,
  getPartsTypeBySlug,
} from "@/lib/product-taxonomy";

interface ProductImage { id: number; url: string; isPrimary: boolean; }
interface Category { id: number; name: string; slug: string; }
interface Product {
  id: number; name: string; description: string | null;
  price: number | null; tags: string | null; status: string;
  createdAt: string; images: ProductImage[];
  category: Category | null;
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

function ProductCard({
  product,
  onAddToCart,
  onBuyNow,
}: {
  product: Product;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
}) {
  const primaryImg = product.images?.find((i) => i.isPrimary) ?? product.images?.[0];
  const imageUrl = primaryImg?.url ?? getProductImagePlaceholderUrl();

  return (
    <article className="group h-full rounded-2xl overflow-hidden bg-white border border-black/10 hover:border-[var(--brand-cyan)]/45 shadow-sm hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col">
      <Link href={`/products/${product.id}`} className="block">
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
        <Link href={`/products/${product.id}`} className="hover:text-[var(--brand-cyan)] transition-colors">
          <p className="text-[15px] text-black font-semibold line-clamp-2 leading-snug min-h-[40px]">
            {product.name}
          </p>
        </Link>
        <p className="text-base text-black/75 font-semibold">
          {product.price != null ? `\u00a3${Number(product.price).toFixed(2)}` : "POA"}
        </p>
        <div className="mt-auto flex flex-col gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => onAddToCart(product)}
            className="w-full inline-flex items-center justify-center gap-2 brand-button rounded-lg py-2.5 px-3 text-sm font-semibold"
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </button>
          <button
            type="button"
            onClick={() => onBuyNow(product)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-black/25 bg-white py-2.5 px-3 text-sm font-semibold text-black transition hover:border-[var(--brand-cyan)] hover:text-[var(--brand-cyan)]"
          >
            <Zap className="h-4 w-4" />
            Buy Now
          </button>
        </div>
      </div>
    </article>
  );
}

function getPrimaryImage(product?: Product) {
  return product?.images?.find((image) => image.isPrimary) ?? product?.images?.[0];
}

function buildProductsHref(category: string, type?: string) {
  const params = new URLSearchParams({ category });
  if (type) params.set("type", type);
  return `/products?${params.toString()}`;
}

function CategoryCard({
  title,
  href,
  imageUrl,
}: {
  title: string;
  href: string;
  imageUrl?: string;
}) {
  return (
    <Link href={href} className="group block text-center">
      <div className="mx-auto overflow-hidden rounded-sm bg-white flex items-center justify-center p-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl ?? "/logo.png"}
          alt={title}
          className="object-contain transition-transform duration-300 group-hover:scale-[1.03]"
          loading="lazy"
          decoding="async"
          onError={(event) => {
            event.currentTarget.src = "/logo.png";
          }}
        />
      </div>
      <p className="mt-4 text-2xl font-extrabold text-black transition-colors group-hover:text-[var(--brand-cyan)] leading-tight">
        {title}
      </p>
    </Link>
  );
}

function ConsumablesHero() {
  return (
    <section className="bg-slate-800 bg-[radial-gradient(circle_at_80%_30%,rgba(102,217,255,0.18),transparent_28%),linear-gradient(135deg,#324250,#18222c)]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <h1 className="text-3xl font-extrabold uppercase tracking-tight text-white sm:text-4xl">
          Consumables
        </h1>
        <p className="mt-4 inline-block bg-[var(--brand-cyan)] px-4 py-2 text-sm font-bold leading-snug text-white">
          The UK&apos;s one stop shop for Canon photocopier consumables
        </p>
      </div>
    </section>
  );
}

function ProductsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get("category");
  const urlType = searchParams.get("type");
  const showMainShop = !urlCategory;

  const activeMain = getMainCategoryBySlug(urlCategory) ?? PRODUCT_MAIN_CATEGORIES[0];
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
  const productSlug = activeMain.slug === "photocopiers" ? activeMain.slug : null;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categoryPreviewProducts, setCategoryPreviewProducts] = useState<Record<string, Product>>({});
  const { addToCart } = useCart();

  useEffect(() => {
    if (urlCategory === "parts-and-toner") {
      router.replace("/consumables", { scroll: false });
    }
    if (urlCategory === "consumables") {
      router.replace("/consumables", { scroll: false });
    }
  }, [router, urlCategory]);

  useEffect(() => {
    setPage(1);
    setSearchInput("");
    setSearch("");
  }, [activeMain.slug, activeGroup?.slug, activeType?.slug]);

  const fetchProducts = useCallback(async () => {
    if (showMainShop || activeMain.slug === "consumables") {
      setProducts([]);
      setTotalPages(1);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        status: "active",
        page: String(page),
        limit: "12",
      });
      if (productSlug) params.set("slug", productSlug);
      if (consumableFilterKey && consumableFilterValue) {
        params.set(consumableFilterKey, consumableFilterValue);
      }
      if (search) params.set("search", search);

      const res = await fetch(`/api/product?${params}`);
      const data = await safeReadJsonResponse<{
        error?: string;
        data?: Product[];
        pagination?: { totalPages?: number };
      }>(res, "ProductsPage fetch products");
      if (!res.ok) throw new Error(data?.error || "Failed to load");
      setProducts(data?.data || []);
      setTotalPages(data?.pagination?.totalPages || 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [activeMain.slug, consumableFilterKey, consumableFilterValue, page, productSlug, search, showMainShop]);

  useEffect(() => { void fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    if (activeMain.slug !== "consumables") return;

    let cancelled = false;
    async function loadCategoryPreviews() {
      const previewTypes = ["toner", "parts"];
      const entries = await Promise.all(
        previewTypes.map(async (typeSlug) => {
          try {
            const params = new URLSearchParams({
              status: "active",
              page: "1",
              limit: "1",
              consumableGroup: typeSlug,
            });
            const response = await fetch(`/api/product?${params.toString()}`);
            const payload = await safeReadJsonResponse<{ data?: Product[] }>(
              response,
              "ProductsPage category previews",
            );
            return [typeSlug, payload?.data?.[0]] as const;
          } catch {
            return [typeSlug, undefined] as const;
          }
        }),
      );
      if (cancelled) return;
      setCategoryPreviewProducts(
        Object.fromEntries(entries.filter((entry): entry is readonly [string, Product] => Boolean(entry[1]))),
      );
    }

    void loadCategoryPreviews();

    return () => {
      cancelled = true;
    };
  }, [activeMain.slug]);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.images?.find((i) => i.isPrimary)?.url ?? product.images?.[0]?.url,
    });
  };

  const handleBuyNow = (product: Product) => {
    handleAddToCart(product);
    router.push("/checkout");
  };

  const rootCategoryCards = CONSUMABLE_MAIN_GROUPS.map((group) => ({
    ...group,
    imageUrl: getPrimaryImage(categoryPreviewProducts[group.slug])?.url,
  }));
  const selectedTypeCards = activeGroup
    ? PARTS_AND_TONER_TYPES.filter((type) =>
      getConsumableTypeSlugsForGroup(activeGroup.slug).includes(type.slug),
    ).map((type) => {
      const product = products.find((item) => item.category?.slug === type.slug);
      return {
        title: type.label,
        href: buildProductsHref("consumables", type.slug),
        imageUrl: getPrimaryImage(product)?.url,
      };
    })
    : [];
  const isConsumablesPage = activeMain.slug === "consumables" && !showMainShop;

  return (
    <div className="min-h-screen bg-white text-black font-myriad">
      <NavBar />

      {isConsumablesPage ? <ConsumablesHero /> : null}

      <main className="max-w-6xl mx-auto px-4 py-8 sm:py-10">
        {showMainShop ? (
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-extrabold uppercase tracking-tight text-black sm:text-4xl">
              Shop
            </h1>
          </div>
        ) : null}

        <div className="mb-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/50 pointer-events-none" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search..."
              className="w-full border border-black/70 bg-white py-3 pl-9 pr-4 text-sm font-semibold uppercase text-black placeholder:text-black/70 focus:border-[var(--brand-cyan)] focus:outline-none"
            />
          </div>
        </div>

        {showMainShop ? (
          <div className="mb-12">
            <div className="mx-auto grid max-w-3xl grid-cols-1 gap-x-1.25 gap-y-10 sm:grid-cols-2">
              <CategoryCard
                title="Printers"
                href={buildProductsHref("photocopiers")}
                imageUrl={CATEGORY_IMAGES.printers}
              />
              <CategoryCard
                title="Parts and Toners"
                href="/consumables"
                imageUrl={CATEGORY_IMAGES.consumables}
              />
            </div>
          </div>
        ) : null}

        {!showMainShop ? (
          <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-black/55">
            <Link href="/products" className="hover:text-[var(--brand-cyan)]">Products</Link>
            <span>/</span>
            <Link href={buildProductsHref(activeMain.slug)} className="hover:text-[var(--brand-cyan)]">
              {activeMain.label}
            </Link>
            {activeConsumableLabel ? (
              <>
                <span>/</span>
                <span className="text-black/80">{activeConsumableLabel}</span>
              </>
            ) : null}
          </nav>
        ) : null}

        {isConsumablesPage ? (
          <div className="mb-12">
            <div className="mx-auto grid max-w-3xl grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2">
              {rootCategoryCards.map((type) => (
                <CategoryCard
                  key={type.slug}
                  title={type.label}
                  href={buildProductsHref("consumables", type.slug)}
                  imageUrl={type.imageUrl}
                />
              ))}
            </div>
          </div>
        ) : null}

        {isConsumablesPage && activeGroup ? (
          <div className="mb-12">
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-3">
              {selectedTypeCards.map((card) => (
                <CategoryCard key={card.title} {...card} />
              ))}
            </div>
          </div>
        ) : null}

        {!showMainShop && error ? <p className="text-center text-red-500 text-sm py-8">{error}</p> : null}

        {!showMainShop && loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : null}

        {!showMainShop && !loading && !error && products.length === 0 ? (
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

        {!showMainShop && !loading && !error && products.length > 0 ? (
          <>
            {activeConsumableLabel ? (
              <h2 className="mb-7 text-center text-xl font-bold uppercase tracking-wide text-black">
                {activeConsumableLabel}
              </h2>
            ) : null}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                />
              ))}
            </div>
            {totalPages > 1 ? (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button onClick={() => setPage((p) => p - 1)} disabled={page === 1}
                  className="px-4 py-1.5 text-sm text-black/60 border border-black/20 rounded-lg hover:border-[var(--brand-cyan)] hover:text-[var(--brand-cyan)] disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                  Previous
                </button>
                <span className="text-sm text-black/50">Page {page} of {totalPages}</span>
                <button onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}
                  className="px-4 py-1.5 text-sm text-black/60 border border-black/20 rounded-lg hover:border-[var(--brand-cyan)] hover:text-[var(--brand-cyan)] disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                  Next
                </button>
              </div>
            ) : null}
          </>
        ) : null}
      </main>

      {showMainShop ? (
        <FeaturedProductsSection
          title="FEATURED PRODUCTS"
          kicker=""
          description=""
          limit={8}
          className="border-t-0 pt-8"
          centered
          showBrowseLink={true}
          allowGlobalFallback={true}
        />
      ) : null}

      {isConsumablesPage ? (
        <FeaturedProductsSection
          title="FEATURED PRODUCTS"
          kicker=""
          description=""
          categorySlugs={CONSUMABLE_CATEGORY_SLUGS}
          limit={8}
          className="border-t-0 pt-8"
          centered
          showBrowseLink={false}
          allowGlobalFallback={false}
        />
      ) : null}

      <SiteFooter />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsInner />
    </Suspense>
  );
}
