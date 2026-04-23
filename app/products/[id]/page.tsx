import { Metadata } from "next";
import ProductDetailPage from "@/components/ProductDetailClient";
import { getProductImagePlaceholderUrl } from "@/lib/product-image-placeholder";

const BASE_URL = "https://buysupply.me";

// ── Fetch product server-side for metadata ────────────────────────────────
async function getProduct(id: string) {
  try {
    const res = await fetch(`${BASE_URL}/api/product/${id}`, {
      next: { revalidate: 3600 },
    });
    const data = await res.json();
    return data.data ?? null;
  } catch {
    return null;
  }
}

// ── Dynamic metadata per product ─────────────────────────────────────────
export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: "Product Not Found | BuySupply",
      description: "This product could not be found.",
    };
  }

  const primaryImg = product.images?.find((i: any) => i.isPrimary) ?? product.images?.[0];
  const fallbackImage = getProductImagePlaceholderUrl();
  const price = product.price != null ? `£${Number(product.price).toFixed(2)}` : "POA";
  const shortDesc = product.description
    ? product.description.slice(0, 160).replace(/\n/g, " ").trim()
    : `${product.name} available at BuySupply UK. ${price}.`;

  return {
    title: product.name,
    description: shortDesc,
    keywords: product.tags?.split(",").map((t: string) => t.trim()) ?? [],
    alternates: {
      canonical: `${BASE_URL}/products/${product.id}`,
    },
    openGraph: {
      title: `${product.name} | BuySupply`,
      description: shortDesc,
      url: `${BASE_URL}/products/${product.id}`,
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

// ── JSON-LD Product Schema ────────────────────────────────────────────────
function ProductSchema({ product }: { product: any }) {
  const primaryImg = product.images?.find((i: any) => i.isPrimary) ?? product.images?.[0];

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? product.name,
    image: product.images?.length
      ? product.images.map((i: any) => i.url)
      : [getProductImagePlaceholderUrl()],
    sku: String(product.id),
    brand: {
      "@type": "Brand",
      name: "BuySupply",
    },
    offers: {
      "@type": "Offer",
      url: `${BASE_URL}/products/${product.id}`,
      priceCurrency: "GBP",
      price: product.price ?? 0,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
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

// ── Page component ────────────────────────────────────────────────────────
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);

  return (
    <>
      {product && <ProductSchema product={product} />}
      <ProductDetailPage />
    </>
  );
}
