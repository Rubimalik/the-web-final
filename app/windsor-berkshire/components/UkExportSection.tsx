import { Globe2, PackageCheck, Truck } from "lucide-react";
import { exportLocations } from "../data";
import AnimatedCard from "./AnimatedCard";
import SectionWrapper from "./SectionWrapper";

export default function UkExportSection() {
  return (
    <SectionWrapper
      eyebrow="UK & export"
      title="UK & Export Specialists"
      intro="National and international supply for refurbished Canon photocopiers, office printers, toners and consumables."
      className="bg-[#f7f9fb]"
    >
      <div className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_0.82fr]">
          <div className="space-y-4 rounded-lg border border-black/10 bg-white p-5 text-base leading-7 text-black/72 shadow-sm sm:p-6 sm:text-lg sm:leading-8">
            <p>
              BuySupply are UK and export specialists supplying refurbished Canon photocopiers,
              office printers, toners and consumables both nationally and internationally.
            </p>
            <p>We regularly assist customers exporting office equipment to:</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {[
              { icon: Truck, label: "UK delivery and collection" },
              { icon: PackageCheck, label: "Storage and shipping hub preparation" },
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {exportLocations.map((location, index) => (
            <AnimatedCard
              key={location}
              className="location-check-item rounded-lg border border-black/10 bg-white p-5 text-center shadow-sm"
              delay={index * 0.06}
            >
              <Globe2 className="mx-auto h-5 w-5 text-[var(--brand-cyan)]" />
              <p className="mt-3 text-xl font-bold text-black">{location}</p>
            </AnimatedCard>
          ))}
        </div>
        <div className="mx-auto max-w-4xl space-y-4 rounded-lg border border-black/10 bg-white p-5 text-base leading-7 text-black/72 shadow-sm sm:p-6 sm:text-lg sm:leading-8">
          <p>
            Our logistics network allows us to deliver and collect photocopiers throughout the UK
            quickly and efficiently.
          </p>
          <p>We can also assist with storage, preparation and delivery to shipping hubs.</p>
        </div>
      </div>
    </SectionWrapper>
  );
}
