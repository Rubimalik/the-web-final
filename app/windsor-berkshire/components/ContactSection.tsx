import { Mail, PackageCheck, Phone } from "lucide-react";
import Link from "next/link";
import AnimatedSection from "./AnimatedSection";

export default function ContactSection() {
  return (
    <section className="border-t border-black/10 bg-[#f7f9fb] px-4 py-14 sm:py-20">
      <AnimatedSection className="mx-auto max-w-6xl rounded-lg border border-black/10 bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-[rgba(0,207,255,0.3)] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand-pink-hover)]">
              Windsor Canon support
            </p>
            <h2 className="text-3xl font-bold leading-tight text-black sm:text-4xl">Contact BuySupply</h2>
            <p className="mt-5 text-lg leading-8 text-black/75">
              For refurbished Canon photocopiers, Canon office printers, photocopier rentals,
              servicing, toners and parts in Windsor Berkshire, contact BuySupply Ltd today.
            </p>
            <p className="mt-5 text-lg leading-8 text-black/75">
              BuySupply Ltd supply refurbished Canon photocopiers, office printers, Canon
              multifunction printers, toner cartridges, photocopier rentals and managed print
              solutions throughout Windsor Berkshire, Slough, Maidenhead, Ascot, Burnham, Reading
              and West London.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a href="tel:01753971125" className="brand-button inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3">
                <Phone className="h-4 w-4" />
                Call 01753 971125
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-lg border border-black/20 bg-white px-6 py-3 font-bold text-black transition hover:border-[var(--brand-cyan)] hover:text-[var(--brand-pink-hover)]"
              >
                Contact BuySupply
              </Link>
            </div>
          </div>
          <div className="space-y-3 rounded-lg border border-black bg-black p-5 text-white shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--brand-cyan)]">
              Contact routes
            </p>
            <a href="tel:01753971125" className="flex items-center gap-3 rounded-lg border border-white/10 px-3 py-3 font-bold text-white transition hover:border-[rgba(0,207,255,0.42)]">
              <Phone className="h-5 w-5 text-[var(--brand-cyan)]" />
              Phone: 01753 971125
            </a>
            <a href="mailto:sales@buysupply.me" className="flex items-center gap-3 rounded-lg border border-white/10 px-3 py-3 font-bold text-white transition hover:border-[rgba(0,207,255,0.42)]">
              <Mail className="h-5 w-5 text-[var(--brand-cyan)]" />
              Email: sales@buysupply.me
            </a>
            <a href="https://www.buysupply.me" className="flex items-center gap-3 rounded-lg border border-white/10 px-3 py-3 font-bold text-white transition hover:border-[rgba(0,207,255,0.42)]">
              <PackageCheck className="h-5 w-5 text-[var(--brand-cyan)]" />
              Website: www.buysupply.me
            </a>
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
}
