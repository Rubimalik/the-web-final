import type { Metadata } from "next";
import NavBar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "BuySupply Privacy Policy.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-black font-myriad">
      <NavBar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <section className="brand-surface rounded-2xl p-6 sm:p-8">
          <h1 className="text-3xl sm:text-4xl font-bold brand-title">Privacy Policy</h1>
          <p className="mt-4 text-black/70 text-sm sm:text-base leading-relaxed">
            These are placeholder privacy policy text for the authentication experience. Replace with
            your official policy for production.
          </p>
          <div className="mt-6 space-y-4 text-sm text-black/70 leading-relaxed">
            <p>
              Your account is handled by Supabase Auth. We store a minimal profile record in our
              database to personalize your experience.
            </p>
            <p>
              We recommend reviewing Supabase's data handling documentation and your own compliance
              requirements.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

