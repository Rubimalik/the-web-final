"use client"

import { useState } from "react"
import { Menu, ShoppingCart, X } from "lucide-react"
import Link from "next/link"
import { useCart } from "@/components/CartProvider"
import ProfileMenu from "@/components/auth/ProfileMenu"

const navLinks = [
    { label: "HOME", href: "/" },
    { label: "UK Sales", href: "/uk-sales" },
    { label: "Export Sales", href: "/export-sales" },
    { label: "Leasing", href: "/leasing" },
    { label: "Photocopier Rental", href: "/photocopier-rental" },
    { label: "Collection & Storage", href: "/collection-storage" },
    { label: "Sell To Us", href: "/sell-to-us" },
    { label: "PRODUCTS", href: "/products" },
    { label: "CONTACT US", href: "/contact" },
]

export default function MobileNav() {
    const [menuOpen, setMenuOpen] = useState(false)
    const { itemCount, cartPulseKey } = useCart()

    return (
        <div className="w-full relative">

            {/* ── Top bar: logo + hamburger ── */}
            <div className="w-full flex items-center justify-between">

                {/* Logo */}
                <Link
                    href="/"
                    className="font-extrabold tracking-wide transition-opacity duration-300 hover:opacity-80 brand-title text-lg sm:text-xl"
                >
                    BuySupply
                </Link>

                <div className="flex items-center gap-2">
                    <Link
                        href="/cart"
                        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/20 text-black/80 transition-colors duration-250 ease-in-out hover:border-[var(--brand-pink-hover)] hover:text-[var(--brand-pink-hover)]"
                        aria-label="Open cart"
                    >
                        <ShoppingCart size={16} />
                        {itemCount > 0 && (
                            <span
                                key={cartPulseKey}
                                className="absolute -right-1.5 -top-1.5 min-w-5 h-5 px-1 rounded-full bg-[var(--brand-pink-hover)] text-black text-[10px] leading-5 font-bold text-center animate-[pulse_300ms_ease]"
                            >
                                {itemCount}
                            </span>
                        )}
                    </Link>

                    <ProfileMenu />
                    {/* Hamburger — animates between ☰ and ✕ */}
                    <button
                        onClick={() => setMenuOpen((prev) => !prev)}
                        className="text-black/70 hover:text-[var(--brand-pink-hover)] transition-all duration-300 p-1"
                        aria-label={menuOpen ? "Close menu" : "Open menu"}
                    >
                        <span
                            className="block transition-all duration-300"
                            style={{
                                opacity: menuOpen ? 0 : 1,
                                transform: menuOpen ? "rotate(90deg) scale(0.5)" : "rotate(0deg) scale(1)",
                                position: menuOpen ? "absolute" : "relative",
                            }}
                        >
                            <Menu size={22} />
                        </span>
                        <span
                            className="block transition-all duration-300"
                            style={{
                                opacity: menuOpen ? 1 : 0,
                                transform: menuOpen ? "rotate(0deg) scale(1)" : "rotate(-90deg) scale(0.5)",
                                position: menuOpen ? "relative" : "absolute",
                            }}
                        >
                            <X size={22} />
                        </span>
                    </button>
                </div>
            </div>

            {/* ── Dropdown with slide + fade ── */}
            {menuOpen && (
                <div
                    className="absolute top-full left-0 w-full bg-white/95 backdrop-blur-sm border-t border-black/10 px-4 pb-5 z-50 overflow-hidden"
                    style={{
                        transition: "opacity 300ms ease, transform 300ms ease",
                        opacity: 1,
                        transform: "translateY(0)",
                    }}
                >
                    <ul className="flex flex-col pt-2">
                        {navLinks.map((link, i) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    onClick={() => setMenuOpen(false)}
                                    className="block text-black/75 hover:text-[var(--brand-pink-hover)] py-3 border-b border-black/5 font-bold
                                               transition-colors duration-200 hover:pl-1"
                                    style={{
                                        fontSize: "clamp(15px, 4.1vw, 19px)",
                                        transitionProperty: "color, padding-left, opacity, transform",
                                        transitionDuration: "200ms",
                                        opacity: 1,
                                        transform: "translateX(0)",
                                        transitionDelay: `${i * 50}ms`,
                                    }}
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {/* Mobile CTA */}
                    <Link
                        href="/sell-to-us"
                        onClick={() => setMenuOpen(false)}
                        className="mt-4 flex items-center justify-center brand-button py-2.5 rounded
                                   transition-all duration-300 hover:scale-[1.02] active:scale-95 w-full"
                        style={{
                            fontSize: "clamp(12px, 3.5vw, 14px)",
                            opacity: 1,
                            transform: "translateY(0)",
                            transitionDelay: `${navLinks.length * 50}ms`,
                        }}
                    >
                        Get a Quote
                    </Link>
                </div>
            )}

        </div>
    )
}
