import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Header } from "@/components/dashboard/Header";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { getAdminAccessDecision } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const decision = await getAdminAccessDecision();
  if (!decision.allowed) {
    redirect(`${decision.redirectTo}?from=%2Fadmin%2Fdashboard`);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f0f11]">
      <Suspense
        fallback={<div className="h-screen w-60 shrink-0 border-r border-zinc-800/60 bg-[#0c0c0f]" />}
      >
        <Sidebar />
      </Suspense>

      <div className="flex flex-1 flex-col overflow-hidden">
        <Suspense fallback={<div className="h-16 shrink-0 border-b border-zinc-800/60 bg-[#0c0c0f]/80" />}>
          <Header />
        </Suspense>
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
