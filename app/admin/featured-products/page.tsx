"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Search, Star } from "lucide-react";
import { safeReadJsonResponse } from "@/lib/safe-json";

type ProductImage = {
  id: number;
  url: string;
  isPrimary: boolean;
};

type AdminProduct = {
  id: number;
  name: string;
  price: number | null;
  status: string;
  visibility: "public" | "dealer" | "both";
  isFeatured: boolean;
  featuredOrder: number | null;
  images: ProductImage[];
  category: { name: string } | null;
};

function formatPrice(value: number | null | undefined) {
  return typeof value === "number" ? `£${value.toFixed(2)}` : "POA";
}

export default function AdminFeaturedProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [search, setSearch] = useState("");
  const [featuredFilter, setFeaturedFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: "1", limit: "100" });
      if (search.trim()) params.set("search", search.trim());
      if (featuredFilter === "featured") params.set("featured", "1");
      if (featuredFilter === "not-featured") params.set("featured", "0");

      const response = await fetch(`/api/admin/featured-products?${params}`, {
        cache: "no-store",
        credentials: "include",
      });
      const payload = await safeReadJsonResponse<{ data?: AdminProduct[]; error?: string }>(
        response,
        "AdminFeaturedProductsPage load",
      );
      if (!response.ok) throw new Error(payload?.error || "Failed to load products");
      setProducts(payload?.data ?? []);
    } catch (err) {
      setProducts([]);
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [featuredFilter, search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadProducts();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [loadProducts]);

  async function updateFeatured(product: AdminProduct, nextFeatured: boolean, nextOrder?: number | null) {
    setSavingId(product.id);
    setError("");
    try {
      const response = await fetch("/api/admin/featured-products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          productId: product.id,
          isFeatured: nextFeatured,
          featuredOrder: nextFeatured ? nextOrder ?? product.featuredOrder : null,
        }),
      });
      const payload = await safeReadJsonResponse<{ data?: AdminProduct; error?: string }>(
        response,
        "AdminFeaturedProductsPage update",
      );
      if (!response.ok || !payload?.data) {
        throw new Error(payload?.error || "Failed to update featured status");
      }

      setProducts((current) =>
        current.map((item) => (item.id === product.id ? { ...item, ...payload.data } : item)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update featured status");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-400">
          Catalogue
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-white">Featured Products</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Choose which active catalogue products appear in featured sections across the public and dealer storefronts.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-[#13131a] p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products..."
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950/60 px-4 py-3 pl-10 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <select
          value={featuredFilter}
          onChange={(event) => setFeaturedFilter(event.target.value)}
          className="rounded-xl border border-zinc-700 bg-zinc-950/60 px-4 py-3 text-sm font-medium text-zinc-100 focus:border-indigo-500 focus:outline-none"
        >
          <option value="all">All products</option>
          <option value="featured">Featured only</option>
          <option value="not-featured">Not featured</option>
        </select>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-[#13131a]">
        {loading ? (
          <div className="flex items-center gap-2 px-5 py-8 text-sm text-zinc-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="px-5 py-8 text-sm text-zinc-400">No products found.</div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {products.map((product) => {
              const image = product.images?.find((item) => item.isPrimary) ?? product.images?.[0];
              const saving = savingId === product.id;
              return (
                <div key={product.id} className="grid gap-4 p-4 lg:grid-cols-[1fr_180px_160px_180px] lg:items-center">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-zinc-800 bg-white">
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={image.url} alt={product.name} className="h-full w-full object-contain p-1" />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-white">{product.name}</p>
                        {product.isFeatured ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2 py-0.5 text-xs font-semibold text-amber-300">
                            <Star className="h-3 w-3 fill-current" />
                            Featured
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-xs text-zinc-500">
                        {product.category?.name ?? "Uncategorised"} · {product.visibility} · {product.status}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-zinc-200">{formatPrice(product.price)}</p>

                  <label className="space-y-1">
                    <span className="text-xs font-medium text-zinc-500">Order</span>
                    <input
                      type="number"
                      min={0}
                      disabled={!product.isFeatured || saving}
                      defaultValue={product.featuredOrder ?? ""}
                      onBlur={(event) => {
                        const raw = event.target.value.trim();
                        const nextOrder = raw ? Number.parseInt(raw, 10) : null;
                        if (Number.isNaN(nextOrder)) return;
                        void updateFeatured(product, true, nextOrder);
                      }}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
                    />
                  </label>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => updateFeatured(product, !product.isFeatured)}
                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-60 ${
                      product.isFeatured
                        ? "border border-zinc-700 text-zinc-200 hover:border-red-400 hover:text-red-300"
                        : "bg-indigo-500 text-white hover:bg-indigo-400"
                    }`}
                  >
                    {saving ? "Saving..." : product.isFeatured ? "Remove from Featured" : "Mark as Featured"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
