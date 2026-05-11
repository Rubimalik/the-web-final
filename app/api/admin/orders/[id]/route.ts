import { NextRequest, NextResponse } from "next/server";
import { getApprovedAdmin, unauthorizedAdminResponse } from "@/lib/admin-auth";
import { safeReadRequestJson } from "@/lib/safe-json";
import {
  updateOrder,
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/orders-store";

const ORDER_STATUSES = new Set(["pending", "confirmed", "paid", "fulfilled", "cancelled"]);
const PAYMENT_STATUSES = new Set(["unpaid", "pending", "paid", "failed", "refunded"]);

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getApprovedAdmin();
  if (!auth) return unauthorizedAdminResponse();

  try {
    const { id } = await params;
    const payload = await safeReadRequestJson<{
      status?: string;
      paymentStatus?: string;
      adminNotes?: string | null;
    }>(req, "PATCH /api/admin/orders/:id");

    if (!payload) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const status =
      typeof payload.status === "string" && ORDER_STATUSES.has(payload.status)
        ? (payload.status as OrderStatus)
        : undefined;
    const paymentStatus =
      typeof payload.paymentStatus === "string" &&
      PAYMENT_STATUSES.has(payload.paymentStatus)
        ? (payload.paymentStatus as PaymentStatus)
        : undefined;
    const adminNotes =
      payload.adminNotes === undefined
        ? undefined
        : typeof payload.adminNotes === "string"
          ? payload.adminNotes
          : null;

    if (!status && !paymentStatus && adminNotes === undefined) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const order = await updateOrder(id, {
      status,
      paymentStatus,
      adminNotes,
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ data: order });
  } catch (error) {
    console.error("[PATCH /api/admin/orders/:id]", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
