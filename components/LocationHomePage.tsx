import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import NavBar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";

interface LocationHomePageProps {
  heroTitle: string;
  tagline: string;
  locationSpecificParagraph: string;
  printersLink: string;
  consumablesLink: string;
  featuredSection: ReactNode;
  sellToUsHref: string;
  contactHref: string;
  contactLabel: string;
  showNavigation?: boolean;
  showFooter?: boolean;
}

export default function LocationHomePage({
  heroTitle,
  tagline,
  locationSpecificParagraph,
  printersLink,
  consumablesLink,
  featuredSection,
  sellToUsHref,
  contactHref,
  contactLabel,
  showNavigation = false,
  showFooter = false,
}: LocationHomePageProps) {
  const reasons = [
    "UK’s No.1 independent refurbished Canon reseller",
    "Established since 2001",
    "Canon photocopier specialists",
    "Slough Trading Estate coverage",
    "Nationwide UK delivery",
    "Fully refurbished & tested systems",
    "Flexible copier rental options",
    "Genuine Canon toners & consumables",
    "UK & export specialists",
  ];

  return (
    <div className="bg-white text-black min-h-screen font-myriad">
      {showNavigation && <NavBar />}

      <section className="min-h-screen bg-white flex flex-col items-center justify-start pt-8 sm:pt-12 md:pt-16 px-4 text-center">
        <Image
          src="/logo.png"
          width={140}
          height={150}
          alt="BUYSUPPLY Logo"
          priority
          sizes="(max-width: 640px) 140px, (max-width: 768px) 150px, 170px"
          className="w-[140px] sm:w-[150px] md:w-[170px] h-auto mb-6 sm:mb-8"
        />

        <h1 className="font-[900] font-myriad brand-title tracking-[2px] leading-tight text-[41px] sm:text-[52px] md:text-[68px] mb-2">
          {heroTitle}
        </h1>

        <p className="mt-2 text-[16px] sm:text-[22px] md:text-[28px] font-semibold text-black leading-snug sm:leading-normal max-w-[90%] sm:max-w-[720px] font-myriad">
          Buying & Supplying in the Office Industry Since 2001
        </p>

        <p className="mt-5 text-[14px] sm:text-[16px] md:text-[18px] text-black/70 max-w-[90%] sm:max-w-[640px] mx-auto leading-relaxed font-myriad">
          {tagline}
        </p>

        <section className="mt-10 sm:mt-14 flex flex-col items-center">
          <h2 className="text-black font-semibold text-[15px] sm:text-[28px] md:text-[36px] mb-6 sm:mb-8 font-myriad">
            PRESS HERE FOR STOCK
          </h2>
          <div className="flex flex-col sm:flex-row gap-8 sm:gap-16 items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <span className="text-black/80 text-[10px] sm:text-[14px] md:text-[16px] font-medium tracking-wider uppercase text-center">
                Printers
              </span>
              <Link
                href={printersLink}
                className="w-[62px] h-[62px] sm:w-[75px] sm:h-[75px] md:w-[85px] md:h-[85px]
                 rounded-full transition-all duration-300
                 hover:scale-105 active:scale-95 shadow-lg overflow-hidden"
              >
                <Image
                  src="/button.png"
                  alt="Printers"
                  width={85}
                  height={85}
                  sizes="(max-width: 640px) 62px, (max-width: 768px) 75px, 85px"
                  className="w-full h-full object-cover"
                />
              </Link>
              <span className="text-black/70 text-[8px] sm:text-[13px] md:text-[14px]">
                Start
              </span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <span className="text-black/80 text-[10px] sm:text-[14px] md:text-[16px] font-medium tracking-wider uppercase text-center">
                Parts and Toner
              </span>
              <Link
                href={consumablesLink}
                className="w-[62px] h-[62px] sm:w-[75px] sm:h-[75px] md:w-[85px] md:h-[85px]
                 rounded-full transition-all duration-300
                 hover:scale-105 active:scale-95 shadow-lg overflow-hidden"
              >
                <Image
                  src="/button.png"
                  alt="Consumables"
                  width={85}
                  height={85}
                  sizes="(max-width: 640px) 62px, (max-width: 768px) 75px, 85px"
                  className="w-full h-full object-cover"
                />
              </Link>
              <span className="text-black/70 text-[8px] sm:text-[13px] md:text-[14px]">
                Start
              </span>
            </div>
          </div>
        </section>
      </section>

      <section className="border-t border-black/10 px-4 py-16 sm:py-18 md:py-20">
        <div className="location-content-reveal max-w-5xl mx-auto">
          <h2 className="text-center text-3xl md:text-4xl font-bold mb-8 brand-title">
            About Us
          </h2>
          <div className="location-content-step mx-auto max-w-4xl space-y-6 text-black/75 text-[15px] sm:text-base md:text-[17px] leading-7 sm:leading-8">
            <p>
              BuySupply are the UK’s No.1 independent reseller of reconditioned and refurbished Canon photocopiers, supplying businesses nationwide with professionally refurbished Canon multifunction printers, office photocopiers and print solutions since 2001.
            </p>
            <p>{locationSpecificParagraph}</p>
            <p>
              We proudly supply businesses throughout{" "}
              <Link href="/slough-berkshire" className="brand-accent-link">
                Slough
              </Link>
              ,{" "}
              <Link href="/slough-trading-estate" className="brand-accent-link">
                Slough Trading Estate
              </Link>
              , Burnham,{" "}
              <Link href="/maidenhead-berkshire" className="brand-accent-link">
                Maidenhead
              </Link>
              ,{" "}
              <Link href="/windsor-berkshire" className="brand-accent-link">
                Windsor
              </Link>
              ,{" "}
              <Link href="/ascot-berkshire" className="brand-accent-link">
                Ascot
              </Link>
              ,{" "}
              <Link href="/reading-berkshire" className="brand-accent-link">
                Reading
              </Link>
              ,{" "}
              <Link href="/heathrow-airport" className="brand-accent-link">
                Heathrow
              </Link>
              , West London and the entire UK with nationwide delivery, installation and ongoing support available.
            </p>
            <p>
              Whether you are looking to buy a refurbished Canon photocopier in{" "}
              <Link href="/maidenhead-berkshire" className="brand-accent-link">
                Maidenhead
              </Link>
              , rent a Canon printer in{" "}
              <Link href="/ascot-berkshire" className="brand-accent-link">
                Ascot
              </Link>
              , source office photocopiers near{" "}
              <Link href="/slough-trading-estate" className="brand-accent-link">
                Slough Trading Estate
              </Link>
              {" "}or upgrade your office print equipment anywhere in the UK, BuySupply provide reliable equipment, competitive pricing and expert support backed by decades of industry experience.
            </p>
          </div>

          <div className="location-content-step location-content-step-delay-1 mt-10 sm:mt-12 brand-surface rounded-lg p-5 sm:p-7">
            <h3 className="text-center sm:text-left text-lg sm:text-xl font-bold text-black">
              Why businesses choose BuySupply.me:
            </h3>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {reasons.map((reason) => (
                <li
                  key={reason}
                  className="location-check-item flex items-start gap-3 rounded-md border border-black/10 bg-white/80 px-4 py-3 text-sm sm:text-base text-black/75"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--brand-cyan)]"
                  />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="location-content-step location-content-step-delay-2 mt-10 sm:mt-12 text-center text-xl sm:text-2xl font-bold tracking-wide brand-title">
            Buy • Sell • Supply • Export
          </p>
        </div>
      </section>

      {featuredSection}

      <section className="border-t border-black/10 px-4 pb-16 sm:pb-20 pt-14 sm:pt-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-5 text-center brand-title">
            Sell To Us
          </h2>
          <p className="text-black/75 text-sm sm:text-base md:text-lg leading-relaxed text-center max-w-3xl mx-auto">
            Have used photocopiers, printers, or surplus toner? We offer
            competitive prices, fast UK-wide collection, and quick payment.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href={sellToUsHref}
              className="brand-button px-6 py-3 rounded-lg transition-all duration-300"
            >
              Go to Sell To Us Section
            </Link>
            <Link
              href={contactHref}
              className="border border-black/25 text-black px-6 py-3 rounded-lg hover:border-[var(--brand-cyan)] hover:text-[var(--brand-cyan)] transition-all duration-300"
            >
              {contactLabel}
            </Link>
          </div>
        </div>
      </section>

      {showFooter && <SiteFooter />}
    </div>
  );
}
