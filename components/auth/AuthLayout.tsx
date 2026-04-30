import type { ReactNode } from "react";

export default function AuthLayout({
  children,
  /**
   * Optional small heading above the card.
   * Keep it short for better mobile layout.
   */
  eyebrow,
}: {
  children: ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="min-h-screen bg-white text-black px-4 sm:px-6">
      {/* Background accents */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-[-140px] -translate-x-1/2 h-[320px] w-[320px] rounded-full bg-[var(--brand-cyan)]/10 blur-2xl" />
          <div className="absolute right-[-90px] top-[240px] h-[300px] w-[300px] rounded-full bg-[var(--brand-sky)]/10 blur-2xl" />
        </div>

        <div className="relative mx-auto max-w-6xl py-10 sm:py-14">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-stretch">
            <aside className="hidden md:flex">
              <div className="w-full rounded-2xl border border-black/10 bg-white/70 p-8 sm:p-10 shadow-sm">
                <div className="max-w-sm space-y-4">
                  <div className="inline-flex items-center gap-2">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--brand-sky)]/15 border border-black/10">
                      <span className="text-lg font-bold brand-icon">B</span>
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-black/90">BuySupply</p>
                      <p className="text-xs text-black/55">Secure access</p>
                    </div>
                  </div>

                  <h2 className="text-[22px] font-bold leading-tight">
                    Faster sign-in, better UX.
                  </h2>
                  <p className="text-sm text-black/65 leading-relaxed">
                    Use email/password or Google OAuth. Your session is persisted securely
                    and protected routes redirect you after login.
                  </p>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 h-8 w-8 rounded-xl bg-[var(--brand-cyan)]/15 border border-black/10 flex items-center justify-center">
                        <span className="text-black/80 text-xs font-bold">OK</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Email verification</p>
                        <p className="text-xs text-black/60">Prevents unverified account access.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 h-8 w-8 rounded-xl bg-[var(--brand-sky)]/15 border border-black/10 flex items-center justify-center">
                        <span className="text-black/80 text-xs font-bold">R</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Session persistence</p>
                        <p className="text-xs text-black/60">Remember me controls your token storage.</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 text-xs text-black/45">
                    By continuing you agree to our Terms & Privacy.
                  </div>
                </div>
              </div>
            </aside>

            <section className="mx-auto w-full md:mx-0">
              {eyebrow ? (
                <p className="text-sm font-semibold text-black/60 mb-4">{eyebrow}</p>
              ) : null}

              <div className="animate-[fadeIn_360ms_ease-out]">{children}</div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

