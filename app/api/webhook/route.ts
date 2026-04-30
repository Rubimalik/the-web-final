import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  getStripeServerClient,
  getStripeWebhookSecret,
} from "@/lib/stripe";
import { storeSuccessfulPayment } from "@/lib/payments/store";

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const payload = await req.text();
    event = getStripeServerClient().webhooks.constructEvent(
      payload,
      signature,
      getStripeWebhookSecret(),
    );
  } catch (error) {
    console.error("[POST /api/webhook] Signature verification failed", error);
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const paymentRecord = storeSuccessfulPayment({
        id: `pay_${session.id}`,
        sessionId: session.id,
        amountTotal: session.amount_total ?? 0,
        currency: session.currency ?? "gbp",
        customerEmail: session.customer_details?.email ?? null,
        orderId: session.metadata?.orderId ?? null,
        userId: session.metadata?.userId ?? null,
        createdAt: new Date().toISOString(),
      });

      // Replace with DB insert in production.
      console.info("[POST /api/webhook] Stored successful payment", paymentRecord);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[POST /api/webhook] Handler failed", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
