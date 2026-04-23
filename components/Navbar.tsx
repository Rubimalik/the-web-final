"use client"

import { useEffect, useState } from "react"
import DesktopNav from "./DesktopNavbar"
import MobileNav from "./MobileNavbar"

export default function NavBar() {
    const [isDesktop, setIsDesktop] = useState<boolean | null>(null)
    const [scrolled, setScrolled] = useState(false)

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

    return (
        <header
            className="sticky top-0 z-50 w-full border-b transition-all duration-500"
            style={{
                backgroundColor: scrolled ? "rgba(0,0,0,0.97)" : "rgba(0,0,0,0.85)",
                backdropFilter: "blur(12px)",
                borderColor: scrolled ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)",
                boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.5)" : "none",
            }}
        >
            {/* ── Top contact bar ── */}
            <div
                className="w-full py-1.5 px-4 flex items-center justify-center gap-6 sm:gap-10 transition-all duration-500"
                style={{
                    backgroundColor: scrolled ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.06)",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                }}
            >
                <a
                    href="tel:01753971125"
                    className="flex items-center gap-1.5 text-white/50 hover:text-white/90 transition-colors duration-300"
                    style={{ fontSize: "clamp(10px, 2.5vw, 13px)" }}
                >
                    📞 <span>01753 971125</span>
                </a>
                <a
                    href="mailto:sales@buysupply.me"
                    className="flex items-center gap-1.5 text-white/50 hover:text-white/90 transition-colors duration-300"
                    style={{ fontSize: "clamp(10px, 2.5vw, 13px)" }}
                >
                    ✉️ <span>Sales@buysupply.me</span>
                </a>
            </div>

            {/* ── Nav row ── */}
            <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center w-full">
                {isDesktop === null ? null : isDesktop ? (
                    <DesktopNav />
                ) : (
                    <MobileNav />
                )}
            </div>
        </header>
    )
}