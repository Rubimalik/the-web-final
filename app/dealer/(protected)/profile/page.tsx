import { redirect } from "next/navigation";
import DealerLogoutButton from "@/components/dealer/DealerLogoutButton";
import { getApprovedDealerAuth } from "@/lib/dealer-session";

export const dynamic = "force-dynamic";

function formatDate(value?: string | null) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default async function DealerProfilePage() {
  const auth = await getApprovedDealerAuth();
  if (!auth?.user || !auth.profile) {
    redirect("/dealer/login");
  }

  const displayName =
    auth.profile.company_name || auth.profile.full_name || auth.user.email || "Account";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold brand-title">Profile</h1>
          <p className="mt-2 text-black/60 text-sm sm:text-base">
            Manage your private account details.
          </p>
        </div>
        <DealerLogoutButton className="inline-flex items-center justify-center gap-2 rounded-lg border border-black/20 px-4 py-2 text-sm font-semibold text-black/75 transition hover:border-[var(--brand-pink-hover)] hover:text-[var(--brand-pink-hover)]" />
      </div>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-5">
        <section className="rounded-2xl brand-surface p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-black">Account Details</h2>
          <div className="mt-5 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-black/45">Account</p>
              <p className="mt-1 font-semibold text-black">{displayName}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-black/45">Email</p>
              <p className="mt-1 text-black/75">{auth.user.email ?? "Not available"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-black/45">Member Since</p>
              <p className="mt-1 text-black/75">{formatDate(auth.profile.created_at)}</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl brand-surface p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-black">Account Access</h2>
          <div className="mt-5 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-black/45">Status</p>
              <span className="mt-2 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                Approved Account
              </span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-black/45">Access</p>
              <p className="mt-1 text-black/75">
                Products, account pricing, cart, and order history.
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-black/45">Support</p>
              <a
                href="mailto:sales@buysupply.me"
                className="mt-1 inline-flex text-black/75 hover:text-[var(--brand-pink-hover)]"
              >
                Sales@buysupply.me
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
