import { BadgePercent, CheckCircle2, Handshake, PrinterCheck, ShieldCheck } from "lucide-react";
import { savingsBenefits } from "../data";
import AnimatedCard from "./AnimatedCard";
import SectionWrapper from "./SectionWrapper";

const savingsValues = [
  {
    icon: BadgePercent,
    title: "Lower upfront cost",
    detail: "Refurbished supply helps reduce office printing costs compared to new machines.",
  },
  {
    icon: ShieldCheck,
    title: "Professionally refurbished",
    detail: "Prepared, checked and configured for dependable business use.",
  },
  {
    icon: PrinterCheck,
    title: "Reliable Canon performance",
    detail: "Professional print quality without stepping away from proven Canon equipment.",
  },
  {
    icon: Handshake,
    title: "Flexible supply & support",
    detail: "Purchase, rental, servicing and maintenance options can work together.",
  },
];

export default function CostSavingSection() {
  return (
    <SectionWrapper
      eyebrow="Cost saving"
      title="Refurbished Canon Photocopiers Save Businesses Money"
      intro="A practical way for Windsor businesses to reduce print costs while keeping professional Canon print quality."
      className="bg-[#f7f9fb]"
    >
      <div className="rounded-lg border border-black/10 bg-white p-5 shadow-[0_18px_48px_rgba(15,23,42,0.07)] sm:p-7 lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div className="self-start rounded-lg border border-black bg-black p-6 text-white shadow-[0_18px_45px_rgba(0,0,0,0.14)] sm:p-7">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--brand-cyan)]">
              Savings value
            </p>
            <p className="mt-4 text-3xl font-black leading-tight">
              Save up to 70% versus purchasing new Canon equipment.
            </p>
            <p className="mt-5 leading-7 text-white/75">
              More businesses across Windsor Berkshire and West London are now choosing
              refurbished Canon photocopiers instead of expensive new office printers.
            </p>
            <p className="mt-4 leading-7 text-white/75">
              Refurbished Canon photocopiers provide excellent reliability, professional print
              quality and significantly lower purchase costs compared to new devices.
            </p>
            <div className="mt-6 rounded-lg border border-white/15 bg-white/[0.08] p-4">
              <p className="text-sm font-bold leading-6 text-white">
                Better value for Windsor office printing without compromising Canon capability.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {savingsValues.map(({ icon: Icon, title, detail }, index) => (
              <AnimatedCard
                as="article"
                key={title}
                className="location-check-item flex min-h-[150px] flex-col rounded-lg border border-black/10 bg-white p-5 shadow-sm lg:min-h-[248px] lg:p-6"
                delay={index * 0.06}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-[rgba(0,207,255,0.2)] bg-[rgba(0,207,255,0.08)] shadow-sm">
                  <Icon className="h-4 w-4 text-[var(--brand-cyan)]" />
                </span>
                <h3 className="mt-5 text-lg font-bold leading-6 text-black">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-black/65">{detail}</p>
              </AnimatedCard>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-[rgba(0,207,255,0.24)] bg-[#fbfeff] p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-2 border-b border-black/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-black/45">
                Savings benefits
              </p>
              <p className="mt-2 text-base leading-7 text-black/65">
                Practical advantages for refurbished Canon photocopiers and office printing support.
              </p>
            </div>
          </div>
          <ul className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {savingsBenefits.map((benefit, index) => (
              <AnimatedCard
                as="li"
                key={benefit}
                className="location-check-item flex items-start gap-2.5 rounded-lg border border-black/10 bg-white px-3 py-3 text-sm font-semibold leading-6 text-black/70 shadow-sm"
                delay={Math.min(index, 5) * 0.05}
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[rgba(0,207,255,0.1)]">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[var(--brand-cyan)]" />
                </span>
                <span>{benefit}</span>
              </AnimatedCard>
            ))}
          </ul>
        </div>

        <div className="mt-5 flex flex-col gap-3 rounded-lg border border-black/10 bg-[#f7f9fb] p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-base leading-7 text-black/72 sm:text-lg">
            BuySupply help businesses across Berkshire reduce operational costs whilst maintaining
            high-quality office printing performance.
          </p>
          <span className="inline-flex w-fit shrink-0 rounded-full border border-[rgba(0,207,255,0.3)] bg-white px-4 py-2 text-sm font-bold text-black/70 shadow-sm">
            Refurbished Canon value
          </span>
        </div>
      </div>
    </SectionWrapper>
  );
}
