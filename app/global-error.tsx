"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global error boundary]", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#ffffff", color: "#000000" }}>
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 16px",
            fontFamily: "Arial, sans-serif",
            textAlign: "center",
          }}
        >
          <section style={{ width: "100%", maxWidth: 620 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="BuySupply"
              style={{ width: 128, height: "auto", margin: "0 auto 28px" }}
            />
            <p
              style={{
                margin: 0,
                color: "#00a6d6",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
              }}
            >
              Something went wrong
            </p>
            <h1 style={{ margin: "12px 0 0", fontSize: "clamp(32px, 6vw, 52px)", lineHeight: 1.05 }}>
              We could not load this page.
            </h1>
            <p style={{ margin: "20px auto 0", maxWidth: 520, color: "rgba(0,0,0,0.65)", lineHeight: 1.65 }}>
              Please try again. If the problem continues, our team can still help with products, orders, or enquiries.
            </p>
            {error.digest ? (
              <p style={{ marginTop: 16, color: "rgba(0,0,0,0.45)", fontSize: 12, fontWeight: 700 }}>
                Reference: {error.digest}
              </p>
            ) : null}
            <button
              type="button"
              onClick={reset}
              style={{
                marginTop: 32,
                border: 0,
                borderRadius: 8,
                background: "#00a6d6",
                color: "#ffffff",
                padding: "12px 20px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
