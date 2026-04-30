import NavBar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import { getAuthenticatedProfile } from "@/lib/auth/getAuthenticatedProfile";
import { redirect } from "next/navigation";

export default async function ProfileSettingsPage() {
  const auth = await getAuthenticatedProfile();
  if (auth.status !== "authenticated") redirect("/signin?from=%2Fsettings%2Fprofile");

  return (
    <div className="min-h-screen bg-white text-black font-myriad">
      <NavBar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <section className="brand-surface rounded-2xl p-6 sm:p-7">
          <h1 className="text-2xl font-bold brand-title mb-6">Your profile</h1>

          <div className="space-y-4 text-sm">
            <div className="flex items-start justify-between gap-4">
              <span className="text-black/60">Name</span>
              <span className="font-semibold text-black/85">{auth.profile.full_name ?? "-"}</span>
            </div>

            <div className="flex items-start justify-between gap-4">
              <span className="text-black/60">Email</span>
              <span className="font-semibold text-black/85">{auth.user.email ?? "-"}</span>
            </div>

            <div className="flex items-start justify-between gap-4">
              <span className="text-black/60">Role</span>
              <span className="font-semibold text-black/85">{auth.role}</span>
            </div>

            <div className="flex items-start justify-between gap-4">
              <span className="text-black/60">Onboarding step</span>
              <span className="font-semibold text-black/85">{auth.onboarding_step}</span>
            </div>

            <div className="flex items-start justify-between gap-4">
              <span className="text-black/60">Onboarding complete</span>
              <span className="font-semibold text-black/85">{auth.onboarding_completed ? "Yes" : "No"}</span>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

