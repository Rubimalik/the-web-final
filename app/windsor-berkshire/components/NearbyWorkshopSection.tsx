import { MapPinned, PackageCheck, Truck, Wrench } from "lucide-react";
import IconCard from "./IconCard";
import SectionWrapper from "./SectionWrapper";

export default function NearbyWorkshopSection() {
  return (
    <SectionWrapper
      eyebrow="Nearby workshop"
      title="Slough Trading Estate Photocopier Specialists"
      intro="A local workshop position that helps BuySupply support Windsor businesses quickly and efficiently."
    >
      <div className="grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">
        <div className="rounded-lg border border-[rgba(0,207,255,0.24)] bg-[#f7f9fb] p-5 shadow-sm sm:p-6">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-white shadow-sm">
            <MapPinned className="h-5 w-5 text-[var(--brand-cyan)]" />
          </span>
          <p className="mt-4 text-sm font-bold uppercase tracking-[0.16em] text-black/45">
            Workshop access
          </p>
          <h3 className="mt-2 text-2xl font-bold leading-tight text-black">
            Close support for Windsor and nearby business areas.
          </h3>
          <p className="mt-3 text-base leading-7 text-black/68">
            Operating close to Slough Trading Estate, BuySupply are ideally positioned to support
            businesses throughout Windsor Berkshire and surrounding areas quickly and efficiently.
          </p>
        </div>
        <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <IconCard icon={Truck} title="Fast regional support">
            <p>
              Operating close to Slough Trading Estate, BuySupply are ideally positioned to support
              businesses throughout Windsor Berkshire and surrounding areas quickly and efficiently.
            </p>
          </IconCard>
          <IconCard icon={Wrench} title="Workshop preparation">
            <p>
              Our dedicated workshop facility allows us to professionally refurbish, test and
              prepare Canon photocopiers before delivery.
            </p>
          </IconCard>
          <IconCard icon={PackageCheck} title="Delivery and collection">
            <p>
              We regularly deliver and collect photocopiers throughout Berkshire, Buckinghamshire,
              Surrey, Hampshire, London and surrounding regions using our own transport network and
              logistics partners.
            </p>
          </IconCard>
        </div>
      </div>
    </SectionWrapper>
  );
}
