import type { Metadata, Viewport } from "next";
import ReadingBerkshirePageContent from "./components/ReadingBerkshirePageContent";

export const metadata: Metadata = {
  title: {
    absolute:
      "Canon Office Photocopiers & Refurbished Canon Printers in Reading Berkshire | BuySupply",
  },
  description:
    "Businesses across Reading Berkshire looking for reliable Canon office photocopiers and refurbished Canon multifunction printers choose BuySupply Ltd for dependable office printing systems, genuine Canon consumables and professional technical support.",
  alternates: {
    canonical: "/reading-berkshire",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function ReadingBerkshirePage() {
  return <ReadingBerkshirePageContent />;
}
