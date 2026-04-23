import Image from "next/image";
import Link from "next/link";

const links = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "UK Sales", href: "/uk-sales" },
  { label: "Export Sales", href: "/export-sales" },
  { label: "Leasing", href: "/leasing" },
  { label: "Collection & Storage", href: "/collection-storage" },
  { label: "Sell To Us", href: "/sell-to-us" },
];

export default function SiteFooter() {
  return (
    <footer className="bg-black/90 text-white py-12 font-myriad border-t border-white/10">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex flex-col items-start">
          <Image
            width={150}
            height={60}
            src={"/footer.svg"}
            alt="BuySupply Logo"
            className="w-full max-w-[150px] h-auto object-contain mb-4"
          />
          <p className="text-white/60 text-sm">
            Buying and supplying photocopiers, printers, and consumables across the UK.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-white/70 text-sm">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-white transition">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Contact Us</h3>
          <p className="text-white/70 text-sm">Sales@buysupply.me</p>
          <p className="text-white/70 text-sm mt-0.5">01753971125</p>
        </div>
      </div>
      <div className="mt-8 text-center text-xs text-white/50">
        &copy; 2026 buysupply. All rights reserved.
      </div>
    </footer>
  );
}
