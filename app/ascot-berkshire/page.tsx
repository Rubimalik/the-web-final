import type { Metadata, Viewport } from "next";
import AscotBerkshirePageContent from "./components/AscotBerkshirePageContent";

export const metadata: Metadata = {
  title: {
    absolute: "Refurbished Canon Photocopiers & Canon Office Printers in Ascot Berkshire | BuySupply",
  },
  description:
    "BuySupply Ltd supply refurbished Canon imageRUNNER ADVANCE DX photocopiers, Canon multifunction office printers and genuine Canon toner cartridges to businesses throughout Ascot Berkshire and the surrounding premium commercial areas.",
  alternates: {
    canonical: "/ascot-berkshire",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function AscotBerkshirePage() {
  return <AscotBerkshirePageContent />;
}
