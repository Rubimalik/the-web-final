"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, PhoneCall, Mail, ImageOff, Loader2, Calendar, ExternalLink } from "lucide-react";
import { HeicImage } from "@/components/HeicImage";
import NavBar from "@/components/Navbar";
import { getProductImagePlaceholderUrl } from "@/lib/product-image-placeholder";
import { safeReadJsonResponse } from "@/lib/safe-json";

interface ProductImage { id: number; url: string; isPrimary: boolean; }
interface Category { id: number; name: string; slug: string; }
interface Product {
  id: number; name: string; description: string | null;
  url: string | null; price: number | null; tags: string | null; status: string;
  createdAt: string; images: ProductImage[];
  category: Category | null;
}

const PLACEHOLDER_IMAGE: ProductImage = {
  id: 0,
  url: getProductImagePlaceholderUrl(),
  isPrimary: true,
};

function RichText({ text }: { text: string }) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return (
    <>
      {parts.map((part, i) =>
        urlRegex.test(part) ? (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 break-all transition-colors">
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImg, setActiveImg] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch(`/api/product/${id}`);
        const data = await safeReadJsonResponse<{ data?: Product; error?: string }>(
          response,
          "ProductDetailClient load product"
        );
        if (!response.ok) {
          throw new Error(data?.error || "Failed to load product");
        }
        if (!data?.data) {
          throw new Error("Product not found");
        }
        setProduct(data.data);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to load product");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Keyboard nav for lightbox
  useEffect(() => {
    if (!lightbox || !product) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setActiveImg((i) => (i + 1) % product.images.length);
      if (e.key === "ArrowLeft") setActiveImg((i) => (i - 1 + product.images.length) % product.images.length);
      if (e.key === "Escape") setLightbox(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, product]);

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0d] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
    </div>
  );

  if (error || !product) return (
    <div className="min-h-screen bg-[#0a0a0d] flex flex-col items-center justify-center gap-4">
      <p className="text-white/40">{error || "Product not found"}</p>
      <button onClick={() => router.back()} className="text-sm text-white/60 hover:text-white underline">← Go back</button>
    </div>
  );

  const images = product.images.length > 0 ? product.images : [PLACEHOLDER_IMAGE];
  const currentImg = images[activeImg];

  return (
    <div className="min-h-screen bg-[#0a0a0d] text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <NavBar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

          {/* ── Image gallery ── */}
          <div className="space-y-3">
            {/* Main image */}
            <div
              className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#111115] border border-white/[0.06] cursor-zoom-in"
              onClick={() => images.length > 0 && setLightbox(true)}
            >
              {currentImg ? (
                <HeicImage
                  src={currentImg.url}
                  alt={product.name}
                  className="w-full h-full object-contain"
                  loading="eager"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageOff className="w-12 h-12 text-white/10" />
                </div>
              )}

              {/* Nav arrows on main image */}
              {images.length > 1 && (
                <>
                  <button onClick={(e) => { e.stopPropagation(); setActiveImg((i) => (i - 1 + images.length) % images.length); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-black/70 transition-all">
                    <ChevronLeft className="w-4 h-4 text-white" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setActiveImg((i) => (i + 1) % images.length); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-black/70 transition-all">
                    <ChevronRight className="w-4 h-4 text-white" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white/60 text-xs px-2.5 py-1 rounded-full border border-white/10">
                    {activeImg + 1} / {images.length}
                  </div>
                </>
              )}

              {product.images.length > 0 && (
                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white/50 text-[10px] px-2 py-1 rounded-lg border border-white/10">
                  Click to expand
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button key={img.id} onClick={() => setActiveImg(i)}
                    className={`relative shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === activeImg ? "border-white/60" : "border-transparent hover:border-white/20"
                      }`}>
                    <HeicImage src={img.url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product info ── */}
          <div className="flex flex-col gap-6">

            {/* Category badge */}
            {product.category && (
              <div className="inline-flex">
                <span className="text-xs font-medium text-white/50 bg-white/[0.06] border border-white/[0.08] px-3 py-1 rounded-full">
                  {product.category.name}
                </span>
              </div>
            )}

            {/* Name + price */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">{product.name}</h1>
              <div className="mt-3">
                {product.price != null ? (
                  <span className="text-3xl font-bold text-white">£{Number(product.price).toFixed(2)}</span>
                ) : (
                  <span className="text-xl font-semibold text-white/50">Price on application</span>
                )}
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-5">
                <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Description</h3>
                <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap"><RichText text={product.description} /></p>
              </div>
            )}

            {/* Product URL */}
            {product.url && (
              <a href={product.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-5 py-3.5 bg-white/[0.03] border border-white/[0.05] rounded-2xl hover:bg-white/[0.06] transition-colors group">
                <ExternalLink className="w-4 h-4 text-indigo-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Product Link</p>
                  <p className="text-sm text-indigo-400 group-hover:text-indigo-300 truncate transition-colors">{product.url}</p>
                </div>
              </a>
            )}
            {/* Meta */}
            <div className="flex items-center gap-1.5 text-xs text-white/25">
              <Calendar className="w-3.5 h-3.5" />
              Listed {new Date(product.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </div>

            {/* CTA */}
            <div className="space-y-3 pt-2">
              <a href={`mailto:sales@buysupply.me?subject=Enquiry: ${encodeURIComponent(product.name)}&body=Hi, I'm interested in the ${encodeURIComponent(product.name)} (ID: ${product.id}). Please can you provide more information.`}
                className="flex items-center justify-center gap-2 w-full py-3 bg-white text-black text-sm font-semibold rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all">
                <Mail className="w-4 h-4" />
                Enquire by Email
              </a>
              <a href="tel:01753971125"
                className="flex items-center justify-center gap-2 w-full py-3 bg-white/[0.06] border border-white/[0.08] text-white text-sm font-medium rounded-xl hover:bg-white/10 active:scale-[0.98] transition-all">
                <PhoneCall className="w-4 h-4" />
                Call 01753971125
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Lightbox ── */}
      {lightbox && currentImg && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}>
          <button onClick={() => setLightbox(false)}
            className="absolute top-4 right-4 text-white/40 hover:text-white text-sm transition-colors">
            ESC to close
          </button>

          {images.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); setActiveImg((i) => (i - 1 + images.length) % images.length); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all">
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); setActiveImg((i) => (i + 1) % images.length); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all">
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </>
          )}

          <div onClick={(e) => e.stopPropagation()}>
            <HeicImage src={currentImg.url} alt={product.name}
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl" />
          </div>

          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button key={i} onClick={(e) => { e.stopPropagation(); setActiveImg(i); }}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeImg ? "bg-white w-4" : "bg-white/30"}`} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
