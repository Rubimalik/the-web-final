import { NextResponse } from "next/server";
import { getCustomerAuth } from "@/lib/customer-auth";
import { createOrder } from "@/lib/orders-store";
import { safeReadRequestJson } from "@/lib/safe-json";

type OrderPayloadItem = {
  productId?: number;
  id?: number;
  name?: string;
  productName?: string;
  price?: number | null;
  unitPrice?: number | null;
  quantity?: number;
};

type OrderPayload = {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  notes?: string;
  items?: OrderPayloadItem[];
};

function normalizeOrderItems(items: OrderPayloadItem[] | undefined) {
  if (!Array.isArray(items)) return [];

  return items.flatMap((item) => {
    const productName =
      typeof item.productName === "string"
        ? item.productName.trim()
        : typeof item.name === "string"
          ? item.name.trim()
          : "";
    const quantity =
      typeof item.quantity === "number" && Number.isFinite(item.quantity)
        ? Math.max(1, Math.floor(item.quantity))
        : 1;
    const unitPrice =
      typeof item.unitPrice === "number"
        ? item.unitPrice
        : typeof item.price === "number"
          ? item.price
          : null;

    if (!productName) return [];

    return [
      {
        productId:
          typeof item.productId === "number"
            ? item.productId
            : typeof item.id === "number"
              ? item.id
              : null,
        productName,
        unitPrice,
        quantity,
      },
    ];
  });
}

export async function POST(req: Request) {
  try {
    const payload = await safeReadRequestJson<OrderPayload>(req, "POST /api/order");
    if (!payload) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const items = normalizeOrderItems(payload.items);
    if (items.length === 0) {
      return NextResponse.json(
        { error: "At least one order item is required" },
        { status: 400 },
      );
    }

    const auth = await getCustomerAuth();
    if (!auth?.user) {
      return NextResponse.json({ error: "Please sign in to place an order" }, { status: 401 });
    }
    const order = await createOrder({
      userId: auth.user.id,
      customerName: payload.customerName?.trim() || auth.profile?.full_name || null,
      customerEmail: payload.customerEmail?.trim() || auth.user?.email || null,
      customerPhone: payload.customerPhone?.trim() || null,
      notes: payload.notes?.trim() || null,
      status: "pending",
      paymentStatus: "unpaid",
      source: "checkout",
      items,
    });

    return NextResponse.json({ data: order }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/order]", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
