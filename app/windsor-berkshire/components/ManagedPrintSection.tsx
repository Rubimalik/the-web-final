import { ChartNoAxesColumnIncreasing, Printer, Settings, ShieldCheck } from "lucide-react";
import { managedPrintServices } from "../data";
import AnimatedCard from "./AnimatedCard";
import IconCard from "./IconCard";
import SectionWrapper from "./SectionWrapper";

export default function ManagedPrintSection() {
  return (
    <SectionWrapper
      eyebrow="Managed print"
      title="Managed Print Solutions"
      intro="Cleaner office printing systems designed to control costs, manage toner supply and improve everyday print efficiency."
      className="bg-[#f7f9fb]"
    >
      <div className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
          <div className="rounded-lg border border-black/10 bg-white p-5 shadow-sm sm:p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[rgba(0,207,255,0.1)]">
              <ChartNoAxesColumnIncreasing className="h-5 w-5 text-[var(--brand-cyan)]" />
            </span>
            <p className="mt-4 text-base leading-7 text-black/72 sm:text-lg sm:leading-8">
              BuySupply also provide managed print and office printing solutions designed to help
              businesses control printing costs and improve efficiency.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: Printer, label: "Office print control" },
              { icon: Settings, label: "Fleet optimisation" },
              { icon: ShieldCheck, label: "Planned support" },
            ].map(({ icon: Icon, label }, index) => (
              <AnimatedCard
                key={label}
                className="rounded-lg border border-black/10 bg-white p-4 shadow-sm"
                delay={index * 0.06}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f7f9fb]">
                  <Icon className="h-4 w-4 text-[var(--brand-cyan)]" />
                </span>
                <p className="mt-3 text-sm font-bold leading-6 text-black">{label}</p>
              </AnimatedCard>
            ))}
          </div>
        </div>
        <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {managedPrintServices.map((service) => (
            <IconCard key={service} icon={Settings} title={service} />
          ))}
        </div>
        <p className="rounded-lg border border-black/10 bg-white p-5 text-center text-base leading-7 text-black/72 shadow-sm sm:text-lg sm:leading-8">
          We help businesses streamline office printing whilst reducing unnecessary expenditure.
        </p>
      </div>
    </SectionWrapper>
  );
}
