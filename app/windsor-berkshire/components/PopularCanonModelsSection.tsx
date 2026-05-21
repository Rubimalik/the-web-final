import { Printer } from "lucide-react";
import { canonModels } from "../data";
import IconCard from "./IconCard";
import SectionWrapper from "./SectionWrapper";

export default function PopularCanonModelsSection() {
  return (
    <SectionWrapper
      eyebrow="Popular Canon models"
      title="Popular Refurbished Canon Photocopier Models"
      intro="A focused range of Canon imageRUNNER ADVANCE DX models prepared for professional office use."
      className="bg-[#f7f9fb]"
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-4 rounded-lg border border-black/10 bg-white p-5 shadow-sm sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <p className="max-w-3xl text-base leading-7 text-black/70 sm:text-lg">
            Popular refurbished Canon photocopier models we supply include:
          </p>
          <span className="inline-flex w-fit items-center rounded-full border border-[rgba(0,207,255,0.28)] bg-[rgba(0,207,255,0.08)] px-4 py-2 text-sm font-bold text-black/70">
            Canon imageRUNNER ADVANCE DX
          </span>
        </div>
        <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {canonModels.map((model) => <IconCard key={model} icon={Printer} title={model} />)}
        </div>
        <div className="grid gap-4 rounded-lg border border-[rgba(0,207,255,0.24)] bg-white p-5 shadow-sm sm:p-6 lg:grid-cols-[1fr_0.65fr] lg:items-center">
          <p className="text-base leading-7 text-black/72 sm:text-lg sm:leading-8">
            Our refurbished Canon photocopiers are professionally cleaned, configured, tested and
            quality checked before delivery, helping businesses save up to 70% versus purchasing
            new Canon equipment.
          </p>
          <p className="rounded-lg bg-[#f7f9fb] p-4 text-sm font-semibold leading-6 text-black/65">
            All machines are inspected and prepared by experienced engineers before installation.
          </p>
        </div>
      </div>
    </SectionWrapper>
  );
}
