import type { Metadata, Viewport } from "next";
import HeathrowAirportPageContent from "../heathrow-airport/components/HeathrowAirportPageContent";

export const metadata: Metadata = {
  title: {
    absolute:
      "Canon imageRUNNER ADVANCE DX Photocopiers & Office Printers Near Heathrow Airport | BuySupply",
  },
  description:
    "BuySupply Ltd are specialists in refurbished Canon imageRUNNER ADVANCE DX photocopiers, Canon office printers and genuine Canon consumables, supplying businesses throughout Heathrow Airport, West London, Slough and the surrounding commercial areas.",
  alternates: {
    canonical: "/heathrow-london",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function HeathrowLondonPage() {
  return <HeathrowAirportPageContent />;
}
