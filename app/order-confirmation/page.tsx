import Link from "next/link";
import NavBar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";

export default function OrderConfirmationPage() {
  return (
    <div className="min-h-screen bg-white text-black font-myriad">
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="brand-surface rounded-2xl p-8 sm:p-10">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--brand-cyan)]">Order Received</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold brand-title">Thank You</h1>
          <p className="mt-4 text-black/70">
            Your order request has been created. Our team will contact you shortly to confirm stock, pricing, and next
            steps.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
            <Link href="/products" className="brand-button rounded-lg px-5 py-2.5 text-sm">
              Continue Shopping
            </Link>
            <Link
              href="/about#sell-to-us"
              className="rounded-lg border border-black/20 px-5 py-2.5 text-sm font-semibold text-black transition hover:border-[var(--brand-cyan)] hover:text-[var(--brand-cyan)]"
            >
              Contact Team
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
