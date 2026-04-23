import NavBar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";

export default function SectionPageLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-black text-white min-h-screen font-myriad">
      <NavBar />
      <main className="max-w-5xl mx-auto px-6 py-14 sm:py-16">
        <h1 className="text-3xl md:text-4xl font-bold mb-10 text-center">{title}</h1>
        <div className="text-white/70 leading-relaxed space-y-6">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}
