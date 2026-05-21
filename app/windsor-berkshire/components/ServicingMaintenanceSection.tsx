import { CircleGauge, Settings2, Wrench } from "lucide-react";
import { servicingSolutions, supportedCanonSystems } from "../data";
import CheckList from "./CheckList";
import SectionWrapper from "./SectionWrapper";

export default function ServicingMaintenanceSection() {
  return (
    <SectionWrapper
      eyebrow="Service support"
      title="Canon Printer Servicing & Maintenance"
      intro="Canon servicing, maintenance and repair support for businesses across Windsor Berkshire and surrounding areas."
      className="bg-[#f7f9fb]"
    >
      <div className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_0.78fr]">
          <div className="rounded-lg border border-black/10 bg-white p-5 text-base leading-7 text-black/72 shadow-sm sm:p-6 sm:text-lg sm:leading-8">
            <p>
              BuySupply provide Canon photocopier servicing, printer maintenance and repair support
              throughout Windsor Berkshire and surrounding areas.
            </p>
            <p className="mt-4">
              Our experienced technicians support Canon multifunction printers, office photocopiers
              and business printing systems including:
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              { icon: Wrench, label: "Maintenance" },
              { icon: Settings2, label: "Repairs" },
              { icon: CircleGauge, label: "Support" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="rounded-lg border border-black/10 bg-white p-4 shadow-sm">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[rgba(0,207,255,0.1)]">
                  <Icon className="h-4 w-4 text-[var(--brand-cyan)]" />
                </span>
                <p className="mt-3 text-sm font-bold text-black">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <CheckList items={supportedCanonSystems} columns="lg:grid-cols-5" />
        <div className="rounded-lg border border-black/10 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="text-xl font-bold text-black">Our servicing solutions include:</h3>
          <div className="mt-5">
            <CheckList items={servicingSolutions} />
          </div>
        </div>
        <p className="rounded-lg border border-[rgba(0,207,255,0.24)] bg-white p-5 text-base leading-7 text-black/72 shadow-sm sm:text-lg sm:leading-8">
          We aim to keep your business printing efficiently with minimal downtime.
        </p>
      </div>
    </SectionWrapper>
  );
}
