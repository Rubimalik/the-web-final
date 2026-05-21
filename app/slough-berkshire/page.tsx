import type { Metadata, Viewport } from "next";
import SloughBerkshirePageContent from "./components/SloughBerkshirePageContent";

export const metadata: Metadata = {
  title: {
    absolute: "Refurbished Canon Photocopiers & Office Printers in Slough Berkshire | BuySupply",
  },
  description:
    "Searching for reliable refurbished Canon photocopiers and office printers in Slough Berkshire? BuySupply Ltd are one of the area’s leading suppliers of refurbished Canon multifunction photocopiers, office printers, toners, inks and parts for businesses throughout Slough, Burnham, Langley, Windsor, Maidenhead and West London.",
  alternates: {
    canonical: "/slough-berkshire",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function SloughBerkshirePage() {
  return <SloughBerkshirePageContent />;
}
