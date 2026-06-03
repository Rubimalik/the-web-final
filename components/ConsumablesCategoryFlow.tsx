"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type React from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { PackageSearch, Search } from "lucide-react";
import NavBar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import FeaturedProductsSection from "@/components/FeaturedProductsSection";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/components/CartProvider";
import { getProductImagePlaceholderUrl } from "@/lib/product-image-placeholder";
import { readJsonArrayField, safeReadJsonResponse } from "@/lib/safe-json";
import { CATEGORY_IMAGES } from "@/lib/category-images";
import {
  CONSUMABLE_CATEGORY_SLUGS,
  PARTS_AND_TONER_BRANDS,
  PARTS_AND_TONER_TYPES,
  getPartsBrandBySlug,
  getPartsTypeBySlug,
  getProductHref,
} from "@/lib/product-taxonomy";

interface ProductImage { id: number; url: string; isPrimary: boolean; }
interface Category { id: number; name: string; slug: string; }
interface Product {
  id: number;
  slug?: string | null;
  name: string;
  description: string | null;
  price: number | null;
  tags: string | null;
  status: string;
  createdAt: string;
  images: ProductImage[];
  category: Category | null;
}

function ConsumablesHero() {
  return (
    <section className="relative overflow-hidden bg-slate-800 bg-[radial-gradient(circle_at_80%_30%,rgba(102,217,255,0.18),transparent_28%),linear-gradient(135deg,#324250,#18222c)]">
      <div className="absolute inset-0 opacity-30">
        <img
          src="/images/parts banner.png"
          alt="Parts and Toner Banner"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <h1 className="text-3xl font-extrabold uppercase tracking-tight text-white sm:text-4xl">
          Parts and Toner
        </h1>
      </div>
    </section>
  );
}

