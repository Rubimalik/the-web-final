import { NextRequest, NextResponse } from "next/server";
import { listProducts } from "@/lib/catalog-store";
import { hasDealerAccess } from "@/lib/dealer-session";

export async function GET(req: NextRequest) {
  if (!(await hasDealerAccess())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Number.parseInt(searchParams.get("limit") || "12", 10));
    const search = searchParams.get("search") || undefined;
    const categoryIdParam = searchParams.get("categoryId");
    const slug = searchParams.get("slug") || undefined;
    const slugs = searchParams.get("slugs")?.split(",").map((value) => value.trim()).filter(Boolean);
    const consumableGroup = searchParams.get("consumableGroup") || undefined;
    const consumableBrand = searchParams.get("consumableBrand") || undefined;
    const consumableType = searchParams.get("consumableType") || undefined;
    const categoryId = categoryIdParam ? Number.parseInt(categoryIdParam, 10) : undefined;
    const featuredOnly = searchParams.get("featured") === "1";

    const { data: products, total } = await listProducts({
      page,
      limit,
      status: "active",
      isFeatured: featuredOnly ? true : undefined,
      search,
      categoryId: Number.isNaN(categoryId) ? undefined : categoryId,
      slug,
      slugs,
      consumableGroup,
      consumableBrand,
      consumableType,
      allowedVisibilities: ["dealer", "both"],
    });

    return NextResponse.json({
      data: products,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("[GET /api/dealer/product]", err);
    return NextResponse.json({ error: "Failed to fetch dealer products" }, { status: 500 });
  }
}
