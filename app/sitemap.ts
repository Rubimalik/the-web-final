import { MetadataRoute } from "next";

const BASE_URL = "https://buysupply.me";

async function getAllProducts() {
  try {
    const res = await fetch(`${BASE_URL}/api/product?status=active&limit=1000&page=1`, {
      next: { revalidate: 3600 }, // re-fetch every hour
    });
    const data = await res.json();
    return data.data ?? [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getAllProducts();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/products?category=photocopiers`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/products?category=consumables`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  // Dynamic product pages
  const productPages: MetadataRoute.Sitemap = products.map((product: any) => ({
    url: `${BASE_URL}/products/${product.id}`,
    lastModified: new Date(product.updatedAt ?? product.createdAt),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...productPages];
}