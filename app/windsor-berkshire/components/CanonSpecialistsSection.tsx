import {
  BriefcaseBusiness,
  Building2,
  GraduationCap,
  Hotel,
  Landmark,
  Printer,
  School,
  ShoppingBag,
  Stethoscope,
  Store,
  Truck,
  Users,
} from "lucide-react";
import { businessTypes } from "../data";
import AnimatedCard from "./AnimatedCard";
import SectionWrapper from "./SectionWrapper";

const businessIcons = [
  Building2,
  BriefcaseBusiness,
  School,
  Landmark,
  GraduationCap,
  Stethoscope,
  Store,
  ShoppingBag,
  Hotel,
  Truck,
  Users,
  Printer,
];

const stats = [
  { label: "Established", value: "Since 2001" },
  { label: "Specialist focus", value: "Canon" },
  { label: "Coverage", value: "Windsor & Berkshire" },
];

export default function CanonSpecialistsSection() {
  return (
    <SectionWrapper
      eyebrow="Canon specialists"
      title="Canon Photocopier Specialists in Windsor Berkshire"
      intro="BuySupply specialise in refurbished Canon imageRUNNER ADVANCE DX photocopiers and Canon multifunction office printers, offering businesses a cost-effective alternative to expensive new office printing equipment."
    >
      <div className="space-y-7">
        <div className="mx-auto max-w-4xl rounded-lg border border-black/10 bg-white p-5 text-center shadow-sm sm:p-7">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-[rgba(0,207,255,0.1)]">
            <Printer className="h-5 w-5 text-[var(--brand-cyan)]" />
          </span>
          <h3 className="mt-4 text-2xl font-bold leading-tight text-black">
            Reliable Canon copier solutions for professional workplaces.
          </h3>
          <p className="mx-auto mt-3 max-w-3xl text-base leading-7 text-black/65">
            We support businesses that need dependable refurbished Canon photocopiers, office
            printers, parts, toners and ongoing maintenance without the cost of purchasing brand
            new equipment.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {stats.map((item, index) => (
            <AnimatedCard
              key={item.label}
              className="rounded-lg border border-black/10 bg-[#f7f9fb] px-5 py-4 text-center shadow-sm"
              delay={index * 0.07}
            >
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-black/45">
                {item.label}
              </p>
              <p className="mt-1 text-xl font-bold text-black">{item.value}</p>
            </AnimatedCard>
          ))}
        </div>

        <div className="rounded-lg border border-black/10 bg-white p-5 shadow-sm sm:p-7">
          <div className="mx-auto mb-6 max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--brand-cyan)]">
              Sectors we support
            </p>
            <h3 className="mt-2 text-2xl font-bold leading-tight text-black">
              Refurbished Canon photocopiers for local businesses and specialist teams
            </h3>
            <p className="mt-3 text-base leading-7 text-black/60">
              We regularly supply refurbished Canon photocopiers and office printers to:
            </p>
          </div>

          <div className="grid auto-rows-fr gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {businessTypes.map((type, index) => {
              const Icon = businessIcons[index % businessIcons.length];

              return (
                <AnimatedCard
                  key={type}
                  className="location-check-item flex h-full items-center gap-3 rounded-lg border border-black/10 bg-white px-4 py-4 shadow-sm"
                  delay={Math.min(index, 5) * 0.05}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[rgba(0,207,255,0.1)]">
                    <Icon className="h-4 w-4 text-[var(--brand-cyan)]" />
                  </span>
                  <span className="text-sm font-semibold leading-6 text-black/72">{type}</span>
                </AnimatedCard>
              );
            })}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
