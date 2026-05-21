import { BadgeCheck, MapPin, Timer, Truck } from "lucide-react";
import { rentalAreas, rentalBenefits } from "../data";
import AnimatedCard from "./AnimatedCard";
import CheckList from "./CheckList";
import SectionWrapper from "./SectionWrapper";

export default function RentalSection() {
  return (
    <SectionWrapper
      eyebrow="Flexible rentals"
      title="Canon Photocopier Rentals Windsor Berkshire"
      intro="Rental options for businesses that need Canon photocopier performance without traditional long restrictive agreements."
      className="bg-[#f7f9fb]"
    >
      <div className="space-y-6">
        <div className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="rounded-lg border border-black/10 bg-white p-5 shadow-sm sm:p-7">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[rgba(0,207,255,0.1)]">
              <Truck className="h-5 w-5 text-[var(--brand-cyan)]" />
            </span>
            <div className="mt-5 space-y-4 text-base leading-7 text-black/72 sm:text-lg sm:leading-8">
              <p>
                BuySupply also provide flexible Canon photocopier rental solutions throughout
                Windsor Berkshire, Slough, Maidenhead, Ascot and West London.
              </p>
              <p>
                Unlike traditional photocopier leases, our rental packages are designed to offer
                flexibility and affordability without lengthy restrictive agreements.
              </p>
              <p>Benefits of our Canon photocopier rental solutions include:</p>
            </div>
          </div>
          <div className="rounded-lg border border-black/10 bg-white p-5 shadow-sm sm:p-6">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: Timer, label: "Flexible rental agreements" },
                { icon: BadgeCheck, label: "Maintenance support available" },
              ].map(({ icon: Icon, label }, index) => (
                <AnimatedCard
                  key={label}
                  className="rounded-lg border border-black/10 bg-[#f7f9fb] p-4"
                  delay={index * 0.06}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm">
                    <Icon className="h-4 w-4 text-[var(--brand-cyan)]" />
                  </span>
                  <p className="mt-3 text-sm font-bold leading-6 text-black">{label}</p>
                </AnimatedCard>
              ))}
            </div>
            <div className="mt-4">
              <CheckList items={rentalBenefits} columns="lg:grid-cols-2" />
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-black/10 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="text-xl font-bold text-black">
            We regularly supply Canon photocopier rentals to businesses in:
          </h3>
          <div className="mt-5 flex flex-wrap gap-3">
            {rentalAreas.map((area, index) => (
              <AnimatedCard
                as="span"
                key={area}
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black/70 shadow-sm"
                delay={Math.min(index, 5) * 0.05}
              >
                <MapPin className="h-4 w-4 text-[var(--brand-cyan)]" />
                {area}
              </AnimatedCard>
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
