import { NextResponse } from "next/server";
import { safeReadRequestJson } from "@/lib/safe-json";
import { getStripeServerClient, getBaseUrl } from "@/lib/stripe";
import { getCustomerAuth } from "@/lib/customer-auth";
import { attachStripeSessionToOrder, createOrder } from "@/lib/orders-store";
import { getProductById } from "@/lib/catalog-store";

type CheckoutItem = {
  productId?: number;
  id?: number;
  quantity?: number;
};

type CheckoutPayload = {
  items?: CheckoutItem[];
  orderId?: string;
};

type ValidatedCheckoutItem = {
  productId: number;
  name: string;
  quantity: number;
  unit_amount: number;
};

function toPence(price: number) {
  return Math.round(price * 100);
}

async function validateItems(
  items: CheckoutItem[] | undefined,
): Promise<{ data: ValidatedCheckoutItem[]; error?: never } | { error: string; data?: never }> {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return { error: "At least one item is required." };
  }

  const normalized: ValidatedCheckoutItem[] = [];

  for (const item of items) {
    const productId =
      typeof item.productId === "number"
        ? item.productId
        : typeof item.id === "number"
          ? item.id
          : Number.NaN;
    const quantity =
      typeof item.quantity === "number" && Number.isInteger(item.quantity)
        ? item.quantity
        : Number.NaN;

    if (!Number.isInteger(productId) || productId <= 0) {
      return { error: "Each item must include a valid product." };
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return { error: `Invalid quantity for product ${productId}.` };
    }

    const product = await getProductById(productId, {
      allowedVisibilities: ["public", "both"],
    });
    if (!product || product.status !== "active") {
      return { error: `Product ${productId} is not available for checkout.` };
    }
    if (typeof product.price !== "number" || product.price <= 0) {
      return { error: `${product.name} cannot be paid online yet.` };
    }

    normalized.push({
      productId: product.id,
      name: product.name,
      quantity,
      unit_amount: toPence(product.price),
    });
  }

  return { data: normalized };
}

export async function POST(req: Request) {
  try {
    const payload = await safeReadRequestJson<CheckoutPayload>(req, "POST /api/checkout");
    if (!payload) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const validated = await validateItems(payload.items);
    if (validated.error) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const auth = await getCustomerAuth();
    if (!auth?.user) {
      return NextResponse.json({ error: "Please sign in to checkout" }, { status: 401 });
    }
    const baseUrl = getBaseUrl();
    const stripe = getStripeServerClient();
    // Always create the Stripe-backed order server-side from the logged-in customer
    // and current database prices. Do not accept a client-supplied order id.
    let orderId = "";

    if (!orderId) {
      const createdOrder = await createOrder({
        userId: auth.user.id,
        customerEmail: auth.user?.email ?? null,
        customerName: auth.profile?.full_name ?? null,
        status: "pending",
        paymentStatus: "pending",
        paymentProvider: "stripe",
        paymentMethod: "card",
        source: "stripe",
        currency: "gbp",
        items: validated.data!.map((item) => ({
          productId: item.productId,
          productName: item.name,
          unitPrice: item.unit_amount / 100,
          quantity: item.quantity,
        })),
      });

      orderId = createdOrder?.id ?? "";
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: validated.data!.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: "gbp",
          unit_amount: item.unit_amount,
          product_data: {
            name: item.name!,
          },
        },
      })),
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cancel`,
      metadata: {
        orderId,
        userId: auth.user.id,
      },
      client_reference_id: orderId,
    });

    if (!session.url) {
      return NextResponse.json({ error: "Failed to create checkout session." }, { status: 500 });
    }

    if (orderId) {
      await attachStripeSessionToOrder(orderId, session.id);
    }

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error("[POST /api/checkout]", error);
    return NextResponse.json({ error: "Failed to create checkout session." }, { status: 500 });
  }
}
