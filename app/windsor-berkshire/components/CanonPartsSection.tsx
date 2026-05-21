import { Droplets, PackageCheck, Printer, ScanLine } from "lucide-react";
import { canonParts } from "../data";
import AnimatedCard from "./AnimatedCard";
import CheckList from "./CheckList";
import SectionWrapper from "./SectionWrapper";

export default function CanonPartsSection() {
  return (
    <SectionWrapper
      eyebrow="Consumables & parts"
      title="Genuine Canon Toners, Inks & Parts"
      intro="Canon toner cartridges, inks, drums, maintenance items and photocopier parts supplied throughout the UK."
    >
      <div className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4 rounded-lg border border-black/10 bg-[#f7f9fb] p-5 text-base leading-7 text-black/72 shadow-sm sm:p-6 sm:text-lg sm:leading-8">
            <p>
              Alongside photocopiers and printers, BuySupply also supply genuine Canon toner
              cartridges, inks, drums and photocopier parts throughout the UK.
            </p>
            <p>We regularly supply:</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { icon: PackageCheck, label: "Toners, staples and waste toner bottles" },
              { icon: Droplets, label: "Canon inks and drum units" },
              { icon: Printer, label: "Photocopier parts and consumables" },
              { icon: ScanLine, label: "Fusers, rollers and imaging parts" },
            ].map(({ icon: Icon, label }, index) => (
              <AnimatedCard
                key={label}
                className="rounded-lg border border-black/10 bg-white p-4 shadow-sm"
                delay={index * 0.06}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[rgba(0,207,255,0.1)]">
                  <Icon className="h-4 w-4 text-[var(--brand-cyan)]" />
                </span>
                <p className="mt-3 text-sm font-bold leading-6 text-black">{label}</p>
              </AnimatedCard>
            ))}
          </div>
        </div>
        <CheckList items={canonParts} />
        <p className="rounded-lg border border-black/10 bg-white p-5 text-base leading-7 text-black/72 shadow-sm sm:text-lg sm:leading-8">
          We supply businesses, resellers, service companies and export customers throughout the UK
          and internationally.
        </p>
      </div>
    </SectionWrapper>
  );
}
