"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import NavBar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import { useCart } from "@/components/CartProvider";
import { useAuth } from "@/lib/auth/useAuth";

function formatPrice(value: number) {
  return `£${value.toFixed(2)}`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice } = useCart();
  const { user, access, loading: authLoading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isCustomer = !!user && !!access?.canAccessCustomer;
  const canPlaceOrder = items.length > 0 && isCustomer;
  const handleConfirmOrder = async () => {
    if (!authLoading && !isCustomer) {
      router.push("/signin?from=%2Fcheckout");
      return;
    }
    if (!canPlaceOrder || submitting) return;

    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
        }),
      });

      const payload = (await response.json()) as { error?: string; url?: string };
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/signin?from=%2Fcheckout");
          return;
        }
        throw new Error(payload.error || "Failed to create order.");
      }

      if (!payload.url) {
        throw new Error("Stripe checkout did not return a redirect URL.");
      }

      window.location.assign(payload.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create order.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-myriad">
      <NavBar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <h1 className="text-3xl md:text-4xl font-bold brand-title">Checkout</h1>
        <p className="mt-2 text-black/60">Review your order and confirm in one step.</p>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
          <section className="rounded-2xl brand-surface p-5 sm:p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-black/70">Your cart is empty.</p>
                <Link href="/products" className="mt-4 inline-flex brand-button rounded-lg px-4 py-2 text-sm">
                  Browse products
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <article key={item.product.id} className="flex items-center gap-3 border-b border-black/10 pb-3 last:border-none">
                  <div className="h-16 w-16 overflow-hidden rounded-lg border border-black/10 bg-cyan-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.product.imageUrl || "/logo.png"} alt={item.product.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-semibold truncate">{item.product.name}</h2>
                    <p className="text-xs text-black/60">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm text-black/80">
                    {item.product.price != null ? formatPrice(item.product.price * item.quantity) : "POA"}
                  </p>
                </article>
              ))
            )}
          </section>

          <aside className="rounded-2xl brand-surface p-5 sm:p-6 h-fit">
            <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
            <div className="flex items-center justify-between text-sm">
              <span className="text-black/70">Subtotal</span>
              <span className="text-black font-semibold">{formatPrice(totalPrice)}</span>
            </div>
            <p className="mt-2 text-xs text-black/50">POA products are priced after confirmation.</p>
            <button
              type="button"
              disabled={items.length === 0 || authLoading || submitting}
              onClick={() => void handleConfirmOrder()}
              className="mt-5 w-full rounded-lg brand-button py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {authLoading
                ? "Checking account..."
                : !isCustomer
                  ? "Sign in to Checkout"
                  : submitting
                    ? "Confirming..."
                    : "Confirm Order"}
            </button>
            {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
