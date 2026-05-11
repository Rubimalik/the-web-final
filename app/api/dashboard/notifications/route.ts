import { NextResponse } from "next/server";
import { getDashboardNotificationSummary } from "@/lib/catalog-store";
import { getAuthenticatedProfile } from "@/lib/auth/getAuthenticatedProfile";
import { isApprovedAdmin } from "@/lib/admin-auth";

type NotificationTone = "neutral" | "warning" | "accent";

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  tone: NotificationTone;
};

function formatProductLabel(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export async function GET() {
  const auth = await getAuthenticatedProfile({ sessionKind: "admin" });
  if (!isApprovedAdmin(auth)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const summary = await getDashboardNotificationSummary();
    const items: NotificationItem[] = [];

    if (summary.totalProducts === 0) {
      items.push({
        id: "empty-catalogue",
        title: "Your catalogue is empty",
        description: "Add the first product to start building the storefront.",
        href: "/admin/products/new",
        tone: "accent",
      });
    } else {
      if (summary.draftProducts > 0) {
        items.push({
          id: "draft-products",
          title: `${formatProductLabel(summary.draftProducts, "draft product", "draft products")} waiting for review`,
          description: "Open the draft list and publish or archive the items when they are ready.",
          href: "/admin/products/all-products?status=draft",
          tone: "accent",
        });
      }

      if (summary.uncategorizedCount > 0) {
        const firstProduct = summary.uncategorizedProducts[0];
        items.push({
          id: "uncategorized-products",
          title: `${formatProductLabel(summary.uncategorizedCount, "product is", "products are")} missing a category`,
          description: firstProduct
            ? `Start with "${firstProduct.name}" and assign a category so the catalogue stays organised.`
            : "Assign categories before publishing more products.",
          href: firstProduct
            ? `/admin/products/${firstProduct.id}`
            : "/admin/products/all-products",
          tone: "warning",
        });
      }

      if (summary.productsWithoutImagesCount > 0) {
        const firstProduct = summary.productsWithoutImages[0];
        items.push({
          id: "products-without-images",
          title: `${formatProductLabel(summary.productsWithoutImagesCount, "product has", "products have")} no images`,
          description: firstProduct
            ? `Upload images for "${firstProduct.name}" so the product card is ready for the storefront.`
            : "Add at least one image to the affected products.",
          href: firstProduct
            ? `/admin/products/${firstProduct.id}`
            : "/admin/products/all-products",
          tone: "warning",
        });
      }
    }

    return NextResponse.json({
      items,
      unreadCount: items.length,
    });
  } catch (error) {
    console.error("[GET /api/dashboard/notifications]", error);
    return NextResponse.json({ error: "Failed to load notifications" }, { status: 500 });
  }
}
