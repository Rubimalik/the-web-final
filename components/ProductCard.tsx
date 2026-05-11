"use client";

import Link from "next/link";
import { getProductImagePlaceholderUrl } from "@/lib/product-image-placeholder";

export interface ProductCardImage {
  id: number;
  url: string;
  isPrimary: boolean;
}

export interface ProductCardCategory {
  id?: number;
  name: string;
  slug?: string;
}

export interface ProductCardProduct {
  id: number;
  name: string;
  description?: string | null;
  price: number | null;
  dealerPrice?: number | null;
  images: ProductCardImage[];
  category: ProductCardCategory | null;
}

function formatPrice(value: number | null | undefined) {
  return typeof value === "number" ? `\u00a3${value.toFixed(2)}` : "POA";
}

function getPrimaryImage(product: ProductCardProduct) {
  return product.images?.find((image) => image.isPrimary) ?? product.images?.[0];
}

export default function ProductCard({
  product,
  href,
  mode = "customer",
  onAddToCart,
  onBuyNow,
}: {
  product: ProductCardProduct;
  href: string;
  mode?: "customer" | "dealer";
  onAddToCart?: (product: ProductCardProduct, imageUrl: string) => void;
  onBuyNow?: (product: ProductCardProduct, imageUrl: string) => void;
}) {
  const imageUrl = getPrimaryImage(product)?.url ?? getProductImagePlaceholderUrl();
  const displayPrice = mode === "dealer" ? product.dealerPrice ?? product.price : product.price;

  return (
    <article className="group h-full rounded-2xl overflow-hidden bg-white border border-black/10 hover:border-[var(--brand-cyan)]/45 shadow-sm hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col">
      <Link href={href} className="block">
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
        <Link href={href} className="hover:text-[var(--brand-cyan)] transition-colors">
          <p className="text-base text-black font-bold line-clamp-2 leading-snug min-h-[44px]">
            {product.name}
          </p>
        </Link>
        <p className="text-lg text-black/80 font-bold">
          {formatPrice(displayPrice)}
        </p>
        <div className="mt-auto flex flex-col gap-2.5 pt-1">
          {onAddToCart ? (
            <button
              type="button"
              onClick={() => onAddToCart(product, imageUrl)}
              className="w-full inline-flex items-center justify-center gap-2 brand-button rounded-lg py-2.5 px-3 text-sm font-semibold"
            >
              {mode === "dealer" ? "Add to Cart" : "Add to Cart"}
            </button>
          ) : null}
          {onBuyNow ? (
            <button
              type="button"
              onClick={() => onBuyNow(product, imageUrl)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-black/25 bg-white py-2.5 px-3 text-sm font-semibold text-black transition hover:border-[var(--brand-cyan)] hover:text-[var(--brand-cyan)]"
            >
              Buy Now
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
