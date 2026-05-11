"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PackageSearch, Search } from "lucide-react";
import DealerFeaturedProductsSection from "@/components/dealer/DealerFeaturedProductsSection";
import ProductCard from "@/components/ProductCard";
import { useDealerCart } from "@/components/dealer/DealerCartProvider";
import { getProductImagePlaceholderUrl } from "@/lib/product-image-placeholder";
import { safeReadJsonResponse } from "@/lib/safe-json";
import { CATEGORY_IMAGES } from "@/lib/category-images";

interface ProductImage { id: number; url: string; isPrimary: boolean; }
interface Category { id: number; name: string; slug: string; }
interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  dealerPrice?: number | null;
  tags: string | null;
  status: string;
  visibility: "public" | "dealer" | "both";
  createdAt: string;
  images: ProductImage[];
  category: Category | null;
}

function PrintersHero() {
  return (
    <section className="bg-slate-800 bg-[radial-gradient(circle_at_80%_30%,rgba(102,217,255,0.18),transparent_28%),linear-gradient(135deg,#324250,#18222c)]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <h1 className="text-3xl font-extrabold uppercase tracking-tight text-white sm:text-4xl">
          Printers & Photocopiers
        </h1>
        <p className="mt-4 inline-block bg-[var(--brand-cyan)] px-4 py-2 text-sm font-bold leading-snug text-white">
          Account-exclusive printer and photocopier inventory
        </p>
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

function EmptyProducts() {
  return (
    <div className="mx-auto max-w-md rounded-2xl brand-surface p-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cyan-50 text-[var(--brand-cyan)]">
        <PackageSearch className="h-5 w-5" />
      </div>
      <p className="font-semibold text-black">No products found</p>
      <p className="mt-2 text-sm leading-relaxed text-black/55">
        No printer products have been added yet.
      </p>
    </div>
  );
}

export default function DealerPrintersPage() {
  const router = useRouter();
  const { addToDealerCart } = useDealerCart();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        slug: "photocopiers",
        page: String(page),
        limit: "12",
      });
      if (search) params.set("search", search);

      const response = await fetch(`/api/dealer/product?${params}`, {
        cache: "no-store",
      });
      const payload = await safeReadJsonResponse<{
        error?: string;
        data?: Product[];
        pagination?: { totalPages?: number };
      }>(response, "DealerPrintersPage fetch");

      if (!response.ok) {
        throw new Error(payload?.error || "Failed to load products");
      }

      setProducts(payload?.data ?? []);
      setTotalPages(payload?.pagination?.totalPages ?? 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setPage(1);
    setSearchInput("");
    setSearch("");
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleAddToCart = (product: Product, imageUrl: string) => {
    addToDealerCart({
      id: product.id,
      name: product.name,
      retailPrice: product.price,
      dealerPrice: product.dealerPrice ?? null,
      imageUrl,
      categoryName: product.category?.name ?? null,
      minQuantity: 1,
    }, 1);
  };

  const handleBuyNow = (product: Product, imageUrl: string) => {
    handleAddToCart(product, imageUrl);
    router.push("/dealer/cart");
  };

  return (
    <div className="min-h-screen bg-white text-black font-myriad">
      <PrintersHero />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <div className="mb-8">
          <SearchBox value={searchInput} onChange={setSearchInput} />
        </div>

        <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-black/55">
          <Link href="/dealer/products" className="hover:text-[var(--brand-cyan)]">Products</Link>
          <span>/</span>
          <span className="text-black/80">Printers</span>
        </nav>

        <h1 className="mb-8 text-center text-2xl font-bold uppercase tracking-wide text-black">
          Printers & Photocopiers
        </h1>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="aspect-[4/5] rounded-2xl border border-black/10 bg-black/5 animate-pulse" />
            ))}
          </div>
        ) : null}

        {error ? <p className="py-8 text-center text-sm text-red-500">{error}</p> : null}

        {!loading && !error && products.length === 0 ? <EmptyProducts /> : null}

        {!loading && !error && products.length > 0 ? (
          <>
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
                    href={`/dealer/products/${product.id}`}
                    mode="dealer"
                    onAddToCart={() => handleAddToCart(product, imageUrl)}
                    onBuyNow={() => handleBuyNow(product, imageUrl)}
                  />
                );
              })}
            </div>
            {totalPages > 1 ? (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  type="button"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                  className="px-4 py-1.5 text-sm text-black/60 border border-black/20 rounded-lg hover:border-[var(--brand-cyan)] hover:text-[var(--brand-cyan)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>
                <span className="text-sm text-black/50">Page {page} of {totalPages}</span>
                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === totalPages}
                  className="px-4 py-1.5 text-sm text-black/60 border border-black/20 rounded-lg hover:border-[var(--brand-cyan)] hover:text-[var(--brand-cyan)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            ) : null}
          </>
        ) : null}
      </main>

      <DealerFeaturedProductsSection
        title="FEATURED PRODUCTS"
        kicker=""
        description=""
        categorySlug="photocopiers"
        limit={8}
        className="border-t-0 pt-8"
        centered
        showBrowseLink={false}
        allowGlobalFallback={false}
      />

    </div>
  );
}
