import DealerFeaturedProductsSection from "@/components/dealer/DealerFeaturedProductsSection";

export default function DealerSectionPageLayout({
  title,
  children,
  showFeaturedProducts = false,
}: {
  title: string;
  children: React.ReactNode;
  showFeaturedProducts?: boolean;
}) {
  return (
    <div className="text-black min-h-screen font-myriad">
      <main className="max-w-5xl mx-auto px-6 py-14 sm:py-16">
        <h1 className="text-3xl md:text-4xl font-bold mb-10 text-center brand-title">{title}</h1>
        <div className="text-black/75 leading-relaxed space-y-6">{children}</div>
      </main>
      {showFeaturedProducts ? (
        <DealerFeaturedProductsSection
          title="Featured Products"
          kicker="Wholesale Highlights"
          description="Selected dealer-available products from the active wholesale catalogue."
        />
      ) : null}
    </div>
  );
}
