import NavBar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import FeaturedProductsSection from "@/components/FeaturedProductsSection";
import Link from "next/link";

export const metadata = {
  title: "About BuySupply | Photocopiers & Consumables UK",
  description: "Learn about BuySupply - the UK's trusted partner for buying, selling, and leasing photocopiers and printer consumables.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-black">
      <NavBar />

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold brand-title mb-4">About BuySupply</h1>
          <p className="text-lg text-black/70 max-w-2xl">
            Over 30 years of expertise in the office equipment trade. We are your trusted partner for buying, selling, leasing, and exporting photocopiers and printer consumables across the UK and beyond.
          </p>
        </div>

        {/* Mission Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-black/70">
              To provide reliable, high-quality office equipment and consumables at competitive prices. We serve businesses, dealers, and customers worldwide with professionalism and integrity.
            </p>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-4">Why Choose Us</h2>
            <ul className="space-y-3 text-black/70">
              <li className="flex gap-3">
                <span className="text-[var(--brand-cyan)] font-bold">-</span>
                <span>30+ years of industry experience</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[var(--brand-cyan)] font-bold">-</span>
                <span>UK-wide collection and delivery</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[var(--brand-cyan)] font-bold">-</span>
                <span>Global export network</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[var(--brand-cyan)] font-bold">-</span>
                <span>Competitive pricing and quality assurance</span>
              </li>
            </ul>
          </div>
        </div>

        {/* What We Offer */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-black/10 bg-cyan-50/40 p-6">
              <h3 className="text-xl font-semibold mb-3">Buy & Sell</h3>
              <p className="text-black/70">
                Browse our large inventory of photocopiers, printers, and consumables. Buy individual units or bulk quantities. Sell us your used equipment.
              </p>
            </div>

            <div className="rounded-2xl border border-black/10 bg-cyan-50/40 p-6">
              <h3 className="text-xl font-semibold mb-3">Leasing</h3>
              <p className="text-black/70">
                Flexible leasing options for businesses and dealers. We handle collection, storage, and logistics for lease returns.
              </p>
            </div>

            <div className="rounded-2xl border border-black/10 bg-cyan-50/40 p-6">
              <h3 className="text-xl font-semibold mb-3">Export</h3>
              <p className="text-black/70">
                International export to Africa, UAE, India, Pakistan, and beyond. Fast delivery to UK shipping hubs and reliable freight forwarding.
              </p>
            </div>
          </div>
        </div>

        {/* Brands We Work With */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Trusted Brands</h2>
          <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
            <p className="text-black/70 mb-4">
              We supply and service equipment from leading manufacturers including:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 text-center">
              {["Canon", "Xerox", "Ricoh", "Toshiba"].map((brand) => (
                <div key={brand} className="py-2 px-3 rounded-lg bg-cyan-50/40 border border-black/10">
                  <p className="font-semibold text-sm">{brand}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <FeaturedProductsSection
          title="Explore Our Popular Products"
          kicker="Featured Products"
          description="A selection of active products from our public catalogue."
          className="-mx-4 sm:-mx-6"
        />

        {/* Contact CTA */}
        <div className="rounded-3xl border border-black/10 bg-cyan-50/40 p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Work With Us?</h2>
          <p className="text-black/70 mb-6">
            Whether you are looking to buy, sell, lease, or export, our team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="px-6 py-3 brand-button rounded-xl font-semibold inline-block">
              Get in Touch
            </Link>
            <Link href="/products" className="px-6 py-3 rounded-xl border border-black/20 bg-white font-semibold hover:border-[var(--brand-cyan)] hover:text-[var(--brand-cyan)] transition-all inline-block">
              Browse Products
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
