import { NextRequest, NextResponse } from "next/server";
import { getApprovedAdmin, unauthorizedAdminResponse } from "@/lib/admin-auth";
import { listOrders } from "@/lib/orders-store";

export async function GET(req: NextRequest) {
  const auth = await getApprovedAdmin();
  if (!auth) return unauthorizedAdminResponse();

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Number.parseInt(searchParams.get("limit") || "20", 10));
    const status = searchParams.get("status") || undefined;
    const paymentStatus = searchParams.get("paymentStatus") || undefined;
    const search = searchParams.get("search") || undefined;

    const result = await listOrders({
      page,
      limit,
      status,
      paymentStatus,
      search,
    });

    return NextResponse.json({
      data: result.data,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  } catch (error) {
    console.error("[GET /api/admin/orders]", error);
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500 });
  }
}