function SearchBox({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/50 pointer-events-none" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search..."
        className="w-full border border-black/70 bg-white py-3 pl-9 pr-4 text-sm font-semibold uppercase text-black placeholder:text-black/70 focus:border-[var(--brand-cyan)] focus:outline-none"
      />
    </div>
  );
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

function getPrimaryImage(product?: Product) {
  return product?.images?.find((image) => image.isPrimary) ?? product?.images?.[0];
}

function EmptyProducts({ label }: { label: string }) {
  return (
    <div className="mx-auto max-w-md rounded-2xl brand-surface p-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cyan-50 text-[var(--brand-cyan)]">
        <PackageSearch className="h-5 w-5" />
      </div>
      <p className="font-semibold text-black">No products found</p>
      <p className="mt-2 text-sm leading-relaxed text-black/55">
        No {label.toLowerCase()} products have been added yet.
      </p>
    </div>
  );
}

export function ConsumablesLandingPage() {
  const [searchInput, setSearchInput] = useState("");
  const [previewProducts, setPreviewProducts] = useState<Record<string, Product>>({});

  useEffect(() => {
    let cancelled = false;

    async function loadPreviews() {
      const entries = await Promise.all(
        PARTS_AND_TONER_BRANDS.map(async (brand) => {
          try {
            const params = new URLSearchParams({
              public: "1",
              status: "active",
              page: "1",
              limit: "1",
              consumableBrand: brand.slug,
            });
            const response = await fetch(`/api/product?${params.toString()}`);
            const payload = await safeReadJsonResponse<unknown>(
              response,
              "ConsumablesLandingPage previews",
            );
            return [brand.slug, readJsonArrayField<Product>(payload)[0]] as const;
          } catch {
            return [brand.slug, undefined] as const;
          }
        }),
      );
      if (!cancelled) {
        setPreviewProducts(
          Object.fromEntries(
            entries
              .filter((entry) => Boolean(entry[1]))
              .map(([slug, product]) => [slug, product as Product]),
          ),
        );
      }
    }

    void loadPreviews();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredBrands = PARTS_AND_TONER_BRANDS.filter((brand) =>
    brand.label.toLowerCase().includes(searchInput.trim().toLowerCase()),
  );

  // Map brand slugs to category image keys
  const getBrandImageUrl = (brandSlug: string) => {
    const brandImageMap: Record<string, string> = {
      canon: CATEGORY_IMAGES.canon,
      ricoh: CATEGORY_IMAGES.ricoh,
    };
    return brandImageMap[brandSlug] || getPrimaryImage(previewProducts[brandSlug])?.url;
  };

  return (
    <div className="min-h-screen bg-white text-black font-myriad">
      <NavBar />
      <ConsumablesHero />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <div className="mb-10">
          <SearchBox value={searchInput} onChange={setSearchInput} />
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-x-1.25 gap-y-10 sm:grid-cols-2">
          {filteredBrands.map((brand) => (
            <CategoryCard
              key={brand.slug}
              title={brand.label}
              href={`/consumables/${brand.slug}`}
              imageUrl={getBrandImageUrl(brand.slug)}
            />
          ))}
        </div>
      </main>
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
        showEmptyState
      />
      <SiteFooter />
    </div>
  );
}

export function ConsumablesBrandPage({ brandSlug }: { brandSlug: string }) {
  const brand = getPartsBrandBySlug(brandSlug);
  const [searchInput, setSearchInput] = useState("");
  const [previewProducts, setPreviewProducts] = useState<Record<string, Product>>({});

  useEffect(() => {
    if (!brand) return;
    const currentBrand = brand;
    let cancelled = false;

    async function loadPreviews() {
      const entries = await Promise.all(
        PARTS_AND_TONER_TYPES.map(async (type) => {
          try {
            const params = new URLSearchParams({
              public: "1",
              status: "active",
              page: "1",
              limit: "1",
              consumableBrand: currentBrand.slug,
              consumableType: type.slug,
            });
            const response = await fetch(`/api/product?${params.toString()}`);
            const payload = await safeReadJsonResponse<unknown>(
              response,
              "ConsumablesBrandPage previews",
            );
            return [type.slug, readJsonArrayField<Product>(payload)[0]] as const;
          } catch {
            return [type.slug, undefined] as const;
          }
        }),
      );
      if (!cancelled) {
        setPreviewProducts(
          Object.fromEntries(
            entries
              .filter((entry) => Boolean(entry[1]))
              .map(([slug, product]) => [slug, product as Product]),
          ),
        );
      }
    }

    void loadPreviews();
    return () => {
      cancelled = true;
    };
  }, [brand]);

  if (!brand) notFound();

  const filteredTypes = PARTS_AND_TONER_TYPES.filter((type) =>
    `${brand.label} ${type.label}`.toLowerCase().includes(searchInput.trim().toLowerCase()),
  );

  // Map type slugs to category image keys
  const getTypeImageUrl = (typeSlug: string) => {
    const typeImageMap: Record<string, string> = {
      "waste-toner-bottles": CATEGORY_IMAGES.wasteToners,
      "staples": CATEGORY_IMAGES.staples,
      "toner": CATEGORY_IMAGES.toners,
      "drum-units": CATEGORY_IMAGES.drumUnits,
      "parts": CATEGORY_IMAGES.parts,
    };
    return typeImageMap[typeSlug] || getPrimaryImage(previewProducts[typeSlug])?.url;
  };

  return (
    <div className="min-h-screen bg-white text-black font-myriad">
      <NavBar />
      <ConsumablesHero />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <div className="mb-8">
          <SearchBox value={searchInput} onChange={setSearchInput} />
        </div>
        <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-black/55">
          <Link href="/products" className="hover:text-[var(--brand-cyan)]">Products</Link>
          <span>/</span>
          <Link href="/consumables" className="hover:text-[var(--brand-cyan)]">Parts and Toners</Link>
          <span>/</span>
          <span className="text-black/80">{brand.label}</span>
        </nav>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-x-1.25 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTypes.map((type) => (
            <CategoryCard
              key={type.slug}
              title={`${brand.label} ${type.label}`}
              href={`/consumables/${brand.slug}/${type.slug}`}
              imageUrl={getTypeImageUrl(type.slug)}
            />
          ))}
        </div>
      </main>
      <FeaturedProductsSection
        title="FEATURED PRODUCTS"
        kicker=""
        description=""
        categorySlugs={PARTS_AND_TONER_TYPES.map((type) => `${brand.slug}-${type.slug}`)}
        limit={8}
        className="border-t-0 pt-8"
        centered
        showBrowseLink={false}
        allowGlobalFallback={true}
        showEmptyState={false}
      />
      <SiteFooter />
    </div>
  );
}

export function ConsumablesProductsPage({
  brandSlug,
  typeSlug,
}: {
  brandSlug: string;
  typeSlug: string;
}) {
  const brand = getPartsBrandBySlug(brandSlug);
  const type = getPartsTypeBySlug(typeSlug);
  const router = useRouter();
  const { addToCart } = useCart();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const heading = brand && type ? `${brand.label} ${type.label}` : "";

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchProducts = useCallback(async () => {
    if (!brand || !type) return;
    const currentBrand = brand;
    const currentType = type;
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        public: "1",
        status: "active",
        page: "1",
        limit: "100",
        consumableBrand: currentBrand.slug,
        consumableType: currentType.slug,
      });
      if (search) params.set("search", search);
      const response = await fetch(`/api/product?${params.toString()}`);
      const payload = await safeReadJsonResponse<{ data?: Product[]; products?: Product[]; error?: string }>(
        response,
        "ConsumablesProductsPage products",
      );
      if (!response.ok) throw new Error(payload?.error || "Failed to load products");
      setProducts(readJsonArrayField<Product>(payload));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [brand, search, type]);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  const handleAddToCart = (product: Product, imageUrl: string) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl,
    });
  };

  const handleBuyNow = (product: Product, imageUrl: string) => {
    handleAddToCart(product, imageUrl);
    router.push("/checkout");
  };

  if (!brand || !type) notFound();

  return (
    <div className="min-h-screen bg-white text-black font-myriad">
      <NavBar />
      <ConsumablesHero />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <div className="mb-8">
          <SearchBox value={searchInput} onChange={setSearchInput} />
        </div>
        <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-black/55">
          <Link href="/products" className="hover:text-[var(--brand-cyan)]">Products</Link>
          <span>/</span>
          <Link href="/consumables" className="hover:text-[var(--brand-cyan)]">Parts and Toners</Link>
          <span>/</span>
          <Link href={`/consumables/${brand.slug}`} className="hover:text-[var(--brand-cyan)]">{brand.label}</Link>
          <span>/</span>
          <span className="text-black/80">{type.label}</span>
        </nav>
        <h1 className="mb-8 text-center text-2xl font-bold uppercase tracking-wide text-black">
          {heading}
        </h1>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="aspect-[4/5] rounded-2xl border border-black/10 bg-black/5 animate-pulse" />
            ))}
          </div>
        ) : null}
        {error ? <p className="py-8 text-center text-sm text-red-500">{error}</p> : null}
        {!loading && !error && products.length === 0 ? <EmptyProducts label={heading} /> : null}
        {!loading && !error && products.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => {
              const imageUrl =
                product.images?.find((image) => image.isPrimary)?.url ??
                product.images?.[0]?.url ??
                getProductImagePlaceholderUrl();
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  href={getProductHref(product)}
                  onAddToCart={() => handleAddToCart(product, imageUrl)}
                  onBuyNow={() => handleBuyNow(product, imageUrl)}
                />
              );
            })}
          </div>
        ) : null}
      </main>
      <FeaturedProductsSection
        title="FEATURED PRODUCTS"
        kicker=""
        description=""
        categorySlugs={[`${brand.slug}-${type.slug}`]}
        limit={8}
        className="border-t-0 pt-8"
        centered
        showBrowseLink={false}
        allowGlobalFallback={true}
        showEmptyState={false}
      />
      <SiteFooter />
    </div>
  );
}

