"use client"

import { useEffect, useState } from "react"
import DesktopNav from "./DesktopNavbar"
import MobileNav from "./MobileNavbar"
import { useCart } from "@/components/CartProvider"
import { Mail, Phone } from "lucide-react"

export default function NavBar() {
    const [isDesktop, setIsDesktop] = useState<boolean | null>(null)
    const [scrolled, setScrolled] = useState(false)
    const { lastAddedProductName, clearLastAddedProductName } = useCart()

    useEffect(() => {
        // Width check
        const checkWidth = () => setIsDesktop(window.innerWidth >= 768)
        checkWidth()
        window.addEventListener("resize", checkWidth)

        // Scroll check
        const checkScroll = () => setScrolled(window.scrollY > 20)
        checkScroll()
        window.addEventListener("scroll", checkScroll, { passive: true })

        return () => {
            window.removeEventListener("resize", checkWidth)
            window.removeEventListener("scroll", checkScroll)
        }
    }, [])

    useEffect(() => {
        if (!lastAddedProductName) return
        const timer = window.setTimeout(() => {
            clearLastAddedProductName()
        }, 1600)
        return () => window.clearTimeout(timer)
    }, [lastAddedProductName, clearLastAddedProductName])

    return (
        <>
            <header
                className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md transition-all duration-500"
                style={{
                    borderColor: scrolled ? "rgba(0,207,255,0.35)" : "rgba(0,207,255,0.2)",
                    boxShadow: scrolled ? "0 6px 28px rgba(0,0,0,0.08)" : "none",
                }}
            >
            {/* ── Top contact bar ── */}
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

            {/* ── Nav row ── */}
            <div className="max-w-6xl mx-auto px-4 md:px-6 h-[72px] md:h-[76px] flex items-center w-full">
                {isDesktop === null ? null : isDesktop ? (
                    <DesktopNav />
                ) : (
                    <MobileNav />
                )}
            </div>
            </header>
            {lastAddedProductName && (
                <div className="fixed bottom-4 right-4 z-[60] animate-[fadeIn_300ms_ease]">
                    <div className="brand-surface rounded-xl px-4 py-2.5 text-sm text-black shadow-[0_10px_40px_rgba(0,0,0,0.12)]">
                        Added <span className="text-[var(--brand-cyan)] font-semibold">{lastAddedProductName}</span> to cart
                    </div>
                </div>
            )}
        </>
    )
}