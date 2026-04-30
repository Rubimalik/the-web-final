import Link from "next/link";
import { redirect } from "next/navigation";
import NavBar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import { getAuthenticatedProfile } from "@/lib/auth/getAuthenticatedProfile";

function initialsFromNameOrEmail(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "U";
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
  }
  return (words[0]?.slice(0, 2) ?? "U").toUpperCase();
}

export default async function AccountPage() {
  const auth = await getAuthenticatedProfile();
  if (auth.status !== "authenticated") {
    redirect("/signin?from=%2Faccount");
  }

  const displayName = auth.profile.full_name || auth.user.email || "Unknown user";
  const initials = initialsFromNameOrEmail(displayName);

  return (
    <div className="min-h-screen bg-white text-black font-myriad">
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <section className="brand-surface rounded-2xl p-6 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mb-8">
            <div>
              <h1 className="text-2xl font-bold brand-title">My Account</h1>
              <p className="text-sm text-black/60 mt-1">Manage your public profile and account details.</p>
            </div>
            <Link
              href="/settings/profile"
              className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold border border-black/15 hover:border-[var(--brand-cyan)] hover:text-[var(--brand-cyan)] transition-colors"
            >
              Edit profile
            </Link>
          </div>

          <div className="flex items-center gap-4 mb-8">
            {auth.profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={auth.profile.avatar_url}
                alt={`${displayName} avatar`}
                className="h-16 w-16 rounded-full object-cover border border-black/10"
              />
            ) : (
              <div className="h-16 w-16 rounded-full border border-black/15 flex items-center justify-center text-lg font-bold text-black/70">
                {initials}
              </div>
            )}
            <div>
              <p className="font-semibold text-base text-black/90">{displayName}</p>
              <p className="text-sm text-black/60">{auth.user.email ?? "-"}</p>
            </div>
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex items-start justify-between gap-4">
              <span className="text-black/60">Role</span>
              <span className="font-semibold text-black/85 capitalize">{auth.role}</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className="text-black/60">Onboarding status</span>
              <span className="font-semibold text-black/85">
                {auth.onboarding_completed ? "Completed" : `Step ${auth.onboarding_step}`}
              </span>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

