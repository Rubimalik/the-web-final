import Image from "next/image";
import Link from "next/link";

const links = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Products", href: "/products" },
  { label: "Contact Us", href: "/contact" },
  { label: "Cart", href: "/cart" },
  { label: "Get a Quote", href: "/about#sell-to-us" },
];

export default function SiteFooter() {
  return (
    <footer className="bg-black text-white py-12 font-myriad border-t border-black">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex flex-col items-start">
          <Image
            width={150}
            height={60}
            src={"/footer.svg"}
            alt="BuySupply Logo"
            className="w-full max-w-[150px] h-auto object-contain mb-4"
          />
          <p className="text-white/70 text-sm">
            Buying and supplying photocopiers, printers, and consumables across the UK.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-3 text-white">Quick Links</h3>
          <ul className="space-y-2 text-white/85 text-sm">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="brand-accent-link">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-3 text-white">Contact Us</h3>
          <a
            href="mailto:sales@buysupply.me"
            className="block text-white/80 text-sm hover:text-[var(--brand-pink-hover)] transition-colors duration-250 ease-in-out"
          >
            Sales@buysupply.me
          </a>
          <a
            href="tel:01753971125"
            className="mt-0.5 block text-white/80 text-sm hover:text-[var(--brand-pink-hover)] transition-colors duration-250 ease-in-out"
          >
            01753971125
          </a>
        </div>
      </div>
      <div className="mt-8 text-center text-xs text-white/60">
        &copy; 2026 buysupply. All rights reserved.
      </div>
    </footer>
  );
}
