import NavBar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-black text-white min-h-screen font-myriad">
      <NavBar />

      <section className="min-h-screen bg-black flex flex-col items-center justify-start pt-8 sm:pt-12 md:pt-16 px-4 text-center">
        <Image
          src={"/logo.png"}
          width={140}
          height={150}
          alt="BUYSUPPLY Logo"
          priority
          sizes="(max-width: 640px) 140px, (max-width: 768px) 150px, 170px"
          className="w-[140px] sm:w-[150px] md:w-[170px] h-auto mb-6 sm:mb-8"
        />

        <h1 className="font-[900] font-myriad text-white tracking-[2px] leading-tight text-[41px] sm:text-[52px] md:text-[68px] mb-2 ">
          BUYSUPPLY
        </h1>

        <p className="mt-2 text-[16px] sm:text-[22px] md:text-[28px] font-semibold text-white leading-snug sm:leading-normal max-w-[90%] sm:max-w-[720px] font-myriad">
          Buying & Supplying in the Office Industry
          Since 2001
        </p>

        <p className="mt-5 text-[14px] sm:text-[16px] md:text-[18px] text-white/70 max-w-[90%] sm:max-w-[640px] mx-auto leading-relaxed font-myriad">
          We buy & sell photocopiers, printers, peripherals, toners, ink, and consumables.
        </p>

        <section className="mt-10 sm:mt-14 flex flex-col items-center">
          <h2 className="text-white font-semibold text-[15px] sm:text-[28px] md:text-[36px] mb-6 sm:mb-8 font-myriad">
            PRESS HERE FOR STOCK
          </h2>
          <div className="flex flex-col sm:flex-row gap-8 sm:gap-16 items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <span className="text-white/80 text-[10px] sm:text-[14px] md:text-[16px] font-medium tracking-wider uppercase text-center">
                Printers & Photocopiers
              </span>
              <Link
                href="/products?category=photocopiers"
                className="w-[62px] h-[62px] sm:w-[75px] sm:h-[75px] md:w-[85px] md:h-[85px]
                 rounded-full transition-all duration-300
                 hover:scale-105 active:scale-95 shadow-lg overflow-hidden"
              >
                <Image
                  src="/button.png"
                  alt="Printers & Copier"
                  width={85}
                  height={85}
                  sizes="(max-width: 640px) 62px, (max-width: 768px) 75px, 85px"
                  className="w-full h-full object-cover"
                />
              </Link>
              <span className="text-white/70 text-[8px] sm:text-[13px] md:text-[14px]">Start</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <span className="text-white/80 text-[10px] sm:text-[14px] md:text-[16px] font-medium tracking-wider uppercase text-center">
                Consumables
              </span>
              <Link
                href="/products?category=consumables"
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
              <span className="text-white/70 text-[8px] sm:text-[13px] md:text-[14px]">Start</span>
            </div>
          </div>
        </section>
      </section>

      <section className="border-t border-white/10 px-4 py-14 sm:py-16">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-5">About Us</h2>
          <p className="text-white/75 text-sm sm:text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
            BuySupply is a trusted UK office equipment partner focused on buying, supplying, and supporting
            photocopiers, printers, and consumables. Our team combines market knowledge with practical service to help
            businesses move stock quickly and confidently.
          </p>
        </div>
      </section>

      <section className="border-t border-white/10 px-4 pb-16 sm:pb-20 pt-14 sm:pt-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-5 text-center">Sell To Us</h2>
          <p className="text-white/75 text-sm sm:text-base md:text-lg leading-relaxed text-center max-w-3xl mx-auto">
            Have used photocopiers, printers, or surplus toner? We offer competitive prices, fast UK-wide collection,
            and quick payment.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/sell-to-us"
              className="bg-white text-black font-semibold px-6 py-3 rounded-lg hover:bg-white/90 transition-all duration-300"
            >
              Go to Sell To Us Page
            </Link>
            <Link
              href="#contact-home"
              className="border border-white/25 text-white px-6 py-3 rounded-lg hover:border-white/45 hover:text-white transition-all duration-300"
            >
              Contact Our Team
            </Link>
          </div>
        </div>
      </section>

      <section id="contact-home" className="border-t border-white/10 mt-0 pt-16 pb-16 px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Get In Touch</h2>
        <p className="text-white/60 mb-8">
          Ready to buy, sell, or partner with us? Contact our team today.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-10 max-w-5xl mx-auto">
          <a
            href="tel:01753971125"
            className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-6 py-4 transition group w-full sm:w-auto"
          >
            <span className="text-2xl">📞</span>
            <div className="text-left">
              <p className="text-white/40 text-xs uppercase tracking-widest mb-0.5">Phone</p>
              <p className="text-white font-semibold">01753 971125</p>
            </div>
          </a>
          <a
            href="mailto:Sales@buysupply.me"
            className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-6 py-4 transition group w-full sm:w-auto"
          >
            <span className="text-2xl">📧</span>
            <div className="text-left">
              <p className="text-white/40 text-xs uppercase tracking-widest mb-0.5">Email</p>
              <p className="text-white font-semibold">Sales@buysupply.me</p>
            </div>
          </a>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
