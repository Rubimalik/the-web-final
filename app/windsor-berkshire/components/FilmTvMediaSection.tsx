import { CheckCircle2, Film, MonitorPlay } from "lucide-react";
import { productionUses } from "../data";
import AnimatedCard from "./AnimatedCard";
import SectionWrapper from "./SectionWrapper";

export default function FilmTvMediaSection() {
  return (
    <SectionWrapper
      eyebrow="Film, TV & media"
      title="Canon Photocopiers for Film, TV & Media Production"
      intro="A unique support area for production offices, film sets, creative studios and temporary site operations."
    >
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-black/10 bg-[#f7f9fb] p-5 shadow-sm sm:p-7">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-white shadow-sm">
            <Film className="h-5 w-5 text-[var(--brand-cyan)]" />
          </span>
          <p className="mt-5 text-base leading-7 text-black/72 sm:text-lg sm:leading-8">
            BuySupply regularly supply refurbished Canon photocopiers and office printers to film
            production companies, television production offices, media agencies, creative studios
            and temporary site offices throughout Berkshire, Windsor, Slough, West London and
            surrounding areas.
          </p>
          <p className="mt-4 text-base leading-7 text-black/72 sm:text-lg sm:leading-8">
            We understand the fast-paced demands of production environments and can provide
            reliable office printing solutions, short-term photocopier rentals, toner supplies and
            rapid replacement support where required.
          </p>
        </div>
        <div className="rounded-lg border border-black/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[rgba(0,207,255,0.1)]">
              <MonitorPlay className="h-5 w-5 text-[var(--brand-cyan)]" />
            </span>
            <h3 className="text-xl font-bold text-black">Our flexible rental options are ideal for:</h3>
          </div>
          <ul className="mt-5 grid auto-rows-fr gap-3 sm:grid-cols-2">
            {productionUses.map((use, index) => (
              <AnimatedCard
                as="li"
                key={use}
                className="location-check-item flex h-full items-start gap-3 rounded-lg border border-black/10 bg-white px-4 py-4 text-sm font-semibold leading-6 text-black/70 shadow-sm"
                delay={index * 0.06}
              >
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[var(--brand-cyan)]" />
                {use}
              </AnimatedCard>
            ))}
          </ul>
        </div>
      </div>
    </SectionWrapper>
  );
}
