import { NextResponse } from "next/server";
import { safeReadRequestJson } from "@/lib/safe-json";
import { getStripeServerClient, getBaseUrl } from "@/lib/stripe";
import { getAuthenticatedProfile } from "@/lib/auth/getAuthenticatedProfile";

type CheckoutItem = {
  name?: string;
  price?: number;
  quantity?: number;
};

type CheckoutPayload = {
  items?: CheckoutItem[];
  orderId?: string;
};

function toPence(price: number) {
  return Math.round(price * 100);
}

function validateItems(items: CheckoutItem[] | undefined) {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return { error: "At least one item is required." };
  }

  const normalized = items.map((item) => {
    const name = typeof item.name === "string" ? item.name.trim() : "";
    const price = typeof item.price === "number" ? item.price : Number.NaN;
    const quantity =
      typeof item.quantity === "number" && Number.isInteger(item.quantity)
        ? item.quantity
        : Number.NaN;

    if (!name) return { error: "Each item must include a valid name." } as const;
    if (!Number.isFinite(price) || price <= 0) {
      return { error: `Invalid price for "${name}".` } as const;
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return { error: `Invalid quantity for "${name}".` } as const;
    }

    return {
      name,
      quantity,
      unit_amount: toPence(price),
    } as const;
  });

  const invalid = normalized.find((item) => "error" in item);
  if (invalid && "error" in invalid) return { error: invalid.error };

  return { data: normalized };
}

export async function POST(req: Request) {
  try {
    const payload = await safeReadRequestJson<CheckoutPayload>(req, "POST /api/checkout");
    if (!payload) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const validated = validateItems(payload.items);
    if (validated.error) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const auth = await getAuthenticatedProfile();
    const baseUrl = getBaseUrl();
    const stripe = getStripeServerClient();

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
        orderId: typeof payload.orderId === "string" ? payload.orderId : "",
        userId: auth?.user?.id ?? "guest",
      },
    });

    if (!session.url) {
      return NextResponse.json({ error: "Failed to create checkout session." }, { status: 500 });
    }

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error("[POST /api/checkout]", error);
    return NextResponse.json({ error: "Failed to create checkout session." }, { status: 500 });
  }
}
