import { NextRequest, NextResponse } from "next/server";
import { getProductById } from "@/lib/catalog-store";
import { getApprovedDealerAuth } from "@/lib/dealer-session";
import { createOrder, listDealerOrders } from "@/lib/orders-store";
import { safeReadRequestJson } from "@/lib/safe-json";

type DealerOrderPayloadItem = {
  productId?: number;
  id?: number;
  quantity?: number;
};

type DealerOrderPayload = {
  notes?: string;
  items?: DealerOrderPayloadItem[];
};

function normalizeRequestedItems(items: DealerOrderPayloadItem[] | undefined) {
  if (!Array.isArray(items)) return [];

  const byProductId = new Map<number, number>();
  for (const item of items) {
    const productId =
      typeof item.productId === "number"
        ? item.productId
        : typeof item.id === "number"
          ? item.id
          : null;
    if (!productId || !Number.isInteger(productId) || productId <= 0) continue;

    const quantity =
      typeof item.quantity === "number" && Number.isFinite(item.quantity)
        ? Math.max(1, Math.floor(item.quantity))
        : 1;

    byProductId.set(productId, (byProductId.get(productId) ?? 0) + quantity);
  }

  return Array.from(byProductId.entries()).map(([productId, quantity]) => ({
    productId,
    quantity,
  }));
}

export async function GET(req: NextRequest) {
  const auth = await getApprovedDealerAuth();
  if (!auth?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(50, Math.max(1, Number.parseInt(searchParams.get("limit") || "20", 10)));
  const status = searchParams.get("status") || undefined;

  try {
    const result = await listDealerOrders(auth.user.id, { page, limit, status });

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
    console.error("[GET /api/dealer/orders]", error);
    return NextResponse.json({ error: "Failed to load dealer orders" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await getApprovedDealerAuth();
  if (!auth?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = await safeReadRequestJson<DealerOrderPayload>(
      req,
      "POST /api/dealer/orders",
    );
    if (!payload) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const requestedItems = normalizeRequestedItems(payload.items);
    if (requestedItems.length === 0) {
      return NextResponse.json(
        { error: "At least one dealer order item is required" },
        { status: 400 },
      );
    }

    const orderItems = [];
    for (const item of requestedItems) {
      const product = await getProductById(item.productId, {
        allowedVisibilities: ["dealer", "both"],
      });

      if (!product || product.status !== "active") {
        return NextResponse.json(
          { error: `Dealer product ${item.productId} is not available` },
          { status: 400 },
        );
      }

      orderItems.push({
        productId: product.id,
        productName: product.name,
        unitPrice: product.dealerPrice ?? product.price,
        quantity: item.quantity,
        metadata: {
          retailPrice: product.price,
          dealerPrice: product.dealerPrice,
          visibility: product.visibility,
          orderType: "dealer_wholesale",
        },
      });
    }

    const order = await createOrder({
      userId: auth.user.id,
      customerName:
        auth.profile?.company_name ||
        auth.profile?.full_name ||
        auth.user.email ||
        null,
      customerEmail: auth.user.email ?? null,
      notes: payload.notes?.trim() || null,
      status: "confirmed",
      paymentStatus: "unpaid",
      source: "dealer",
      metadata: {
        orderType: "dealer_wholesale",
        dealerStatus: auth.profile?.dealer_status ?? null,
      },
      items: orderItems,
    });

    return NextResponse.json({ data: order }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/dealer/orders]", error);
    return NextResponse.json({ error: "Failed to create dealer order" }, { status: 500 });
  }
}
