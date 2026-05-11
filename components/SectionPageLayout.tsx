import NavBar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import FeaturedProductsSection from "@/components/FeaturedProductsSection";

export default function SectionPageLayout({
  title,
  children,
  showFeaturedProducts = false,
}: {
  title: string;
  children: React.ReactNode;
  showFeaturedProducts?: boolean;
}) {
  return (
    <div className="bg-white text-black min-h-screen font-myriad">
      <NavBar />
      <main className="max-w-5xl mx-auto px-6 py-14 sm:py-16">
        <h1 className="text-3xl md:text-4xl font-bold mb-10 text-center brand-title">{title}</h1>
        <div className="text-black/75 leading-relaxed space-y-6">{children}</div>
      </main>
      {showFeaturedProducts ? (
        <FeaturedProductsSection
          title="Featured Products"
          kicker="Recommended"
          description="Explore selected products from our current active catalogue."
        />
      ) : null}
      <SiteFooter />
    </div>
  );
}
