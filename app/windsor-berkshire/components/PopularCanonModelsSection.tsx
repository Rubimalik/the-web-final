import Image from "next/image";
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
        <div className="grid gap-5 rounded-lg border border-black/10 bg-white p-5 shadow-sm sm:p-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="relative mx-auto flex w-full max-w-sm items-center justify-center overflow-hidden rounded-lg bg-[#f7f9fb] px-4 py-6 sm:px-6 lg:max-w-none">
            <Image
              src="/images/canon-copier-cutout-balanced.png"
              alt="Canon imageRUNNER ADVANCE DX copier product"
              width={980}
              height={1178}
              className="h-auto max-h-[320px] w-full object-contain"
              sizes="(min-width: 1024px) 38vw, (min-width: 640px) 60vw, 88vw"
            />
          </div>
          <div className="space-y-3 text-center lg:text-left">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--brand-cyan)]">
              Featured refurbished range
            </p>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold leading-tight text-black sm:text-3xl">
                imageRUNNER Advance DX
              </h3>
              <p className="text-lg font-semibold leading-7 text-black/68 sm:text-xl">
                C3720i / C3725i / C3730i
              </p>
            </div>
            <p className="mx-auto max-w-xl text-base leading-7 text-black/65 lg:mx-0">
              A realistic product-style view of the Canon copier range commonly selected for
              professional office print, copy and scan workflows.
            </p>
          </div>
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
