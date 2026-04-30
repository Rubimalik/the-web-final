import { NextRequest, NextResponse } from "next/server";
import { deleteProductImages } from "@/lib/supabase-storage";
import { createProduct, listProducts } from "@/lib/catalog-store";
import { safeReadRequestJson } from "@/lib/safe-json";
import { z } from "zod";
import { getAuthenticatedProfile } from "@/lib/auth/getAuthenticatedProfile";

const createProductSchema = z.object({
  name:        z.string().min(3),
  description: z.string().optional(),
  url:         z.string().url().optional().or(z.literal("")),
  price:       z.coerce.number().min(0).optional().nullable(),
  status:      z.enum(["draft", "active", "archived"]).default("draft"),
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
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "12"));
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;
    const categoryIdParam = searchParams.get("categoryId");
    const slug = searchParams.get("slug") || undefined;
    const categoryId = categoryIdParam ? parseInt(categoryIdParam) : undefined;

    const { data: products, total } = await listProducts({
      page,
      limit,
      status,
      search,
      categoryId: Number.isNaN(categoryId) ? undefined : categoryId,
      slug,
    });

    return NextResponse.json({
      data: products,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("[GET /api/product]", err);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await getAuthenticatedProfile();
  if (auth.status !== "authenticated" || auth.role !== "admin" || !auth.onboarding_completed) {
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

    const { name, description, url, price, status, tags, categoryId, images } = parsed.data;
    uploadedKeysToCleanup = images.map((image) => image.key);

    const product = await createProduct({
      name,
      description: description || null,
      url: url || null,
      price: price ?? null,
      status,
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
