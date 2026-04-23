import { NextRequest, NextResponse } from "next/server";
import { createCategory, listCategories } from "@/lib/catalog-store";
import { requireAdminSession } from "@/lib/session";

// GET /api/category — list all categories with product count
export async function GET() {
  try {
    const categories = await listCategories();
    return NextResponse.json({ data: categories });
  } catch (err) {
    console.error("[GET /api/category]", err);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

// POST /api/category — create category
export async function POST(req: NextRequest) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, slug } = await req.json();

    if (!name || !slug)
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });

    const category = await createCategory(name, slug);
    return NextResponse.json({ data: category }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/category]", err);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
