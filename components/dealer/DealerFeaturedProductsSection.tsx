"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProductCard, { type ProductCardProduct } from "@/components/ProductCard";
import { useDealerCart } from "@/components/dealer/DealerCartProvider";
import { safeReadJsonResponse } from "@/lib/safe-json";

function mergeProducts(
  preferred: ProductCardProduct[],
  fallback: ProductCardProduct[],
  excludeId?: number,
) {
  const seen = new Set<number>();
  const merged: ProductCardProduct[] = [];

  for (const product of [...preferred, ...fallback]) {
    if (product.id === excludeId || seen.has(product.id)) continue;
    seen.add(product.id);
    merged.push(product);
  }

  return merged;
}

export default function DealerFeaturedProductsSection({
  title = "Featured Products",
  kicker = "Product Highlights",
  description = "Explore active stock with account pricing and exclusive availability.",
  categorySlug,
  categorySlugs,
  excludeId,
  limit = 8,
  className = "",
  centered = false,
  showBrowseLink = true,
  allowGlobalFallback = true,
  showEmptyState = false,
}: {
  title?: string;
  kicker?: string;
  description?: string;
  categorySlug?: string | null;
  categorySlugs?: string[];
  excludeId?: number;
  limit?: number;
  className?: string;
  centered?: boolean;
  showBrowseLink?: boolean;
  allowGlobalFallback?: boolean;
  showEmptyState?: boolean;
}) {
  const [preferredProducts, setPreferredProducts] = useState<ProductCardProduct[]>([]);
  const [fallbackProducts, setFallbackProducts] = useState<ProductCardProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToDealerCart } = useDealerCart();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setIsLoading(true);
      try {
        const requests: Promise<Response>[] = [];
        if (categorySlugs && categorySlugs.length > 0) {
          requests.push(fetch(`/api/dealer/product?featured=1&slugs=${encodeURIComponent(categorySlugs.join(","))}&page=1&limit=${limit + 1}`, { cache: "no-store" }));
        } else if (categorySlug) {
          requests.push(fetch(`/api/dealer/product?featured=1&slug=${encodeURIComponent(categorySlug)}&page=1&limit=${limit + 1}`, { cache: "no-store" }));
        }
        if ((!categorySlug && (!categorySlugs || categorySlugs.length === 0)) || allowGlobalFallback) {
          requests.push(fetch(`/api/dealer/product?featured=1&page=1&limit=${limit + 4}`, { cache: "no-store" }));
        }

        const responses = await Promise.all(requests);
        const payloads = await Promise.all(
          responses.map((response) =>
            safeReadJsonResponse<{ data?: ProductCardProduct[] }>(
              response,
              "DealerFeaturedProductsSection fetch",
            ),
          ),
        );

        if (cancelled) return;
        const hasCategoryFilter = Boolean(categorySlug || (categorySlugs && categorySlugs.length > 0));
        const preferred = hasCategoryFilter ? payloads[0]?.data ?? [] : [];
        const fallback = hasCategoryFilter
          ? allowGlobalFallback
            ? payloads[1]?.data ?? []
            : []
          : payloads[0]?.data ?? [];
        setPreferredProducts(Array.isArray(preferred) ? preferred : []);
        setFallbackProducts(Array.isArray(fallback) ? fallback : []);
      } catch {
        if (!cancelled) {
          setPreferredProducts([]);
          setFallbackProducts([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, [allowGlobalFallback, categorySlug, categorySlugs, excludeId, limit]);

  const products = useMemo(
    () => mergeProducts(preferredProducts, fallbackProducts, excludeId).slice(0, limit),
    [excludeId, fallbackProducts, limit, preferredProducts],
  );

  if (!isLoading && products.length === 0 && !showEmptyState) {
    return null;
  }

  return (
    <section className={`border-t border-black/10 px-4 py-14 sm:py-16 ${className}`}>
      <div className="mx-auto max-w-6xl">
        <div className={`mb-8 flex flex-col gap-4 ${centered ? "items-center text-center" : "sm:flex-row sm:items-end sm:justify-between"}`}>
          <div className="max-w-2xl">
            {kicker ? (
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-cyan)]">
                {kicker}
              </p>
            ) : null}
            <h2 className={`${kicker ? "mt-2" : ""} text-2xl font-bold brand-title md:text-3xl`}>{title}</h2>
            {description ? (
              <p className="mt-3 text-sm leading-6 text-black/60 sm:text-base">{description}</p>
            ) : null}
          </div>
          {showBrowseLink ? (
            <Link
              href="/dealer/products"
              className="inline-flex w-full items-center justify-center rounded-xl border border-black/15 bg-white px-4 py-3 text-sm font-bold text-black transition hover:border-[var(--brand-cyan)] hover:text-[var(--brand-cyan)] sm:w-auto"
            >
              Browse catalogue
            </Link>
          ) : null}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-80 animate-pulse rounded-2xl border border-black/10 bg-cyan-50/45" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                href={`/dealer/products/${product.id}`}
                mode="dealer"
                onAddToCart={(item, imageUrl) =>
                  addToDealerCart({
                    id: item.id,
                    name: item.name,
                    retailPrice: item.price,
                    dealerPrice: item.dealerPrice ?? null,
                    imageUrl,
                    categoryName: item.category?.name ?? null,
                    minQuantity: 1,
                  })
                }
                onBuyNow={(item, imageUrl) => {
                  addToDealerCart({
                    id: item.id,
                    name: item.name,
                    retailPrice: item.price,
                    dealerPrice: item.dealerPrice ?? null,
                    imageUrl,
                    categoryName: item.category?.name ?? null,
                    minQuantity: 1,
                  });
                  router.push("/dealer/cart");
                }}
              />
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-md rounded-2xl border border-black/10 bg-white p-8 text-center">
            <p className="font-semibold text-black">No featured products yet</p>
            <p className="mt-2 text-sm leading-relaxed text-black/55">
              Featured products selected in admin will appear here.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
