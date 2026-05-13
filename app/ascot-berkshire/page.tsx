import type { Metadata } from "next";
import FeaturedProductsSection from "@/components/FeaturedProductsSection";
import LocationHomePage from "@/components/LocationHomePage";

export const metadata: Metadata = {
  title: "Buy copier printer parts & toner Ascot Berkshire | BuySupply",
  description:
    "Buy copier printer parts and toner in Ascot Berkshire. BuySupply supplies office equipment, printer parts, toner, and copier-related products.",
  alternates: {
    canonical: "/ascot-berkshire",
  },
};

export default function AscotBerkshirePage() {
  return (
    <LocationHomePage
      heroTitle="BUYSUPPLY"
      tagline="Buy copier printer parts & toner Ascot Berkshire"
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
