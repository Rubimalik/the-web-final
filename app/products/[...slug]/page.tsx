import { Metadata } from "next";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import ProductDetailPage from "@/components/ProductDetailClient";
import {
  filterPublicProduct,
  getProductById,
  getProductBySlug,
  type PublicProductRecord,
} from "@/lib/catalog-store";
import { getProductImagePlaceholderUrl } from "@/lib/product-image-placeholder";
import {
  PARTS_AND_TONERS_SLUG,
  getPartsBrandBySlug,
  getPartsTypeBySlug,
  getProductHref,
  isKonicaMinoltaProduct,
} from "@/lib/product-taxonomy";

const BASE_URL = "https://buysupply.me";
const PRICE_VALID_UNTIL = "2026-12-31";

export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const revalidate = 0;
export const runtime = "nodejs";

function isNumericProductParam(value: string) {
  return /^\d+$/.test(value);
}

function getProductSlugParam(slug: string[]) {
  return slug.filter(Boolean).at(-1) ?? "";
}

function getCategoryRedirect(slug: string[]) {
  if (slug[0] !== PARTS_AND_TONERS_SLUG) return "";

  if (slug.length === 1) return "/consumables";

  const brand = getPartsBrandBySlug(slug[1]);
  if (slug.length === 2 && brand) return `/consumables/${brand.slug}`;

  const type = getPartsTypeBySlug(slug[2]);
  if (slug.length === 3 && brand && type) return `/consumables/${brand.slug}/${type.slug}`;

  return "";
}

const getPublicProduct = cache(async (slug: string): Promise<PublicProductRecord | null> => {
  const product = isNumericProductParam(slug)
    ? await getProductById(Number.parseInt(slug, 10), {
        allowedVisibilities: ["public", "both"],
        excludeKonicaMinolta: true,
      })
    : await getProductBySlug(slug, {
        allowedVisibilities: ["public", "both"],
        status: "active",
        excludeKonicaMinolta: true,
      });

  if (!product || product.status !== "active" || isKonicaMinoltaProduct(product)) return null;
  return filterPublicProduct(product);
});

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string[] }> },
): Promise<Metadata> {
  const { slug } = await params;
  const productSlug = getProductSlugParam(slug);
  const product = productSlug ? await getPublicProduct(productSlug) : null;

  if (!product) {
    return {
      title: "Product Not Found | BuySupply",
      description: "This product could not be found.",
    };
  }

  const productHref = getProductHref(product);
  const primaryImg = product.images?.find((image) => image.isPrimary) ?? product.images?.[0];
  const fallbackImage = getProductImagePlaceholderUrl();
  const price = product.price != null ? `\u00a3${Number(product.price).toFixed(2)}` : "POA";
  const shortDesc = product.description
    ? product.description.slice(0, 160).replace(/\n/g, " ").trim()
    : `${product.name} available at BuySupply UK. ${price}.`;

  return {
    title: product.name,
    description: shortDesc,
    keywords: product.tags?.split(",").map((tag) => tag.trim()) ?? [],
    alternates: {
      canonical: `${BASE_URL}${productHref}`,
    },
    openGraph: {
      title: `${product.name} | BuySupply`,
      description: shortDesc,
      url: `${BASE_URL}${productHref}`,
      siteName: "BuySupply",
      type: "website",
      images: primaryImg
        ? [{ url: primaryImg.url, width: 800, height: 600, alt: product.name }]
        : [{ url: fallbackImage, width: 1200, height: 630, alt: "BuySupply" }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | BuySupply`,
      description: shortDesc,
      images: primaryImg ? [primaryImg.url] : [fallbackImage],
    },
  };
}

function ProductSchema({ product }: { product: PublicProductRecord }) {
  const productHref = getProductHref(product);
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? product.name,
    image: product.images?.length
      ? product.images.map((image) => image.url)
      : [getProductImagePlaceholderUrl()],
    sku: String(product.id),
    brand: {
      "@type": "Brand",
      name: "BuySupply",
    },
    offers: {
      "@type": "Offer",
      url: `${BASE_URL}${productHref}`,
      priceCurrency: "GBP",
      price: product.price ?? 0,
      priceValidUntil: PRICE_VALID_UNTIL,
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "BuySupply",
        url: BASE_URL,
        telephone: "01753971125",
        email: "sales@buysupply.me",
      },
    },
    category: product.category?.name ?? "Photocopiers",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default async function Page({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const categoryRedirect = getCategoryRedirect(slug);

  if (categoryRedirect) {
    redirect(categoryRedirect);
  }

  const productSlug = getProductSlugParam(slug);
  const product = productSlug ? await getPublicProduct(productSlug) : null;

  if (!product) {
    notFound();
  }

  const canonicalHref = getProductHref(product);
  const currentHref = `/products/${slug.join("/")}`;

  if (currentHref !== canonicalHref) {
    redirect(canonicalHref);
  }

  return (
    <>
      {product ? <ProductSchema product={product} /> : null}
      <ProductDetailPage productId={product.slug} initialProduct={product} />
    </>
  );
}
