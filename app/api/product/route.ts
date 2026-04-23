import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

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
    const page       = Math.max(1, parseInt(searchParams.get("page")  || "1"));
    const limit      = Math.min(100, parseInt(searchParams.get("limit") || "12"));
    const status     = searchParams.get("status") || "";
    const search     = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId") || "";
    const slug       = searchParams.get("slug") || "";

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (categoryId) where.categoryId = parseInt(categoryId);
    if (slug) where.category = { slug };
    if (search) {
      where.OR = [
        { name:        { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags:        { contains: search, mode: "insensitive" } },
      ];
    }

    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        include: {
          images:   { orderBy: { order: "asc" } },
          category: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

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
  try {
    const body   = await req.json();
    const parsed = createProductSchema.safeParse(body);

    if (!parsed.success)
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });

    const { name, description, url, price, status, tags, categoryId, images } = parsed.data;

    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        url:         url || null,
        price:       price ?? null,
        status,
        tags:        tags || null,
        categoryId:  categoryId ?? null,
        images: {
          create: images.map((img, i) => ({
            url: img.url, key: img.key, isPrimary: img.isPrimary ?? i === 0, order: i,
          })),
        },
      },
      include: {
        images:   { orderBy: { order: "asc" } },
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json({ data: product, message: "Product created successfully" }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/product]", err);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}