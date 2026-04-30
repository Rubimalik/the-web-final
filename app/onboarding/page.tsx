import { redirect } from "next/navigation";
import NavBar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import { getAuthenticatedProfile } from "@/lib/auth/getAuthenticatedProfile";
import { createSupabaseServiceRoleClient } from "@/lib/supabase";
import OnboardingActionLink from "@/components/auth/OnboardingActionLink";
import { invalidateAuthenticatedProfileCache } from "@/lib/auth/getAuthenticatedProfile";

export default async function OnboardingPage() {
  const auth = await getAuthenticatedProfile();
  if (auth.status !== "authenticated") redirect("/signin?from=%2Fonboarding");

  if (auth.onboarding_completed) {
    redirect(auth.role === "admin" ? "/dashboard" : "/products");
  }

  // Server-side onboarding progression:
  // - If the user is still on step 0/1, move to step 2 so they can complete onboarding.
  // This keeps the step-based server validation intact (completion still requires step=2+).
  if (auth.onboarding_step <= 1) {
    const supabase = createSupabaseServiceRoleClient();
    await supabase
      .from("profiles")
      .update({ onboarding_step: 2 })
      .eq("id", auth.user.id);
    invalidateAuthenticatedProfileCache(auth.user.id);

    // No need to recalc; UI is unchanged and completion endpoint re-checks DB.
  }

  return (
    <div className="min-h-screen bg-white text-black font-myriad">
      <NavBar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <section className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold brand-title">
            Welcome{auth.profile.full_name ? `, ${auth.profile.full_name}` : ""}!
          </h1>
          <p className="mt-4 text-black/70 text-sm sm:text-base leading-relaxed">
            Your account is ready.{" "}
            {auth.role === "admin"
              ? "You have access to the dashboard once onboarding is complete."
              : "Complete your onboarding to activate your experience."}
          </p>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 brand-surface rounded-2xl p-6 sm:p-7">
            <h2 className="text-2xl font-bold brand-title mb-3">Account summary</h2>
            <div className="mt-6 space-y-4 text-sm">
              <div className="flex items-start justify-between gap-4">
                <span className="text-black/60">Email</span>
                  <span className="font-semibold text-black/85">{auth.user.email ?? "-"}</span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-black/60">Full name</span>
                  <span className="font-semibold text-black/85">{auth.profile.full_name ?? "-"}</span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-black/60">Profile created</span>
                  <span className="font-semibold text-black/85">Yes</span>
              </div>
            </div>
          </div>

          <aside className="brand-surface rounded-2xl p-6 sm:p-7">
            <h2 className="text-lg font-bold brand-title mb-3">Next steps</h2>
            <div className="space-y-3 text-sm">
              {auth.role === "admin" ? (
                <OnboardingActionLink
                  href="/dashboard"
                  className="block brand-button rounded-xl px-4 py-3 text-sm font-semibold text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-cyan)]/25"
                >
                  Go to dashboard
                </OnboardingActionLink>
              ) : (
                <OnboardingActionLink
                  href="/products"
                  className="block brand-button rounded-xl px-4 py-3 text-sm font-semibold text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-cyan)]/25"
                >
                  Browse products
                </OnboardingActionLink>
              )}

              <a
                href="/signin?from=%2Fonboarding"
                className="block rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-black/75 hover:border-[var(--brand-cyan)] hover:text-[var(--brand-cyan)] transition focus:outline-none focus:ring-2 focus:ring-[var(--brand-cyan)]/25"
              >
                View account
              </a>
            </div>
            <p className="mt-4 text-xs text-black/45 leading-relaxed">
              If you don&apos;t see your profile details, refresh after email verification completes.
            </p>
          </aside>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

