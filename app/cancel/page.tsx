import Link from "next/link";
import NavBar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-white text-black font-myriad">
      <NavBar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
        <section className="rounded-2xl border border-black/10 p-6 sm:p-8 text-center bg-white">
          <h1 className="text-3xl font-bold brand-title mb-3">Payment cancelled</h1>
          <p className="text-black/70 mb-6">
            No payment was taken. You can go back and try checkout again when you are ready.
          </p>
          <Link
            href="/cart"
            className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold border border-black/15 hover:border-[var(--brand-cyan)] hover:text-[var(--brand-cyan)] transition-colors"
          >
            Return to cart
          </Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
