"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProductCard, { type ProductCardProduct } from "@/components/ProductCard";
import { useCart } from "@/components/CartProvider";
import { safeReadJsonResponse } from "@/lib/safe-json";
import { getConsumableProductHref } from "@/lib/product-taxonomy";

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

function getProductsFromPayload(payload: unknown) {
  if (Array.isArray(payload)) {
    return payload as ProductCardProduct[];
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const productPayload = payload as {
    data?: unknown;
    products?: unknown;
  };

  if (Array.isArray(productPayload.data)) {
    return productPayload.data as ProductCardProduct[];
  }

  if (Array.isArray(productPayload.products)) {
    return productPayload.products as ProductCardProduct[];
  }

  return [];
}

export default function FeaturedProductsSection({
  title = "Featured Products",
  kicker = "Recommended",
  description = "Explore popular products selected from our active public catalogue.",
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
  const { addToCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setIsLoading(true);
      try {
        const urls: string[] = [];
        if (categorySlugs && categorySlugs.length > 0) {
          urls.push(`/api/product?public=1&featured=1&status=active&slugs=${encodeURIComponent(categorySlugs.join(","))}&page=1&limit=${limit + 1}`);
        } else if (categorySlug) {
          urls.push(`/api/product?public=1&featured=1&status=active&slug=${encodeURIComponent(categorySlug)}&page=1&limit=${limit + 1}`);
        }
        if ((!categorySlug && (!categorySlugs || categorySlugs.length === 0)) || allowGlobalFallback) {
          urls.push(`/api/product?public=1&featured=1&status=active&page=1&limit=${limit + 4}`);
        }

        const requests = urls.map((url) => fetch(url));
        const responses = await Promise.all(requests);
        const payloads = await Promise.all(
          responses.map((response) =>
            safeReadJsonResponse<unknown>(
              response,
              "FeaturedProductsSection fetch",
            ),
          ),
        );

        if (cancelled) return;
        const hasCategoryFilter = Boolean(categorySlug || (categorySlugs && categorySlugs.length > 0));
        const preferred = hasCategoryFilter ? getProductsFromPayload(payloads[0]) : [];
        const fallback = hasCategoryFilter
          ? allowGlobalFallback
            ? getProductsFromPayload(payloads[1])
            : []
          : getProductsFromPayload(payloads[0]);

        if (preferred.length > 0 || fallback.length > 0) {
          setPreferredProducts(preferred);
          setFallbackProducts(fallback);
          return;
        }

        const fallbackUrls = urls.map((url) => url.replace("&featured=1", ""));
        const fallbackResponses = await Promise.all(fallbackUrls.map((url) => fetch(url)));
        const fallbackPayloads = await Promise.all(
          fallbackResponses.map((response) =>
            safeReadJsonResponse<unknown>(
              response,
              "FeaturedProductsSection fallback fetch",
            ),
          ),
        );

        if (cancelled) return;
        setPreferredProducts(hasCategoryFilter ? getProductsFromPayload(fallbackPayloads[0]) : []);
        setFallbackProducts(
          hasCategoryFilter
            ? allowGlobalFallback
              ? getProductsFromPayload(fallbackPayloads[1])
              : []
            : getProductsFromPayload(fallbackPayloads[0]),
        );
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
    <section className={`border-t border-black/10 bg-white px-4 py-14 sm:py-16 ${className}`}>
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
              href="/products"
              className="inline-flex w-full items-center justify-center rounded-xl border border-black/15 bg-white px-4 py-3 text-sm font-bold text-black transition hover:border-[var(--brand-cyan)] hover:text-[var(--brand-cyan)] sm:w-auto"
            >
              Browse all products
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
                href={getConsumableProductHref(product)}
                onAddToCart={(item, imageUrl) =>
                  addToCart({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    imageUrl,
                  })
                }
                onBuyNow={(item, imageUrl) => {
                  addToCart({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    imageUrl,
                  });
                  router.push("/checkout");
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
