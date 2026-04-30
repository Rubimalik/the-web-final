"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { getProductImagePlaceholderUrl } from "@/lib/product-image-placeholder";
import { safeReadJsonResponse } from "@/lib/safe-json";

interface ProductImage {
  id: number;
  url: string;
  isPrimary: boolean;
}

interface Product {
  id: number;
  name: string;
  price: number | null;
  images: ProductImage[];
}

function useItemsPerView() {
  const [itemsPerView, setItemsPerView] = useState(4);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w >= 1200) setItemsPerView(4);
      else if (w >= 900) setItemsPerView(3);
      else if (w >= 640) setItemsPerView(2);
      else setItemsPerView(1);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return itemsPerView;
}

export default function FeaturedProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const itemsPerView = useItemsPerView();
  const { addToCart, buyNow } = useCart();
  const router = useRouter();

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/product?status=active&page=1&limit=10");
        const data = await safeReadJsonResponse<{ data?: Product[] }>(res, "FeaturedProductsSection fetch");
        const incoming = Array.isArray(data?.data) ? data.data : [];
        setProducts(incoming.slice(0, 10));
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    setIndex(0);
  }, [itemsPerView]);

  const maxIndex = Math.max(0, products.length - itemsPerView);
  const canMovePrev = index > 0;
  const canMoveNext = index < maxIndex;

  const translatePercent = useMemo(() => {
    if (itemsPerView <= 0) return 0;
    return index * (100 / itemsPerView);
  }, [index, itemsPerView]);

  return (
    <section className="border-t border-black/10 px-4 py-14 sm:py-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--brand-cyan)]">Store Highlights</p>
            <h2 className="text-3xl md:text-4xl font-bold brand-title">Featured Products</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous products"
              onClick={() => setIndex((prev) => Math.max(0, prev - 1))}
              disabled={!canMovePrev}
              className="h-10 w-10 rounded-full border border-black/20 text-black/80 disabled:opacity-30 transition hover:text-[var(--brand-cyan)] hover:border-[var(--brand-cyan)]"
            >
              <ChevronLeft className="mx-auto h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Next products"
              onClick={() => setIndex((prev) => Math.min(maxIndex, prev + 1))}
              disabled={!canMoveNext}
              className="h-10 w-10 rounded-full border border-black/20 text-black/80 disabled:opacity-30 transition hover:text-[var(--brand-cyan)] hover:border-[var(--brand-cyan)]"
            >
              <ChevronRight className="mx-auto h-5 w-5" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-72 rounded-2xl bg-cyan-50 border border-black/10 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${translatePercent}%)` }}
            >
              {products.map((product) => {
                const image = product.images?.find((img) => img.isPrimary) ?? product.images?.[0];
                const imageUrl = image?.url ?? getProductImagePlaceholderUrl();
                return (
                  <article
                    key={product.id}
                    className="px-2 shrink-0"
                    style={{ width: `${100 / itemsPerView}%` }}
                  >
                    <div className="h-full rounded-2xl brand-surface p-3 sm:p-4 flex flex-col gap-3">
                      <Link href={`/products/${product.id}`} className="group">
                        <div className="aspect-[4/3] overflow-hidden rounded-xl bg-cyan-50 border border-black/10">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </Link>
                      <Link href={`/products/${product.id}`} className="space-y-1">
                        <h3 className="text-sm sm:text-base font-semibold text-black line-clamp-2">{product.name}</h3>
                        <p className="text-sm text-black/80">
                          {product.price != null ? `£${Number(product.price).toFixed(2)}` : "POA"}
                        </p>
                      </Link>
                      <div className="grid grid-cols-1 gap-2">
                        <button
                          type="button"
                          className="brand-button rounded-lg py-2.5 text-sm"
                          onClick={() =>
                            addToCart({
                              id: product.id,
                              name: product.name,
                              price: product.price,
                              imageUrl,
                            })
                          }
                        >
                          Add to Cart
                        </button>
                        <button
                          type="button"
                          className="rounded-lg border border-black/25 bg-white py-2.5 text-sm font-semibold text-black transition hover:border-[var(--brand-cyan)] hover:text-[var(--brand-cyan)]"
                          onClick={() => {
                            buyNow({
                              id: product.id,
                              name: product.name,
                              price: product.price,
                              imageUrl,
                            });
                            router.push("/checkout");
                          }}
                        >
                          Buy Now
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
