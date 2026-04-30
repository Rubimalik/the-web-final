import { Suspense } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { getAuthenticatedProfile } from "@/lib/auth/getAuthenticatedProfile";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getAuthenticatedProfile();
  if (auth.status !== "authenticated") redirect("/signin?from=%2Fdashboard");

  if (!auth.onboarding_completed) {
    redirect("/onboarding");
  }

  if (auth.role !== "admin") {
    redirect("/products");
  }

  return (
    <div className="flex h-screen bg-[#0f0f11] overflow-hidden">
      <Suspense
        fallback={<div className="h-screen w-60 shrink-0 border-r border-zinc-800/60 bg-[#0c0c0f]" />}
      >
        <Sidebar />
      </Suspense>

      <div className="flex flex-col flex-1 overflow-hidden">
        <Suspense fallback={<div className="h-16 shrink-0 border-b border-zinc-800/60 bg-[#0c0c0f]/80" />}>
          <Header />
        </Suspense>
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
