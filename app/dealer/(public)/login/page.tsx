import { Suspense } from "react";
import { redirect } from "next/navigation";
import NavBar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import { getDealerAccessDecision } from "@/lib/dealer-session";
import DealerLoginForm from "./_components/DealerLoginForm";

export const dynamic = "force-dynamic";

export default async function DealerLoginPage() {
  const decision = await getDealerAccessDecision();
  if (decision.allowed) {
    redirect("/dealer");
  }

  return (
    <div className="dealer-theme min-h-screen bg-white text-black font-myriad">
      <NavBar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 lg:items-center">
          <section>
            <p className="text-sm font-bold uppercase tracking-wide text-black/45">
              Account access
            </p>
            <h1 className="mt-3 text-3xl md:text-5xl font-bold brand-title">
              BuySupply Portal
            </h1>
            <p className="mt-4 max-w-2xl text-black/65 text-base md:text-lg">
              Approved accounts can sign in to view product catalogue, account pricing,
              order history, and place orders.
            </p>
          </section>

          <Suspense fallback={<div className="rounded-2xl brand-surface p-6">Loading...</div>}>
            <DealerLoginForm />
          </Suspense>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
