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

export default function DesktopNav() {
    return (
        <nav className="w-full flex items-center justify-between">

            {/* Logo */}
            <Link
                href="/"
                className="text-white font-bold tracking-wide shrink-0 transition-opacity duration-300 hover:opacity-80"
                style={{ fontSize: "clamp(14px, 2vw, 18px)" }}
            >
                BuySupply
            </Link>

            {/* Nav Links */}
            <ul className="flex items-center gap-5 lg:gap-8 flex-1 justify-center">
                {navLinks.map((link) => (
                    <li key={link.href}>
                        <Link
                            href={link.href}
                            className="relative text-white/60 hover:text-white whitespace-nowrap
                                       transition-colors duration-300
                                       after:absolute after:left-0 after:-bottom-0.5
                                       after:h-px after:w-0 after:bg-white
                                       after:transition-[width] after:duration-300
                                       hover:after:w-full"
                            style={{ fontSize: "clamp(11px, 1.2vw, 14px)" }}
                        >
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>

            {/* CTA */}
            <Link
                href="/sell-to-us"
                className="shrink-0 bg-white text-black font-semibold px-4 py-2 rounded
                           transition-all duration-300
                           hover:bg-white/90 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]
                           hover:scale-[1.03] active:scale-95"
                style={{ fontSize: "clamp(11px, 1.2vw, 14px)" }}
            >
                Get a Quote
            </Link>

        </nav>
    )
}
