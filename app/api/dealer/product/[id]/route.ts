import { NextRequest, NextResponse } from "next/server";
import { getProductById } from "@/lib/catalog-store";
import { hasDealerAccess } from "@/lib/dealer-session";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await hasDealerAccess())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const productId = Number.parseInt(id, 10);
    if (isNaN(productId))
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const product = await getProductById(productId, {
      allowedVisibilities: ["dealer", "both"],
    });

    if (!product || product.status !== "active") {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ data: product });
  } catch (err) {
    console.error("[GET /api/dealer/product/:id]", err);
    return NextResponse.json({ error: "Failed to fetch dealer product" }, { status: 500 });
  }
}
