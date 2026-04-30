import type { Metadata } from "next";
import NavBar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "BuySupply Terms of Service.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-black font-myriad">
      <NavBar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <section className="brand-surface rounded-2xl p-6 sm:p-8">
          <h1 className="text-3xl sm:text-4xl font-bold brand-title">Terms of Service</h1>
          <p className="mt-4 text-black/70 text-sm sm:text-base leading-relaxed">
            These are placeholder terms for the authentication experience. Replace this content with your
            official Terms of Service for production.
          </p>
          <div className="mt-6 space-y-4 text-sm text-black/70 leading-relaxed">
            <p>
              By creating an account, you agree to follow our policies and to verify your email address.
            </p>
            <p>
              We may update these terms over time. Continued use of the service means you accept the latest version.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

