import { BadgeCheck, Headset, ShieldCheck, Truck, Wrench } from "lucide-react";
import { reasons } from "../data";
import AnimatedCard from "./AnimatedCard";
import SectionWrapper from "./SectionWrapper";

const reasonIcons = [BadgeCheck, ShieldCheck, Wrench, Truck, Headset];

export default function WhyChooseSection() {
  return (
    <SectionWrapper
      eyebrow="Why BuySupply"
      title="Why Choose BuySupply?"
      intro="Clear reasons Windsor businesses choose BuySupply for Canon photocopiers, servicing, consumables and export support."
    >
      <div className="rounded-lg border border-black/10 bg-[#f7f9fb] p-5 shadow-sm sm:p-7">
        <div className="grid auto-rows-fr gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((reason, index) => {
            const Icon = reasonIcons[index % reasonIcons.length];

            return (
              <AnimatedCard
                key={reason}
                className="location-check-item flex h-full gap-3 rounded-lg border border-black/10 bg-white p-4 shadow-sm"
                delay={Math.min(index, 5) * 0.05}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[rgba(0,207,255,0.1)]">
                  <Icon className="h-4 w-4 text-[var(--brand-cyan)]" />
                </span>
                <span className="pt-1 text-sm font-semibold leading-6 text-black/72">{reason}</span>
              </AnimatedCard>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
}