export function ConsumableSlugResolver({
  brandSlug,
  typeSlug,
  productSlug,
  render,
}: {
  brandSlug: string;
  typeSlug: string;
  productSlug: string;
  render: (productId: string) => React.ReactNode;
}) {
  const brand = getPartsBrandBySlug(brandSlug);
  const type = getPartsTypeBySlug(typeSlug);
  const [productId, setProductId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const paramsKey = useMemo(() => `${brandSlug}/${typeSlug}/${productSlug}`, [brandSlug, productSlug, typeSlug]);

  useEffect(() => {
    if (!brand || !type) return;
    let cancelled = false;

    async function resolveProduct() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/product/${encodeURIComponent(productSlug)}?public=1`);
        const payload = await safeReadJsonResponse<{ data?: Product; error?: string }>(
          response,
          "ConsumableSlugResolver product",
        );
        if (!response.ok) throw new Error(payload?.error || "Failed to load product");
        const match = payload?.data;
        if (!cancelled) {
          setProductId(match ? String(match.id) : null);
          setError(match ? "" : "Product not found");
        }
      } catch (err) {
        if (!cancelled) {
          setProductId(null);
          setError(err instanceof Error ? err.message : "Product not found");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void resolveProduct();
    return () => {
      cancelled = true;
    };
  }, [brand, paramsKey, productSlug, type]);

  if (!brand || !type) notFound();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-black/50">
        Loading product...
      </div>
    );
  }

  if (error || !productId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-4 text-center">
        <p className="text-black/55">{error || "Product not found"}</p>
        <Link href={`/consumables/${brand.slug}/${type.slug}`} className="text-sm text-black/70 underline transition hover:text-[var(--brand-cyan)]">
          Back to {brand.label} {type.label}
        </Link>
      </div>
    );
  }

  return <>{render(productId)}</>;
}
