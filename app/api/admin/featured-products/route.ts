import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isApprovedAdmin } from "@/lib/admin-auth";
import { getAuthenticatedProfile } from "@/lib/auth/getAuthenticatedProfile";
import { listProducts, updateProductFeaturedStatus } from "@/lib/catalog-store";
import { safeReadRequestJson } from "@/lib/safe-json";

const updateFeaturedSchema = z.object({
  productId: z.number().int().positive(),
  isFeatured: z.boolean(),
  featuredOrder: z.number().int().min(0).nullable().optional(),
});

export async function GET(req: NextRequest) {
  const auth = await getAuthenticatedProfile({ sessionKind: "admin" });
  if (!isApprovedAdmin(auth)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Number.parseInt(searchParams.get("limit") || "24", 10));
    const search = searchParams.get("search") || undefined;
    const featuredParam = searchParams.get("featured");

    const { data, total } = await listProducts({
      page,
      limit,
      search,
      isFeatured:
        featuredParam === "1" ? true : featuredParam === "0" ? false : undefined,
    });

    return NextResponse.json({
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("[GET /api/admin/featured-products]", error);
    return NextResponse.json({ error: "Failed to load featured products" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = await getAuthenticatedProfile({ sessionKind: "admin" });
  if (!isApprovedAdmin(auth)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await safeReadRequestJson(req, "PUT /api/admin/featured-products");
    const parsed = updateFeaturedSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const product = await updateProductFeaturedStatus(parsed.data.productId, {
      isFeatured: parsed.data.isFeatured,
      featuredOrder: parsed.data.featuredOrder,
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ data: product });
  } catch (error) {
    console.error("[PUT /api/admin/featured-products]", error);
    return NextResponse.json({ error: "Failed to update featured product" }, { status: 500 });
  }
}
