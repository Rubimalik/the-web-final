"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ShoppingCart, Trash2 } from "lucide-react";
import NavBar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import { useCart } from "@/components/CartProvider";
import PayNowButton from "@/components/payments/PayNowButton";

function formatPrice(value: number) {
  return `£${value.toFixed(2)}`;
}

export default function CartPage() {
  const { items, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();
  const stripeItems = useMemo(
    () =>
      items
        .filter((item) => typeof item.product.price === "number" && item.product.price > 0)
        .map((item) => ({
          name: item.product.name,
          price: Number(item.product.price),
          quantity: item.quantity,
        })),
    [items],
  );

  return (
    <div className="min-h-screen bg-white text-black font-myriad">
      <NavBar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold brand-title">Your Cart</h1>
            <p className="mt-2 text-black/60 text-sm sm:text-base">Review selected products and update quantities.</p>
          </div>
          {items.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="inline-flex w-fit items-center justify-center rounded-lg border border-black/20 px-4 py-2 text-sm font-semibold text-black/75 transition hover:text-[var(--brand-cyan)] hover:border-[var(--brand-cyan)]"
            >
              Clear Cart
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="mt-10 rounded-2xl brand-surface p-8 sm:p-10 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cyan-50 text-[var(--brand-cyan)]">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <p className="text-black/70">Your cart is empty.</p>
            <Link
              href="/products"
              className="mt-5 inline-flex rounded-lg brand-button px-5 py-2.5 text-sm"
            >
              Browse Store
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 lg:items-start">
            <section className="space-y-4">
              {items.map((item) => (
                <article
                  key={item.product.id}
                  className="rounded-2xl brand-surface p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:items-center"
                >
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-black/10 bg-cyan-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.product.imageUrl || "/logo.png"}
                      alt={item.product.name}
                      className="h-full w-full object-contain p-1"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="text-base font-semibold leading-snug text-black sm:truncate">{item.product.name}</h2>
                    <p className="mt-1 text-sm font-semibold text-black/75">
                      {item.product.price != null ? formatPrice(item.product.price) : "POA"}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                    <label className="text-xs uppercase tracking-wide text-black/50">Qty</label>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => {
                        const nextQuantity = Number(e.target.value);
                        if (Number.isNaN(nextQuantity)) return;
                        updateQuantity(item.product.id, nextQuantity);
                      }}
                      className="h-10 w-20 rounded-lg border border-black/20 bg-white px-3 text-sm text-black focus:border-[var(--brand-cyan)] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product.id)}
                      className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-black/15 px-3 text-sm font-medium text-black/60 transition hover:border-[var(--brand-cyan)] hover:text-[var(--brand-cyan)]"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </section>

            <aside className="rounded-2xl brand-surface p-5 sm:p-6 lg:sticky lg:top-28">
              <h2 className="font-semibold text-lg mb-4 text-black">Order Summary</h2>
              <div className="flex items-center justify-between text-sm sm:text-base">
                <span className="text-black/60">Total</span>
                <strong className="text-xl text-black">{formatPrice(totalPrice)}</strong>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-black/45">Final pricing for POA items will be confirmed by our team.</p>
              <div className="mt-5 flex flex-col gap-3">
                <Link
                  href="/checkout"
                  className="inline-flex justify-center rounded-lg brand-button px-4 py-2.5 text-sm font-semibold"
                >
                  Proceed to Checkout
                </Link>
                <Link
                  href="/products"
                  className="inline-flex justify-center rounded-lg border border-black/20 px-4 py-2.5 text-sm font-semibold text-black transition hover:border-[var(--brand-cyan)] hover:text-[var(--brand-cyan)]"
                >
                  Continue Shopping
                </Link>
                {stripeItems.length > 0 ? (
                  <PayNowButton
                    items={stripeItems}
                    className="inline-flex justify-center rounded-lg brand-button px-4 py-2.5 text-sm"
                  />
                ) : null}
                <a
                  href={`mailto:sales@buysupply.me?subject=Cart Enquiry&body=${encodeURIComponent(
                    `Hi, I would like to enquire about the following items:\n\n${items
                      .map(
                        (item) =>
                          `- ${item.product.name} x${item.quantity} (${item.product.price != null ? formatPrice(item.product.price) : "POA"})`
                      )
                      .join("\n")}\n\nCart total (priced items): ${formatPrice(totalPrice)}`
                  )}`}
                  className="inline-flex justify-center rounded-lg brand-button px-4 py-2.5 text-sm"
                >
                  Enquire About Cart
                </a>
              </div>
            </aside>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
