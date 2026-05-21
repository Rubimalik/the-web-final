import { MapPin } from "lucide-react";
import { coveredAreas } from "../data";
import AnimatedCard from "./AnimatedCard";
import SectionWrapper from "./SectionWrapper";

export default function AreasCoveredSection() {
  return (
    <SectionWrapper
      eyebrow="Service areas"
      title="Areas We Cover"
      intro="Refurbished Canon photocopiers, printers and office printing solutions supplied across Windsor and nearby areas."
      className="bg-[#f7f9fb]"
    >
      <div className="rounded-lg border border-black/10 bg-white p-5 shadow-sm sm:p-7">
        <p className="mx-auto max-w-4xl text-center text-base leading-7 text-black/72 sm:text-lg sm:leading-8">
          We supply refurbished Canon photocopiers, printers and office printing solutions throughout:
        </p>
        <div className="mx-auto mt-6 grid max-w-5xl gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {coveredAreas.map((area, index) => (
            <AnimatedCard
              as="span"
              key={area}
              className="location-check-item inline-flex min-h-12 items-center gap-2 rounded-lg border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-black/70 shadow-sm"
              delay={Math.min(index, 5) * 0.05}
            >
              <MapPin className="h-4 w-4 text-[var(--brand-cyan)]" />
              {area}
            </AnimatedCard>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
