import Image from "next/image";
import Link from "next/link";

type LocalHeroProps = {
  title: string;
};

export default function LocalHero({ title }: LocalHeroProps) {
  return (
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
        BUYSUPPLY
      </h1>

      <p className="mt-2 text-[16px] sm:text-[22px] md:text-[28px] font-semibold text-black leading-snug sm:leading-normal max-w-[90%] sm:max-w-[720px] font-myriad">
        Buying & Supplying in the Office Industry Since 2001
      </p>

      <p className="mt-5 text-[14px] sm:text-[16px] md:text-[18px] text-black/70 max-w-[90%] sm:max-w-[780px] mx-auto leading-relaxed font-myriad">
        {title}
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
              href="/products?category=photocopiers"
              className="w-[62px] h-[62px] sm:w-[75px] sm:h-[75px] md:w-[85px] md:h-[85px] rounded-full transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg overflow-hidden"
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
            <span className="text-black/70 text-[8px] sm:text-[13px] md:text-[14px]">Start</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <span className="text-black/80 text-[10px] sm:text-[14px] md:text-[16px] font-medium tracking-wider uppercase text-center">
              Parts and Toner
            </span>
            <Link
              href="/products?category=consumables"
              className="w-[62px] h-[62px] sm:w-[75px] sm:h-[75px] md:w-[85px] md:h-[85px] rounded-full transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg overflow-hidden"
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
            <span className="text-black/70 text-[8px] sm:text-[13px] md:text-[14px]">Start</span>
          </div>
        </div>
      </section>
    </section>
  );
}
