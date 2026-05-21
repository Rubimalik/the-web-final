import Image from "next/image";
import Link from "next/link";

const links = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Products", href: "/products" },
  { label: "Contact Us", href: "/contact" },
  { label: "Cart", href: "/cart" },
  { label: "Get a Quote", href: "/sell-to-us#sell-form" },
];

const footerLinks = [...links];

const socialLinks = [
  {
    label: "Visit BuySupply on Facebook",
    href: "https://www.facebook.com/100091758102794/",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
        <path d="M13.5 21v-7.8h2.6l.4-3h-3V8.3c0-.9.2-1.5 1.5-1.5h1.6V4.1c-.8-.1-1.5-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21h3.1Z" />
      </svg>
    ),
  },
  {
    label: "Visit BuySupply on Instagram",
    href: "https://www.instagram.com/buysupply1/",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none">
        <rect
          width="15.5"
          height="15.5"
          x="4.25"
          y="4.25"
          rx="4.2"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <circle cx="12" cy="12" r="3.6" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="16.55" cy="7.45" r="1.05" fill="currentColor" />
      </svg>
    ),
  },
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
            {footerLinks.map((link) => (
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
          <h3 className="mt-4 font-semibold mb-3 text-white">Social Links</h3>
          <div className="flex flex-wrap gap-3 text-sm">
            {socialLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
                className="inline-flex h-9 w-9 items-center justify-center text-white/80 hover:text-[var(--brand-pink-hover)] transition-colors duration-250 ease-in-out"
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-6 text-center text-xs text-white/60">
        &copy; 2026 buysupply. All rights reserved.
      </div>
    </footer>
  );
}
