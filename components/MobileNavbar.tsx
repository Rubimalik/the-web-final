"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import Link from "next/link"

const navLinks = [
    { label: "Home", href: "/" },
    { label: "UK Sales", href: "/uk-sales" },
    { label: "Export Sales", href: "/export-sales" },
    { label: "Leasing", href: "/leasing" },
    { label: "Photocopier Rental", href: "/photocopier-rental" },
    { label: "Collection & Storage", href: "/collection-storage" },
    { label: "Sell To Us", href: "/sell-to-us" },
]

export default function MobileNav() {
    const [menuOpen, setMenuOpen] = useState(false)

    return (
        <div className="w-full relative">

            {/* ── Top bar: logo + hamburger ── */}
            <div className="w-full flex items-center justify-between">

                {/* Logo */}
                <Link
                    href="/"
                    className="text-white font-bold tracking-wide transition-opacity duration-300 hover:opacity-80"
                    style={{ fontSize: "clamp(14px, 4vw, 18px)" }}
                >
                    BuySupply
                </Link>

                {/* Hamburger — animates between ☰ and ✕ */}
                <button
                    onClick={() => setMenuOpen((prev) => !prev)}
                    className="text-white/70 hover:text-white transition-all duration-300 p-1"
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

            {/* ── Dropdown with slide + fade ── */}
            {menuOpen && (
                <div
                    className="absolute top-full left-0 w-full bg-black/95 backdrop-blur-sm border-t border-white/10 px-4 pb-5 z-50 overflow-hidden"
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
                                    className="block text-white/60 hover:text-white py-3 border-b border-white/5
                                               transition-colors duration-200 hover:pl-1"
                                    style={{
                                        fontSize: "clamp(12px, 3.5vw, 15px)",
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
                        className="mt-4 flex items-center justify-center bg-white text-black font-semibold py-2.5 rounded
                                   transition-all duration-300 hover:bg-white/90 hover:scale-[1.02] active:scale-95 w-full"
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
