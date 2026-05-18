import type { Metadata } from "next";
import DealerFeaturedProductsSection from "@/components/dealer/DealerFeaturedProductsSection";
import LocationHomePage from "@/components/LocationHomePage";

export const metadata: Metadata = {
  title: "Buy copier printer parts & toner Maidenhead Berkshire",
  description:
    "Buy copier printer parts & toner in Maidenhead, Berkshire with BuySupply dealer services. We buy and sell photocopiers, printers, toners, ink, and consumables for local businesses.",
};

export default function DealerMaidenheadBerkshirePage() {
  return (
    <LocationHomePage
      heroTitle="BUYSUPPLY"
      tagline="Buy copier printer parts & toner Maidenhead Berkshire"
      locationSpecificParagraph="Based near Maidenhead, we specialise in refurbished Canon imageRUNNER ADVANCE photocopiers, Canon office printers, multifunction devices, copier rentals, servicing, maintenance and genuine Canon consumables. Every machine is professionally tested, inspected and prepared by experienced technicians within our dedicated workshop facility before dispatch."
      printersLink="/dealer/products/printers"
      consumablesLink="/dealer/products/consumables"
      featuredSection={<DealerFeaturedProductsSection />}
      sellToUsHref="/dealer/sell-to-us#sell-form"
      contactHref="mailto:Sales@buysupply.me"
      contactLabel="Contact Our Team"
    />
  );
}
