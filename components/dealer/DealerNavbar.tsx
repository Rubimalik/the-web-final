"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Mail, Menu, Phone, ShoppingCart, X } from "lucide-react";
import DealerProfileMenu from "@/components/dealer/DealerProfileMenu";
import { useDealerCart } from "@/components/dealer/DealerCartProvider";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", href: "/dealer" },
  { label: "Products", href: "/dealer/products" },
  { label: "Contact Us", href: "mailto:sales@buysupply.me" },
];

const aboutLinks = [
  { label: "UK Sales", href: "/dealer/uk-sales" },
  { label: "Export Sales", href: "/dealer/export-sales" },
  { label: "Leasing", href: "/dealer/leasing" },
  { label: "Photocopier Rental", href: "/dealer/photocopier-rental" },
  { label: "Collection & Storage", href: "/dealer/collection-storage" },
  { label: "Sell To Us", href: "/dealer/sell-to-us" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/dealer") {
    return pathname === "/dealer";
  }
  if (href === "/dealer/products") {
    return pathname.startsWith("/dealer/products");
  }
  if (href.startsWith("mailto:")) {
    return false;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function DealerNavbar() {
  const pathname = usePathname();
  const { itemCount, cartPulseKey, lastAddedProductName, clearLastAddedProductName } =
    useDealerCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const aboutRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const checkScroll = () => setScrolled(window.scrollY > 20);
    checkScroll();
    window.addEventListener("scroll", checkScroll, { passive: true });
    return () => window.removeEventListener("scroll", checkScroll);
  }, []);

  useEffect(() => {
    if (!aboutOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (aboutRef.current && !aboutRef.current.contains(event.target as Node)) {
        setAboutOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Tab") {
        setAboutOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [aboutOpen]);

  useEffect(() => {
    if (!lastAddedProductName) return;
    const timer = window.setTimeout(() => {
      clearLastAddedProductName();
    }, 1600);
    return () => window.clearTimeout(timer);
  }, [clearLastAddedProductName, lastAddedProductName]);

  return (
    <>
      <header
        className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md transition-all duration-500"
        style={{
          borderColor: scrolled ? "rgba(0,207,255,0.35)" : "rgba(0,207,255,0.2)",
          boxShadow: scrolled ? "0 6px 28px rgba(0,0,0,0.08)" : "none",
        }}
      >
        <div
          className="w-full py-2 px-4 flex items-center justify-center gap-5 sm:gap-8 md:gap-10 transition-all duration-500"
          style={{ borderBottom: "1px solid rgba(0,207,255,0.2)" }}
        >
          <a
            href="tel:01753971125"
            className="flex items-center gap-1.5 text-black/70 hover:text-[var(--brand-pink-hover)] transition-colors duration-300 font-bold"
            style={{ fontSize: "clamp(12px, 2.7vw, 15px)" }}
          >
            <Phone className="h-3.5 w-3.5 brand-icon" />
            <span>01753 971125</span>
          </a>
          <a
            href="mailto:sales@buysupply.me"
            className="flex items-center gap-1.5 text-black/70 hover:text-[var(--brand-pink-hover)] transition-colors duration-300 font-bold"
            style={{ fontSize: "clamp(12px, 2.7vw, 15px)" }}
          >
            <Mail className="h-3.5 w-3.5 brand-icon" />
            <span>Sales@buysupply.me</span>
          </a>
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-6 h-[72px] md:h-[76px] flex items-center justify-between gap-4">
          <Link href="/dealer" className="font-extrabold tracking-wide shrink-0 text-lg md:text-xl leading-none">
            BuySupply
          </Link>

          <nav className="hidden md:flex items-center justify-center gap-7 lg:gap-10 flex-1">
            {navLinks.slice(0, 1).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-black/75 hover:text-[var(--brand-pink-hover)] transition-colors font-bold text-base md:text-[17px]",
                  isActivePath(pathname, link.href) && "text-[var(--brand-pink-hover)]",
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="relative" ref={aboutRef}>
              <button
                type="button"
                onClick={() => setAboutOpen((current) => !current)}
                className={cn(
                  "flex items-center gap-1 text-black/75 hover:text-[var(--brand-pink-hover)] transition-colors font-bold text-base md:text-[17px]",
                  aboutLinks.some((link) => isActivePath(pathname, link.href)) && "text-[var(--brand-pink-hover)]",
                )}
                aria-haspopup="menu"
                aria-expanded={aboutOpen}
              >
                ABOUT
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${aboutOpen ? "rotate-180" : ""}`} />
              </button>

              {aboutOpen ? (
                <div
                  role="menu"
                  className="absolute left-0 top-full mt-2 bg-white shadow-lg rounded-md py-2 min-w-[230px] z-50 border border-black/5"
                >
                  {aboutLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      role="menuitem"
                      onClick={() => setAboutOpen(false)}
                      className="block px-4 py-2 text-sm text-black/70 hover:text-[var(--brand-pink-hover)] hover:bg-gray-50 transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
            {navLinks.slice(1).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-black/75 hover:text-[var(--brand-pink-hover)] transition-colors font-bold text-base md:text-[17px]",
                  isActivePath(pathname, link.href) && "text-[var(--brand-pink-hover)]",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/dealer/cart"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/20 hover:border-[var(--brand-pink-hover)] hover:text-[var(--brand-pink-hover)] transition"
              aria-label="Open cart"
            >
              <ShoppingCart className="h-4 w-4" />
              {itemCount > 0 && (
                <span
                  key={cartPulseKey}
                  className="absolute -right-1.5 -top-1.5 min-w-5 h-5 px-1 rounded-full bg-[var(--brand-pink-hover)] text-black text-[10px] leading-5 font-bold text-center"
                >
                  {itemCount}
                </span>
              )}
            </Link>

            <DealerProfileMenu />

            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/20 text-black/80"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-black/10 bg-white/95 px-4 pb-5">
            <div className="max-w-6xl mx-auto pt-2">
              {navLinks.slice(0, 1).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "block border-b border-black/5 py-3 text-black/75 hover:text-[var(--brand-pink-hover)] font-bold transition-colors",
                    isActivePath(pathname, link.href) && "text-[var(--brand-pink-hover)]",
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={() => setMobileAboutOpen((current) => !current)}
                className="flex w-full items-center justify-between border-b border-black/5 py-3 text-black/75 hover:text-[var(--brand-pink-hover)] font-bold transition-colors"
              >
                <span>ABOUT</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${mobileAboutOpen ? "rotate-180" : ""}`} />
              </button>
              {mobileAboutOpen ? (
                <div className="border-b border-black/5 py-1">
                  {aboutLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => {
                        setMenuOpen(false);
                        setMobileAboutOpen(false);
                      }}
                      className={cn(
                        "block rounded-lg px-3 py-2 text-sm text-black/65 hover:text-[var(--brand-pink-hover)] hover:bg-gray-50 transition-colors",
                        isActivePath(pathname, link.href) && "text-[var(--brand-pink-hover)]",
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              ) : null}
              {navLinks.slice(1).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "block border-b border-black/5 py-3 text-black/75 hover:text-[var(--brand-pink-hover)] font-bold transition-colors",
                    isActivePath(pathname, link.href) && "text-[var(--brand-pink-hover)]",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {lastAddedProductName && (
        <div className="fixed bottom-4 right-4 z-[60] animate-[fadeIn_300ms_ease]">
          <div className="brand-surface rounded-xl px-4 py-2.5 text-sm text-black shadow-[0_10px_40px_rgba(0,0,0,0.12)]">
            Added{" "}
            <span className="text-[var(--brand-cyan)] font-semibold">
              {lastAddedProductName}
            </span>{" "}
            to cart
          </div>
        </div>
      )}
    </>
  );
}
