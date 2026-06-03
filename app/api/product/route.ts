import { NextRequest, NextResponse } from "next/server";
import { deleteProductImages } from "@/lib/supabase-storage";
import { createProduct, listProducts, filterPublicProduct } from "@/lib/catalog-store";
import type { ProductListFilters } from "@/lib/catalog-store";
import { safeReadRequestJson } from "@/lib/safe-json";
import { z } from "zod";
import { getAuthenticatedProfile } from "@/lib/auth/getAuthenticatedProfile";
import { isApprovedAdmin } from "@/lib/admin-auth";

const createProductSchema = z.object({
  name:        z.string().min(3),
  description: z.string().optional(),
  url:         z.string().url().optional().or(z.literal("")),
  price:       z.coerce.number().min(0).optional().nullable(),
  dealerPrice: z.coerce.number().min(0).optional().nullable(),
  dealerNotes: z.string().optional().nullable(),
  visibility:  z.enum(["public", "dealer", "both"]).default("public"),
  status:      z.enum(["draft", "active", "archived"]).default("draft"),
  isFeatured:  z.boolean().optional().default(false),
  tags:        z.string().optional(),
  categoryId:  z.number().optional().nullable(),
  images: z.array(z.object({
    url:       z.string().url(),
    key:       z.string(),
    isPrimary: z.boolean().default(false),
  })).optional().default([]),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Number.parseInt(searchParams.get("limit") || "12", 10));
    const requestedStatus = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;
    const categoryIdParam = searchParams.get("categoryId");
    const slug = searchParams.get("slug") || undefined;
    const slugs = searchParams.get("slugs")?.split(",").map((value) => value.trim()).filter(Boolean);
    const consumableGroup = searchParams.get("consumableGroup") || undefined;
    const consumableBrand = searchParams.get("consumableBrand") || undefined;
    const consumableType = searchParams.get("consumableType") || undefined;
    const categoryId = categoryIdParam ? Number.parseInt(categoryIdParam, 10) : undefined;
    const forcePublicView = searchParams.get("public") === "1";
    const featuredOnly = searchParams.get("featured") === "1";
    const auth = forcePublicView
      ? null
      : await getAuthenticatedProfile({ sessionKind: "admin" });
    const isAdmin = auth ? isApprovedAdmin(auth) : false;

    const productFilters: ProductListFilters = {
      page,
      limit,
      status: isAdmin ? requestedStatus : "active",
      isFeatured: featuredOnly ? true : undefined,
      search,
      categoryId: Number.isNaN(categoryId) ? undefined : categoryId,
      slug,
      slugs,
      consumableGroup,
      consumableBrand,
      consumableType,
      allowedVisibilities: isAdmin ? undefined : ["public", "both"],
      excludeKonicaMinolta: !isAdmin,
    };

    let { data: products, total } = await listProducts(productFilters);

    if (featuredOnly && products.length === 0) {
      const fallbackResult = await listProducts({
        ...productFilters,
        isFeatured: undefined,
      });
      products = fallbackResult.data;
      total = fallbackResult.total;
    }

    const responseProducts = isAdmin ? products : products.map(filterPublicProduct);

    return NextResponse.json({
      data: responseProducts,
      products: responseProducts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("[GET /api/product]", err);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await getAuthenticatedProfile({ sessionKind: "admin" });
  if (!isApprovedAdmin(auth)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let uploadedKeysToCleanup: string[] = [];

  try {
    const body = await safeReadRequestJson(req, "POST /api/product");
    if (!body) {
      return NextResponse.json({ error: "Invalid or empty request body" }, { status: 400 });
    }
    const parsed = createProductSchema.safeParse(body);

    if (!parsed.success)
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });

    const { name, description, url, price, dealerPrice, dealerNotes, visibility, status, isFeatured, tags, categoryId, images } = parsed.data;
    uploadedKeysToCleanup = images.map((image) => image.key);

    const product = await createProduct({
      name,
      description: description || null,
      url: url || null,
      price: price ?? null,
      dealerPrice: dealerPrice ?? null,
      dealerNotes: dealerNotes ?? null,
      visibility,
      status,
      isFeatured,
      tags: tags || null,
      categoryId: categoryId ?? null,
      images,
    });

    return NextResponse.json({ data: product, message: "Product created successfully" }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/product]", err);

    try {
      await deleteProductImages(uploadedKeysToCleanup);
    } catch (cleanupErr) {
      console.error("[POST /api/product cleanup]", cleanupErr);
    }

    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
