import type { Metadata } from "next";
import FeaturedProductsSection from "@/components/FeaturedProductsSection";
import LocationHomePage from "@/components/LocationHomePage";

export const metadata: Metadata = {
  title: "Buy copier printer parts & toner Slough Trading Estate | BuySupply",
  description:
    "Buy copier printer parts and toner in Slough Trading Estate. BuySupply supplies copier, printer parts, toner, and office equipment products for businesses in and around Slough Trading Estate.",
  alternates: {
    canonical: "/slough-trading-estate",
  },
  openGraph: {
    title: "Buy copier printer parts & toner Slough Trading Estate | BuySupply",
    description:
      "Buy copier printer parts and toner in Slough Trading Estate. BuySupply supplies copier, printer parts, toner, and office equipment products for businesses in and around Slough Trading Estate.",
    url: "https://buysupply.me/slough-trading-estate",
    type: "website",
  },
};

export default function SloughTradingEstatePage() {
  return (
    <LocationHomePage
      heroTitle="BUYSUPPLY"
      tagline="Buy copier printer parts & toner Slough Trading Estate"
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
