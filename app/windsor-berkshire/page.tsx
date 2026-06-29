import type { Metadata, Viewport } from "next";
import LocalSeoPage from "@/components/local-pages/LocalSeoPage";
import { windsorBerkshireLocalContent } from "./data";

export const metadata: Metadata = {
  title: {
    absolute: "Refurbished Canon Photocopiers Windsor Berkshire | BuySupply",
  },
  description:
    "Refurbished Canon photocopiers, printers, rentals, servicing, toners and parts in Windsor Berkshire from BuySupply Ltd.",
  alternates: {
    canonical: "/windsor-berkshire",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function WindsorBerkshirePage() {
  return <LocalSeoPage content={windsorBerkshireLocalContent} />;
}
