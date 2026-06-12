import type { Metadata, Viewport } from "next";
import NavBar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import { IntroSection, LocalSection } from "@/components/local-pages/LocalSeoPage";
import WindsorHeroSection from "./components/WindsorHeroSection";
import CostSavingSection from "./components/CostSavingSection";
import RentalSection from "./components/RentalSection";
import FilmTvMediaSection from "./components/FilmTvMediaSection";
import ServicingMaintenanceSection from "./components/ServicingMaintenanceSection";
import CanonPartsSection from "./components/CanonPartsSection";
import ManagedPrintSection from "./components/ManagedPrintSection";
import NearbyWorkshopSection from "./components/NearbyWorkshopSection";
import UkExportSection from "./components/UkExportSection";
import WhyChooseSection from "./components/WhyChooseSection";
import AreasCoveredSection from "./components/AreasCoveredSection";
import FaqSection from "./components/FaqSection";
import ContactSection from "./components/ContactSection";
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
  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-black font-myriad">
      <NavBar />
      <WindsorHeroSection />
      <IntroSection content={windsorBerkshireLocalContent} />
      <LocalSection section={windsorBerkshireLocalContent.sections[0]} />
      <CostSavingSection />
      <RentalSection />
      <FilmTvMediaSection />
      <ServicingMaintenanceSection />
      <CanonPartsSection />
      <ManagedPrintSection />
      <NearbyWorkshopSection />
      <UkExportSection />
      <WhyChooseSection />
      <AreasCoveredSection />
      <FaqSection />
      <ContactSection />
      <SiteFooter />
    </main>
  );
}
