import type { ReactNode } from "react";

export default function AuthLayout({
  children,
  eyebrow,
}: {
  children: ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="min-h-screen bg-[#f7fbfc] px-4 py-8 font-myriad text-black sm:px-6 sm:py-10">
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[520px] flex-col justify-center">
        <section className="w-full">
          {eyebrow ? (
            <p className="mb-4 text-center text-xs font-bold uppercase tracking-[0.16em] text-black/45">
              {eyebrow}
            </p>
          ) : null}

          <div className="animate-[fadeIn_360ms_ease-out]">{children}</div>
        </section>
      </main>
    </div>
  );
}

