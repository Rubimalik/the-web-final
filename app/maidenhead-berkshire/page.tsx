import type { Metadata, Viewport } from "next";
import MaidenheadBerkshirePageContent from "./components/MaidenheadBerkshirePageContent";

export const metadata: Metadata = {
  title: {
    absolute:
      "Refurbished Canon imageRUNNER ADVANCE DX Photocopiers in Maidenhead Berkshire | BuySupply",
  },
  description:
    "BuySupply Ltd are Canon photocopier specialists supplying refurbished Canon imageRUNNER ADVANCE DX photocopiers, Canon multifunction printers, Canon office printers and genuine Canon toner cartridges throughout Maidenhead Berkshire and the surrounding areas.",
  alternates: {
    canonical: "/maidenhead-berkshire",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function MaidenheadBerkshirePage() {
  return <MaidenheadBerkshirePageContent />;
}
