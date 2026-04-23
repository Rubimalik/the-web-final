import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/category — list all categories with product count
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    });
    return NextResponse.json({ data: categories });
  } catch (err) {
    console.error("[GET /api/category]", err);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

// POST /api/category — create category
export async function POST(req: NextRequest) {
  try {
    const { name, slug } = await req.json();

    if (!name || !slug)
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });

    const category = await prisma.category.create({ data: { name, slug } });
    return NextResponse.json({ data: category }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/category]", err);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}