"use client"

import Link from "next/link"
import { ShoppingCart, ChevronDown } from "lucide-react"
import { useCart } from "@/components/CartProvider"
import { useEffect, useRef, useState } from "react"
import ProfileMenu from "@/components/auth/ProfileMenu"

const navLinks = [
    { label: "HOME", href: "/" },
    { label: "PRODUCTS", href: "/products" },
    { label: "CONTACT US", href: "/contact" },
]

const aboutLinks = [
    { label: "UK Sales", href: "/uk-sales" },
    { label: "Export Sales", href: "/export-sales" },
    { label: "Leasing", href: "/leasing" },
    { label: "Photocopier Rental", href: "/photocopier-rental" },
    { label: "Collection & Storage", href: "/collection-storage" },
    { label: "Sell To Us", href: "/sell-to-us" },
]

export default function DesktopNav() {
    const { itemCount, cartPulseKey } = useCart()

    const [open, setOpen] = useState(false)
    const dropdownRef = useRef<HTMLLIElement | null>(null)

    // close on outside click / scroll
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }

        const handleScroll = () => {
            requestAnimationFrame(() => setOpen(false));
        };

        document.addEventListener("mousedown", handleClickOutside)
        window.addEventListener("scroll", handleScroll)

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
            window.removeEventListener("scroll", handleScroll)
        }
    }, [])

    return (
        <nav className="w-full flex items-center justify-between">

            {/* Logo */}
            <Link href="/" className="font-extrabold tracking-wide shrink-0 text-lg md:text-xl leading-none">
                BuySupply
            </Link>

            {/* Nav Links */}
            <ul className="flex items-center gap-7 lg:gap-10 flex-1 justify-center">

                {navLinks.map((link) => (
                    <li key={link.href}>
                        <Link
                            href={link.href}
                            className="text-black/75 hover:text-[var(--brand-pink-hover)] transition-colors font-bold text-base md:text-[17px]"
                        >
                            {link.label}
                        </Link>
                    </li>
                ))}

                {/* ABOUT DROPDOWN (CLICK BASED) */}
                <li className="relative" ref={dropdownRef}>

                    <div
                        className="flex items-center gap-1 cursor-pointer text-black/75 hover:text-[var(--brand-pink-hover)] font-bold text-base md:text-[17px]"
                        onClick={() => setOpen(!open)}
                    >
                        ABOUT

                        {/* Arrow only shows when hovered OR open */}
                        <ChevronDown
                            className={`h-4 w-4 transition-transform duration-200
                            ${open ? "rotate-180" : ""}`}
                        />
                    </div>

                    {/* Dropdown */}
                    {open && (
                        <div className="absolute left-0 top-full mt-2 bg-white shadow-lg rounded-md py-2 min-w-[220px] z-50">

                            {aboutLinks.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setOpen(false)}
                                    className="block px-4 py-2 text-sm text-black/70 hover:text-[var(--brand-pink-hover)] hover:bg-gray-50 transition-colors"
                                >
                                    {item.label}
                                </Link>
                            ))}

                        </div>
                    )}
                </li>

            </ul>

            {/* Right Side */}
            <div className="flex items-center gap-2">

                {/* Cart */}
                <Link
                    href="/cart"
                    className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/20 hover:border-[var(--brand-pink-hover)] hover:text-[var(--brand-pink-hover)] transition"
                >
                    <ShoppingCart className="h-4 w-4" />
                    {itemCount > 0 && (
                        <span
                            key={cartPulseKey}
                            className="absolute -right-1.5 -top-1.5 min-w-5 h-5 px-1 rounded-full bg-[var(--brand-pink-hover)] text-black text-[10px] font-bold"
                        >
                            {itemCount}
                        </span>
                    )}
                </Link>

                {/* Get a Quote (FIXED HOVER) */}
                <Link
    href="/sell-to-us"
    className="shrink-0 brand-button px-4 py-2 rounded transition-all duration-300 hover:scale-[1.03] active:scale-95 font-semibold text-sm lg:text-base"
>
    Get a Quote
</Link>

                <ProfileMenu />
            </div>

        </nav>
    )
}