import DealerSiteFooter from "@/components/dealer/DealerSiteFooter";
import DealerCartProvider from "@/components/dealer/DealerCartProvider";
import DealerNavbar from "@/components/dealer/DealerNavbar";

export default function DealerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DealerCartProvider>
      <div className="dealer-theme min-h-screen text-black font-myriad">
        <DealerNavbar />
        {children}
        <DealerSiteFooter />
      </div>
    </DealerCartProvider>
  );
}
