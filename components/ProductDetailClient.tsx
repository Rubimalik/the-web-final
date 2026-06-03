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
  Minus,
  PhoneCall,
  Plus,
  ShoppingCart,
} from "lucide-react";
import { HeicImage } from "@/components/HeicImage";
import NavBar from "@/components/Navbar";
import FeaturedProductsSection from "@/components/FeaturedProductsSection";
import { getProductImagePlaceholderUrl } from "@/lib/product-image-placeholder";
import { safeReadJsonResponse } from "@/lib/safe-json";
import { useCart } from "@/components/CartProvider";
import {
  getProductCategoryBreadcrumbs,
} from "@/lib/product-taxonomy";

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

interface Product {
  id: number;
  slug?: string | null;
  name: string;
  description: string | null;
  url: string | null;
  price: number | null;
  tags: string | null;
  status: string;
  createdAt: string | Date;
  images?: ProductImage[] | null;
  category: Category | null;
}

const PLACEHOLDER_IMAGE: ProductImage = {
  id: 0,
  url: getProductImagePlaceholderUrl(),
  isPrimary: true,
};

function formatPrice(value: number | null | undefined) {
  return typeof value === "number" ? `\u00a3${value.toFixed(2)}` : "Price on application";
}

function normalizeProduct(product: Product): Product {
  return {
    ...product,
    name: product.name || "Product",
    description: product.description ?? null,
    url: product.url ?? null,
    price: typeof product.price === "number" ? product.price : null,
    tags: product.tags ?? null,
    images: Array.isArray(product.images) ? product.images : [],
    category: product.category ?? null,
  };
}

function RichText({ text }: { text: string }) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return (
    <>
      {parts.map((part, index) =>
        /^https?:\/\/[^\s]+$/.test(part) ? (
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

export default function ProductDetailPage({
  productId,
  initialProduct,
}: {
  productId?: string;
  initialProduct?: Product | null;
  breadcrumbContext?: { brandSlug: string; typeSlug: string };
} = {}) {
  const params = useParams<{ id?: string | string[]; slug?: string | string[] }>();
  const routeParam = params.slug ?? params.id;
  const routeId = Array.isArray(routeParam) ? routeParam.filter(Boolean).at(-1) : routeParam;
  const id = productId ?? routeId;
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(
    initialProduct ? normalizeProduct(initialProduct) : null,
  );
  const [loading, setLoading] = useState(!initialProduct);
  const [error, setError] = useState("");
  const [activeImg, setActiveImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [lightbox, setLightbox] = useState(false);
  const thumbnailRailRef = useRef<HTMLDivElement | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    if (initialProduct) {
      setProduct(normalizeProduct(initialProduct));
      setLoading(false);
      setError("");
      setActiveImg(0);
      return;
    }

    void (async () => {
      try {
        setLoading(true);
        setError("");
        if (!id) throw new Error("Product not found");
        const response = await fetch(`/api/product/${encodeURIComponent(id)}?public=1`);
        const data = await safeReadJsonResponse<{ data?: Product; error?: string }>(
          response,
          "ProductDetailClient load product",
        );
        if (!response.ok || !data?.data) {
          throw new Error(data?.error || "Product not found");
        }
        setProduct(normalizeProduct(data.data));
        setActiveImg(0);
      } catch (err) {
        setProduct(null);
        setError(err instanceof Error ? err.message : "Failed to load product");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, initialProduct]);

  useEffect(() => {
    if (!lightbox || !product) return;
    const images = product.images && product.images.length > 0 ? product.images : [PLACEHOLDER_IMAGE];
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
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-black/30" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-4 text-center">
        <p className="text-black/55">{error || "Product not found"}</p>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-black/70 underline transition hover:text-[var(--brand-cyan)]"
        >
          Go back
        </button>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [PLACEHOLDER_IMAGE];
  const currentImg = images[activeImg];
  const breadcrumbs = getProductCategoryBreadcrumbs(product);

  function showPreviousImage() {
    setActiveImg((current) => (current - 1 + images.length) % images.length);
    thumbnailRailRef.current?.scrollBy({ left: -96, behavior: "smooth" });
  }

  function showNextImage() {
    setActiveImg((current) => (current + 1) % images.length);
    thumbnailRailRef.current?.scrollBy({ left: 96, behavior: "smooth" });
  }

  function handleAddToCart() {
    if (!product) return;
    for (let index = 0; index < quantity; index += 1) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: images[0]?.url,
      });
    }
  }

  return (
    <div className="min-h-screen bg-white text-black font-myriad">
      <NavBar />

      <main className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
          <nav className="mb-8 flex min-w-0 flex-wrap items-center gap-2 text-sm text-black/55">
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <span key={`${crumb.href}-${index}`} className="flex min-w-0 items-center gap-2">
                  {index > 0 ? <span className="shrink-0">/</span> : null}
                  {isLast ? (
                    <span className="min-w-0 max-w-full truncate text-black/80 sm:max-w-[34rem]">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link href={crumb.href} className="shrink-0 hover:text-[var(--brand-cyan)]">
                      {crumb.label}
                    </Link>
                  )}
                </span>
              );
            })}
          </nav>
          <section className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(380px,0.92fr)] lg:gap-10">
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
                <p className="text-sm font-semibold text-black/50">Price</p>
                <p className="text-3xl font-bold text-black">{formatPrice(product.price)}</p>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <div className="flex items-center justify-between rounded-2xl border border-black/10 bg-white p-2">
                  <span className="pl-3 text-sm font-bold text-black/60">Quantity</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 transition hover:border-[var(--brand-cyan)]"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(event) => {
                        const parsed = Number.parseInt(event.target.value, 10);
                        setQuantity(Number.isFinite(parsed) ? Math.max(1, parsed) : 1);
                      }}
                      className="h-10 w-14 rounded-xl border border-black/10 text-center text-sm font-bold focus:border-[var(--brand-cyan)] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity((current) => current + 1)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 transition hover:border-[var(--brand-cyan)]"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex w-full items-center justify-center gap-2 rounded-xl brand-button py-3.5 text-sm font-bold transition active:scale-[0.98]"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </button>
                <a
                  href={`mailto:sales@buysupply.me?subject=Enquiry: ${encodeURIComponent(product.name)}&body=Hi, I'm interested in the ${encodeURIComponent(product.name)} (ID: ${product.id}). Please can you provide more information.`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-black/20 bg-white py-3 text-sm font-bold text-black transition hover:border-[var(--brand-cyan)] hover:text-[var(--brand-cyan)] active:scale-[0.98]"
                >
                  <Mail className="h-4 w-4" />
                  Enquire by Email
                </a>
                <a
                  href="tel:01753971125"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-black/20 bg-white py-3 text-sm font-semibold text-black transition hover:border-[var(--brand-cyan)] active:scale-[0.98]"
                >
                  <PhoneCall className="h-4 w-4" />
                  Call 01753 971125
                </a>
              </div>
            </aside>
          </section>

          <section className="mt-12">
            <div className="bg-white">
              <h2 className="text-2xl font-bold brand-title">Product Details</h2>
              {product.description ? (
                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-black/70 sm:text-base">
                  <RichText text={product.description} />
                </p>
              ) : (
                <p className="mt-4 text-sm leading-7 text-black/55">
                  Detailed information is being prepared. Contact our sales team for full availability and condition notes.
                </p>
              )}
            </div>
          </section>
        </div>
      </main>

      <FeaturedProductsSection
        title="You may also like"
        kicker="Featured Products"
        description="Related active products from the same category where available."
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
            <HeicImage src={currentImg.url} alt={product.name} className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
