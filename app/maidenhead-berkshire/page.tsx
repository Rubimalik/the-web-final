import type { Metadata } from "next";
import FeaturedProductsSection from "@/components/FeaturedProductsSection";
import LocationHomePage from "@/components/LocationHomePage";

export const metadata: Metadata = {
  title: "Buy copier printer parts & toner Maidenhead Berkshire | BuySupply",
  description:
    "Buy copier printer parts and toner in Maidenhead Berkshire. BuySupply supplies office equipment, printer parts, toner, and copier-related products.",
  alternates: {
    canonical: "/maidenhead-berkshire",
  },
};

export default function MaidenheadBerkshirePage() {
  return (
    <LocationHomePage
      heroTitle="BUYSUPPLY"
      tagline="Buy copier printer parts & toner Maidenhead Berkshire"
      printersLink="/products?category=photocopiers"
      consumablesLink="/products?category=consumables"
      featuredSection={<FeaturedProductsSection />}
      sellToUsHref="/sell-to-us#sell-form"
      contactHref="/contact"
      contactLabel="Contact Our Team"
      showNavigation
      showFooter
    />
  );
}
