"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, ShoppingCart, Trash2 } from "lucide-react";
import { useDealerCart } from "@/components/dealer/DealerCartProvider";
import { safeReadJsonResponse } from "@/lib/safe-json";

function formatPrice(value: number) {
  return `\u00a3${value.toFixed(2)}`;
}

function unitPrice(product: {
  dealerPrice: number | null;
  retailPrice: number | null;
}) {
  return product.dealerPrice ?? product.retailPrice;
}

export default function DealerCartPage() {
  const router = useRouter();
  const { items, totalPrice, updateQuantity, removeFromCart, clearCart } =
    useDealerCart();
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function placeDealerOrder() {
    if (items.length === 0 || submitting) return;

    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/dealer/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes,
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
        }),
      });

      const payload = await safeReadJsonResponse<{ error?: string }>(
        response,
        "DealerCartPage create order",
      );
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to create dealer order");
      }

      clearCart();
      router.push("/dealer/orders");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create dealer order");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold brand-title">Cart</h1>
          <p className="mt-2 text-black/60 text-sm sm:text-base">
            Review items and submit an order request.
          </p>
        </div>
        {items.length > 0 ? (
          <button
            type="button"
            onClick={clearCart}
            className="inline-flex w-fit items-center justify-center rounded-lg border border-black/20 px-4 py-2 text-sm font-semibold text-black/75 transition hover:text-[var(--brand-cyan)] hover:border-[var(--brand-cyan)]"
          >
            Clear Cart
          </button>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="mt-10 rounded-2xl brand-surface p-8 sm:p-10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cyan-50 text-[var(--brand-cyan)]">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <p className="text-black/70">Your cart is empty.</p>
          <Link
            href="/dealer/products"
            className="mt-5 inline-flex rounded-lg brand-button px-5 py-2.5 text-sm"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 lg:items-start">
          <section className="space-y-4">
            {items.map((item) => {
              const price = unitPrice(item.product);

              return (
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
                    <h2 className="text-base font-semibold leading-snug text-black sm:truncate">
                      {item.product.name}
                    </h2>
                    <p className="mt-1 text-black/60 text-sm">
                      Your price: {price != null ? formatPrice(price) : "POA"}
                    </p>
                    {typeof item.product.retailPrice === "number" &&
                    typeof item.product.dealerPrice === "number" &&
                    item.product.dealerPrice < item.product.retailPrice ? (
                      <p className="text-xs text-black/45">
                        Retail{" "}
                        <span className="line-through">
                          {formatPrice(item.product.retailPrice)}
                        </span>
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                    <label className="text-xs uppercase tracking-wide text-black/50">
                      Qty
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(event) => {
                        const nextQuantity = Number.parseInt(event.target.value, 10);
                        if (!Number.isFinite(nextQuantity)) return;
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
              );
            })}
          </section>

          <aside className="rounded-2xl brand-surface p-5 sm:p-6 h-fit lg:sticky lg:top-28">
            <h2 className="font-semibold text-lg mb-4 text-black">Order</h2>
            <div className="flex items-center justify-between text-sm">
              <span className="text-black/70">Estimated total</span>
              <span className="text-xl text-black font-semibold">{formatPrice(totalPrice)}</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-black/50">
              POA items and final availability are confirmed by the BuySupply team.
            </p>
            <label className="mt-5 block text-sm font-semibold text-black/75">
              Order notes
            </label>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
              placeholder="Delivery details, bulk requirements, or PO reference..."
              className="mt-2 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-black placeholder:text-black/40 focus:border-[var(--brand-cyan)] focus:outline-none"
            />
            <button
              type="button"
              disabled={submitting}
              onClick={() => void placeDealerOrder()}
              className="mt-5 w-full rounded-lg brand-button py-2.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Place Order"
              )}
            </button>
            {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
          </aside>
        </div>
      )}
    </div>
  );
}
