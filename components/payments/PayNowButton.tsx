"use client";

import { useState } from "react";

type CheckoutItem = {
  name: string;
  price: number;
  quantity: number;
};

type PayNowButtonProps = {
  items: CheckoutItem[];
  orderId?: string;
  className?: string;
  label?: string;
};

export default function PayNowButton({
  items,
  orderId,
  className,
  label = "Pay Now",
}: PayNowButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  async function handleCheckout() {
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          orderId,
        }),
      });

      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        throw new Error(data.error || "Unable to start checkout.");
      }

      window.location.assign(data.url);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Checkout failed. Please try again.";
      setError(message);
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => void handleCheckout()}
        disabled={loading}
        className={
          className ??
          "brand-button rounded-xl px-5 py-3 text-sm font-semibold text-black disabled:opacity-70 disabled:cursor-not-allowed"
        }
      >
        {loading ? "Redirecting..." : label}
      </button>
      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
