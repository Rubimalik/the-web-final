import type { Metadata, Viewport } from "next";
import SloughTradingEstatePageContent from "./components/SloughTradingEstatePageContent";

export const metadata: Metadata = {
  title: {
    absolute: "Canon Photocopier Specialists on Slough Trading Estate | BuySupply",
  },
  description:
    "BuySupply Ltd are specialists in refurbished Canon imageRUNNER ADVANCE DX photocopiers and Canon office printing systems based on Slough Trading Estate, supplying businesses throughout Slough Berkshire, Heathrow corridor and West London.",
  alternates: {
    canonical: "/slough-trading-estate",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function SloughTradingEstatePage() {
  return <SloughTradingEstatePageContent />;
}
