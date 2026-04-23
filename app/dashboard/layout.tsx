import { Suspense } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
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
