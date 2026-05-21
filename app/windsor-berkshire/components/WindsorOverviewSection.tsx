import { CheckCircle2, MapPin, Printer, ShieldCheck, Truck, Wrench } from "lucide-react";
import AnimatedCard from "./AnimatedCard";
import SectionWrapper from "./SectionWrapper";

const highlights = [
  { icon: ShieldCheck, label: "Established since 2001" },
  { icon: Printer, label: "Canon specialists" },
  { icon: MapPin, label: "Windsor Berkshire coverage" },
  { icon: Truck, label: "Delivery & installation" },
  { icon: Wrench, label: "Servicing & support" },
];

const trustPoints = [
  "Professionally refurbished Canon photocopiers",
  "Prepared by experienced technicians",
  "Flexible buy, rent, lease and support options",
];

export default function WindsorOverviewSection() {
  return (
    <SectionWrapper
      eyebrow="Windsor overview"
      title="Refurbished Canon Photocopiers & Printers in Windsor Berkshire"
      intro="A dedicated Windsor landing page for refurbished Canon photocopiers, office printers, servicing, rentals, toners and parts."
      className="bg-[#f7f9fb]"
    >
      <div className="rounded-lg border border-black/10 bg-white p-5 shadow-[0_16px_42px_rgba(15,23,42,0.06)] sm:p-7 lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
          <div className="rounded-lg border border-black/10 bg-[#f9fbfc] p-5 sm:p-7">
            <div className="space-y-5 text-base leading-7 text-black/72 sm:text-lg sm:leading-8">
              <p>
                Looking for reliable refurbished Canon photocopiers and office printers in Windsor
                Berkshire? BuySupply Ltd are trusted specialists in refurbished Canon photocopiers,
                Canon office printers, multifunction printers, genuine Canon toners, inks and parts,
                supplying businesses throughout Windsor, Slough, Maidenhead, Ascot, Berkshire and
                West London.
              </p>
              <p>
                Established since 2001, BuySupply Ltd provide professionally refurbished Canon
                photocopiers with delivery, installation, servicing, maintenance and ongoing support.
                Every Canon copier is fully tested and prepared by manufacturer-trained technicians
                from our dedicated workshop facility near Slough Trading Estate.
              </p>
              <div className="grid gap-3 border-y border-black/10 py-4 sm:grid-cols-3">
                {trustPoints.map((point) => (
                  <div key={point} className="flex gap-2 text-sm font-semibold leading-6 text-black/68">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[var(--brand-cyan)]" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
              <p>
                We help businesses reduce office printing costs by supplying reliable refurbished
                Canon office equipment at significantly lower prices compared to new machines,
                without compromising on quality, reliability or performance.
              </p>
              <p>
                Whether you are looking to buy, rent, lease, upgrade or maintain a Canon photocopier,
                BuySupply provide flexible office printing solutions for businesses of all sizes
                across Windsor Berkshire and surrounding areas.
              </p>
            </div>
          </div>

          <aside className="rounded-lg border border-[rgba(0,207,255,0.24)] bg-white p-5 shadow-sm sm:p-6">
            <div className="h-0.5 w-12 rounded-full bg-[var(--brand-cyan)]" />
            <h3 className="mt-4 text-xl font-bold text-black">Local service highlights</h3>
            <p className="mt-2 text-sm leading-6 text-black/60">
              Core Windsor support points for Canon equipment, installation and ongoing service.
            </p>
            <div className="mt-5 grid gap-3">
              {highlights.map(({ icon: Icon, label }, index) => (
                <AnimatedCard
                  key={label}
                  className="location-check-item flex items-center gap-3 rounded-lg border border-black/10 bg-white px-4 py-3 shadow-sm"
                  delay={index * 0.06}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgba(0,207,255,0.1)]">
                    <Icon className="h-5 w-5 text-[var(--brand-cyan)]" />
                  </span>
                  <span className="text-sm font-bold leading-6 text-black/75">{label}</span>
                </AnimatedCard>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </SectionWrapper>
  );
}
