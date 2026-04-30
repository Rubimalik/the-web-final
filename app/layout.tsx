
import localFont from "next/font/local";
import { Roboto } from "next/font/google";
import { Metadata } from "next";
import "./globals.css";
import CartProvider from "@/components/CartProvider";

const myriadPro = localFont({
  src: [
    {
      path: '../assets/fonts/myriad-pro/Myriad Pro/Myriad Pro Light.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../assets/fonts/myriad-pro/Myriad Pro/Myriad Pro Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../assets/fonts/myriad-pro/Myriad Pro/Myriad Pro Italic.ttf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../assets/fonts/myriad-pro/Myriad Pro/Myriad Pro Semibold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../assets/fonts/myriad-pro/Myriad Pro/Myriad Pro Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../assets/fonts/myriad-pro/Myriad Pro/Myriad Pro Black.otf',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-myriad'
})

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-roboto", // optional CSS variable
});



export const metadata: Metadata = {
  // ── Basic ──────────────────────────────────────────────────────────────
  title: {
    default: "BuySupply | Photocopiers & Printer Consumables UK",
    template: "%s | BuySupply",
  },
  description:
    "BuySupply specialises in high-quality photocopiers, printers and consumables. UK-wide collection, fast delivery and competitive prices. Sell or buy copiers from Canon, Ricoh, Konica Minolta, Xerox and more.",
  keywords: [
    "photocopiers UK",
    "buy photocopier UK",
    "sell photocopier UK",
    "sell to us",
    "printer consumables UK",
    "toner cartridges UK",
    "photocopiers for sale",
    "photocopier dealer UK",
    "Canon copier",
    "Ricoh copier",
    "Konica Minolta",
    "Xerox printer",
    "lease return copiers",
    "export photocopiers",
    "BuySupply",
  ],
  authors: [{ name: "BuySupply", url: "https://buysupply.me" }],
  creator: "BuySupply",
  publisher: "BuySupply",
 
  // ── Canonical URL ───────────────────────────────────────────────────────
  metadataBase: new URL("https://buysupply.me"),
  alternates: {
    canonical: "/",
  },
 
  // ── Open Graph (Facebook, LinkedIn, WhatsApp previews) ──────────────────
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://buysupply.me",
    siteName: "BuySupply",
    title: "BuySupply | Photocopiers & Printer Consumables UK",
    description:
      "UK's leading supplier of photocopiers and printer consumables. Buy, sell or recycle — nationwide collection, fast delivery, competitive prices.",
    images: [
      {
        url: "/logo.png",   // add a 1200x630 image to your /public folder
        width: 1200,
        height: 630,
        alt: "BuySupply – Photocopiers & Consumables UK",
      },
    ],
  },
 
  // ── Twitter / X card ───────────────────────────────────────────────────
  twitter: {
    card: "summary_large_image",
    title: "BuySupply | Photocopiers & Printer Consumables UK",
    description:
      "Buy or sell photocopiers and printer consumables across the UK. Canon, Ricoh, Konica Minolta, Xerox and more.",
    images: ["/logo.png"],
  },
 
  // ── Robots ─────────────────────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
 
  // ── Icons ──────────────────────────────────────────────────────────────
  icons: {
    icon: "/logo.png",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
 
  // ── Verification (add these when you set up Google Search Console) ─────
  // verification: {
  //   google: "your-google-verification-code",
  // },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased ${myriadPro.variable} ${roboto.variable}  bg-white text-gray-900`}
      >
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
