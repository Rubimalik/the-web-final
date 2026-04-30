"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ShoppingCart, Zap } from "lucide-react";
import NavBar from "@/components/Navbar";
import { useCart } from "@/components/CartProvider";
import { getProductImagePlaceholderUrl } from "@/lib/product-image-placeholder";
import { safeReadJsonResponse } from "@/lib/safe-json";

interface ProductImage { id: number; url: string; isPrimary: boolean; }
interface Category { id: number; name: string; slug: string; }
interface Product {
  id: number; name: string; description: string | null;
  price: number | null; tags: string | null; status: string;
  createdAt: string; images: ProductImage[];
  category: Category | null;
}

const CATEGORIES = [
  { label: "Printer", slug: "photocopiers" },
  { label: "Consumables", slug: "consumables" },
];

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
    <article className="group rounded-2xl overflow-hidden bg-white border border-black/10 hover:border-[var(--brand-cyan)]/45 shadow-sm hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl bg-cyan-50/40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
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
          {product.price != null ? `£${Number(product.price).toFixed(2)}` : "POA"}
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

// ── Inner component that reads searchParams ───────────────────────────────────
function ProductsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read slug from URL e.g. /products?category=consumables
  // Also support /products:category=photocopiers style
  const urlCategory = searchParams.get("category");
  const validSlug = CATEGORIES.find((c) => c.slug === urlCategory)?.slug ?? CATEGORIES[0].slug;

  const [activeSlug, setActiveSlug] = useState(validSlug);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { addToCart } = useCart();

  // Sync if URL changes externally
  useEffect(() => {
    const slug = CATEGORIES.find((c) => c.slug === urlCategory)?.slug ?? CATEGORIES[0].slug;
    setActiveSlug(slug);
    setPage(1);
    setSearchInput("");
    setSearch("");
  }, [urlCategory]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        slug: activeSlug,
        status: "active",
        page: String(page),
        limit: "12",
      });
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
  }, [activeSlug, search, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const switchCategory = (slug: string) => {
    // Update URL so it's shareable/bookmarkable
    router.push(`/products?category=${slug}`, { scroll: false });
    setActiveSlug(slug);
    setPage(1);
    setSearchInput("");
    setSearch("");
  };

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

  return (
    <div className="min-h-screen bg-white text-black font-myriad">
      <NavBar />

      {/* ── Category tabs ── */}
      <div className="border-b border-black/10 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-center gap-3">
          {CATEGORIES.map((cat) => (
            <button key={cat.slug} onClick={() => switchCategory(cat.slug)}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${activeSlug === cat.slug
                  ? "brand-button"
                  : "bg-white text-black border border-black/20 hover:border-[var(--brand-cyan)] hover:text-[var(--brand-cyan)]"
                }`}>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Search + content ── */}
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold brand-title">Products</h1>
            <p className="text-black/60 mt-1 text-sm sm:text-base">Browse available stock and shop quickly.</p>
          </div>
          <div className="relative w-full sm:w-[360px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40 pointer-events-none" />
            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-4 py-3 text-sm bg-white border border-black/15 text-black placeholder:text-black/45 rounded-lg focus:outline-none focus:border-[var(--brand-cyan)] transition-all" />
          </div>
        </div>

        <div className="h-px bg-black/10 mb-8" />

        {error && <p className="text-center text-red-500 text-sm py-8">{error}</p>}

        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <p className="text-center text-black/50 text-sm py-16">No products found.</p>
        )}

        {!loading && !error && products.length > 0 && (
          <>
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
            {totalPages > 1 && (
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
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Wrap in Suspense because useSearchParams requires it
export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsInner />
    </Suspense>
  );
}
