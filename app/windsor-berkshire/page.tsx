import type { Metadata } from "next";
import FeaturedProductsSection from "@/components/FeaturedProductsSection";
import LocationHomePage from "@/components/LocationHomePage";

export const metadata: Metadata = {
  title: "Buy copier printer parts & toner Windsor Berkshire | BuySupply",
  description:
    "Buy copier printer parts and toner in Windsor Berkshire. BuySupply supplies office equipment, printer parts, toner, and copier-related products.",
  alternates: {
    canonical: "/windsor-berkshire",
  },
};

export default function WindsorBerkshirePage() {
  return (
    <LocationHomePage
      heroTitle="BUYSUPPLY"
      tagline="Buy copier printer parts & toner Windsor Berkshire"
      locationSpecificParagraph="Based near Windsor, we specialise in refurbished Canon imageRUNNER ADVANCE photocopiers, Canon office printers, multifunction devices, copier rentals, servicing, maintenance and genuine Canon consumables. Every machine is professionally tested, inspected and prepared by experienced technicians within our dedicated workshop facility before dispatch."
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
