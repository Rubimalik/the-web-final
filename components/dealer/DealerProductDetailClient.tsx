"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ImageOff,
  Loader2,
  Mail,
  ShoppingCart,
} from "lucide-react";
import { HeicImage } from "@/components/HeicImage";
import DealerFeaturedProductsSection from "@/components/dealer/DealerFeaturedProductsSection";
import { useDealerCart } from "@/components/dealer/DealerCartProvider";
import { getProductImagePlaceholderUrl } from "@/lib/product-image-placeholder";
import { safeReadJsonResponse } from "@/lib/safe-json";
import { getPartsLeafCategoryBySlug, getProductCategoryPath } from "@/lib/product-taxonomy";

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
  visibility: "public" | "dealer" | "both";
  status: string;
  createdAt: string;
  images: ProductImage[];
  category: Category | null;
}

const PLACEHOLDER_IMAGE: ProductImage = {
  id: 0,
  url: getProductImagePlaceholderUrl(),
  isPrimary: true,
};

function formatPrice(value: number | null | undefined) {
  return typeof value === "number" ? `\u00a3${value.toFixed(2)}` : "POA";
}

function RichText({ text }: { text: string }) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return (
    <>
      {parts.map((part, index) =>
        urlRegex.test(part) ? (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all text-[var(--brand-cyan)] underline underline-offset-2 transition-colors"
          >
            {part}
          </a>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
}

export default function DealerProductDetailClient() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addToDealerCart } = useDealerCart();
  const [product, setProduct] = useState<DealerProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImg, setActiveImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [lightbox, setLightbox] = useState(false);
  const thumbnailRailRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch(`/api/dealer/product/${id}`, {
          cache: "no-store",
          credentials: "include",
        });
        const payload = await safeReadJsonResponse<{
          data?: DealerProduct;
          error?: string;
        }>(response, "DealerProductDetailClient load product");

        if (!response.ok || !payload?.data) {
          throw new Error(payload?.error || "Failed to load dealer product");
        }

        setProduct(payload.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dealer product");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (!lightbox || !product) return;
    const images = product.images.length > 0 ? product.images : [PLACEHOLDER_IMAGE];
    const handler = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") setActiveImg((current) => (current + 1) % images.length);
      if (event.key === "ArrowLeft") setActiveImg((current) => (current - 1 + images.length) % images.length);
      if (event.key === "Escape") setLightbox(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, product]);

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-black/30" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-black/55">{error || "Product not found"}</p>
        <button
          type="button"
          onClick={() => router.push("/dealer/products")}
          className="text-sm text-black/70 underline transition hover:text-[var(--brand-cyan)]"
        >
          Back to products
        </button>
      </div>
    );
  }

  const images = product.images.length > 0 ? product.images : [PLACEHOLDER_IMAGE];
  const currentImg = images[activeImg];
  const unitPrice = product.dealerPrice ?? product.price;
  const categoryPath = getProductCategoryPath(product.category?.slug);
  const leafCategory = getPartsLeafCategoryBySlug(product.category?.slug);
  const hasRetailComparison =
    typeof product.price === "number" &&
    typeof product.dealerPrice === "number" &&
    product.dealerPrice < product.price;

  function showPreviousImage() {
    setActiveImg((current) => (current - 1 + images.length) % images.length);
    thumbnailRailRef.current?.scrollBy({ left: -96, behavior: "smooth" });
  }

  function showNextImage() {
    setActiveImg((current) => (current + 1) % images.length);
    thumbnailRailRef.current?.scrollBy({ left: 96, behavior: "smooth" });
  }

  function addToCart() {
    if (!product) return;
    addToDealerCart(
      {
        id: product.id,
        name: product.name,
        retailPrice: product.price,
        dealerPrice: product.dealerPrice,
        imageUrl: images[0]?.url,
        categoryName: product.category?.name ?? null,
        minQuantity: 1,
      },
      quantity,
    );
  }

  return (
    <>
      <div className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
          <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-black/55">
            <Link href="/dealer/products" className="hover:text-[var(--brand-cyan)]">Products</Link>
            <span>/</span>
            {categoryPath.mainSlug === "consumables" ? (
              <>
                <Link href="/dealer/products/consumables" className="hover:text-[var(--brand-cyan)]">Consumables</Link>
                {leafCategory ? (
                  <>
                    <span>/</span>
                    <Link href={`/dealer/products/consumables/${leafCategory.brandSlug}`} className="hover:text-[var(--brand-cyan)]">
                      {leafCategory.brandLabel}
                    </Link>
                    <span>/</span>
                    <Link href={`/dealer/products/consumables/${leafCategory.brandSlug}/${leafCategory.typeSlug}`} className="hover:text-[var(--brand-cyan)]">
                      {leafCategory.typeLabel}
                    </Link>
                  </>
                ) : null}
              </>
            ) : (
              <Link href="/dealer/products/printers" className="hover:text-[var(--brand-cyan)]">Printers</Link>
            )}
            <span>/</span>
            <span className="text-black/80">{product.name}</span>
          </nav>
          <section className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(380px,0.95fr)] lg:gap-10">
            <div className="space-y-4">
              <div
                className="relative aspect-[4/3] cursor-zoom-in overflow-hidden rounded-2xl border border-black/10 bg-white"
                onClick={() => setLightbox(true)}
              >
                {currentImg ? (
                  <HeicImage
                    src={currentImg.url}
                    alt={product.name}
                    className="h-full w-full object-contain p-5 sm:p-8"
                    loading="eager"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ImageOff className="h-12 w-12 text-black/20" />
                  </div>
                )}

                {images.length > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        showPreviousImage();
                      }}
                      className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white/95 shadow-sm transition hover:border-[var(--brand-cyan)]"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        showNextImage();
                      }}
                      className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white/95 shadow-sm transition hover:border-[var(--brand-cyan)]"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                ) : null}
              </div>

              {images.length > 1 ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={showPreviousImage}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/15 bg-white text-black transition hover:border-[var(--brand-cyan)] hover:text-[var(--brand-cyan)]"
                    aria-label="Previous thumbnail"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <div
                    ref={thumbnailRailRef}
                    className="flex min-w-0 flex-1 gap-3 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:thin]"
                  >
                    {images.map((image, index) => (
                      <button
                        key={image.id}
                        type="button"
                        onClick={() => setActiveImg(index)}
                        className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-white transition ${
                          index === activeImg
                            ? "border-[var(--brand-cyan)] ring-2 ring-[var(--brand-cyan)]/15"
                            : "border-black/10 hover:border-black/30"
                        }`}
                      >
                        <HeicImage src={image.url} alt={`${product.name} ${index + 1}`} className="h-full w-full object-contain p-1.5" />
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={showNextImage}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/15 bg-white text-black transition hover:border-[var(--brand-cyan)] hover:text-[var(--brand-cyan)]"
                    aria-label="Next thumbnail"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              ) : null}
            </div>

            <aside className="bg-white lg:pt-2">
              <h1 className="text-3xl font-bold leading-tight brand-title sm:text-4xl">{product.name}</h1>

              <div className="mt-5 space-y-1">
                <p className="text-sm font-semibold text-black/50">Your Price</p>
                <p className="text-3xl font-bold text-black">{formatPrice(unitPrice)}</p>
                {hasRetailComparison ? (
                  <p className="text-sm text-black/50">
                    Retail: <span className="line-through">{formatPrice(product.price)}</span>
                  </p>
                ) : null}
              </div>

              {product.dealerNotes ? (
                <p className="mt-5 text-sm leading-6 text-black/65">
                  {product.dealerNotes}
                </p>
              ) : null}

              <div className="mt-6 space-y-3">
                <label className="block space-y-1.5" htmlFor="dealer-detail-qty">
                  <span className="text-xs font-bold uppercase tracking-wide text-black/50">Quantity</span>
                  <input
                    id="dealer-detail-qty"
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(event) => {
                      const parsed = Number.parseInt(event.target.value, 10);
                      setQuantity(Number.isFinite(parsed) ? Math.max(1, parsed) : 1);
                    }}
                    className="h-12 w-full rounded-xl border border-black/15 bg-white px-4 text-sm font-semibold text-black focus:border-[var(--brand-cyan)] focus:outline-none"
                  />
                </label>
                <button
                  type="button"
                  onClick={addToCart}
                  className="flex w-full items-center justify-center gap-2 rounded-xl brand-button py-3.5 text-sm font-bold transition-all active:scale-[0.98]"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </button>
                <a
                  href={`mailto:sales@buysupply.me?subject=Product Enquiry: ${encodeURIComponent(product.name)}&body=Hi, I'm interested in the product ${encodeURIComponent(product.name)} (ID: ${product.id}).`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-black/20 bg-white py-3 text-sm font-bold text-black transition-all hover:border-[var(--brand-cyan)] hover:text-[var(--brand-cyan)] active:scale-[0.98]"
                >
                  <Mail className="h-4 w-4" />
                  Ask Sales
                </a>
              </div>
            </aside>
          </section>

          <section className="mt-12">
            <div className="bg-white">
              <h2 className="text-2xl font-bold brand-title">Product Information</h2>
              {product.description ? (
                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-black/70 sm:text-base">
                  <RichText text={product.description} />
                </p>
              ) : (
                <p className="mt-4 text-sm leading-7 text-black/55">
                  Description is not available yet. Contact sales for condition, availability, and export details.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>

      <DealerFeaturedProductsSection
        title="More Products"
        kicker="Featured Products"
        description="Related products available to approved accounts."
        categorySlug={product.category?.slug}
        excludeId={product.id}
      />

      {lightbox && currentImg ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            onClick={() => setLightbox(false)}
            className="absolute right-4 top-4 text-sm font-semibold text-black/50 transition hover:text-[var(--brand-cyan)]"
          >
            ESC to close
          </button>
          <div onClick={(event) => event.stopPropagation()}>
            <HeicImage
              src={currentImg.url}
              alt={product.name}
              className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
