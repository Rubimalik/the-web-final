import { Metadata } from "next";
import { redirect } from "next/navigation";
import ProductDetailPage from "@/components/ProductDetailClient";
import {
  filterPublicProduct,
  getProductById,
  getProductBySlug,
  type PublicProductRecord,
} from "@/lib/catalog-store";
import { getProductImagePlaceholderUrl } from "@/lib/product-image-placeholder";
import { getProductHref } from "@/lib/product-taxonomy";

const BASE_URL = "https://buysupply.me";
const PRICE_VALID_UNTIL = "2026-12-31";

function isNumericProductParam(value: string) {
  return /^\d+$/.test(value);
}

async function getPublicProduct(slug: string): Promise<PublicProductRecord | null> {
  const product = isNumericProductParam(slug)
    ? await getProductById(Number.parseInt(slug, 10), {
        allowedVisibilities: ["public", "both"],
      })
    : await getProductBySlug(slug, {
        allowedVisibilities: ["public", "both"],
        status: "active",
      });

  if (!product || product.status !== "active") return null;
  return filterPublicProduct(product);
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublicProduct(slug);

  if (!product) {
    return {
      title: "Product Not Found | BuySupply",
      description: "This product could not be found.",
    };
  }

  const productHref = getProductHref(product);
  const primaryImg = product.images?.find((image) => image.isPrimary) ?? product.images?.[0];
  const fallbackImage = getProductImagePlaceholderUrl();
  const price = product.price != null ? `£${Number(product.price).toFixed(2)}` : "POA";
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

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getPublicProduct(slug);

  if (product && slug !== product.slug) {
    redirect(getProductHref(product));
  }

  return (
    <>
      {product ? <ProductSchema product={product} /> : null}
      <ProductDetailPage productId={slug} />
    </>
  );
}
