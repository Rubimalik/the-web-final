import Link from "next/link";
import { redirect } from "next/navigation";
import DealerNavbar from "@/components/dealer/DealerNavbar";
import DealerSiteFooter from "@/components/dealer/DealerSiteFooter";
import { getDealerAccessDecision } from "@/lib/dealer-session";
import type { DealerStatus } from "@/lib/auth/getAuthenticatedProfile";

const statusCopy: Record<
  Exclude<DealerStatus, "none" | "approved">,
  { title: string; message: string }
> = {
  pending: {
    title: "Account approval pending",
    message:
      "Your account is in review. We will enable account access once your account is approved.",
  },
  rejected: {
    title: "Account request rejected",
    message:
      "This account is not approved for account access. Contact BuySupply if you believe this needs review.",
  },
  suspended: {
    title: "Account access suspended",
    message:
      "Account access for this account is currently suspended. Contact BuySupply for support.",
  },
  revoked: {
    title: "Account access revoked",
    message:
      "Account access for this account has been revoked. Contact BuySupply if you need help.",
  },
};

function getStatusCopy(status: DealerStatus) {
  if (status === "pending") return statusCopy.pending;
  if (status === "rejected") return statusCopy.rejected;
  if (status === "suspended") return statusCopy.suspended;
  if (status === "revoked") return statusCopy.revoked;
  return {
    title: "Account access unavailable",
    message:
      "Your account profile is approved, but account access is not active yet. Contact BuySupply for support.",
  };
}

export default async function DealerStatusPage({
  expectedStatus,
}: {
  expectedStatus?: DealerStatus;
}) {
  const decision = await getDealerAccessDecision();
  if (decision.allowed) {
    redirect("/dealer");
  }

  const auth = decision.auth;
  if (auth.status !== "authenticated" || !auth.profile) {
    redirect("/dealer/login");
  }
  const status = auth.profile.dealer_status;

  if (status === "none" || !auth.roles.includes("dealer")) {
    redirect(decision.redirectTo);
  }

  if (expectedStatus && expectedStatus !== status) {
    redirect(status === "pending" ? "/dealer/pending" : status === "rejected" ? "/dealer/rejected" : "/dealer/status");
  }

  const copy = getStatusCopy(status);

  return (
    <div className="dealer-theme min-h-screen bg-white text-black font-myriad">
      <DealerNavbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <section className="brand-surface rounded-2xl p-6 sm:p-8">
          <p className="text-sm font-bold uppercase tracking-wide text-black/45">
            Account status
          </p>
          <h1 className="mt-3 text-3xl md:text-4xl font-bold brand-title">
            {copy.title}
          </h1>
          <p className="mt-4 text-black/65 text-base leading-relaxed">{copy.message}</p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <Link
              href="/contact"
              className="inline-flex justify-center rounded-lg brand-button px-5 py-3 text-sm font-semibold"
            >
              Contact BuySupply
            </Link>
            <Link
              href="/dealer/login"
              className="inline-flex justify-center rounded-lg border border-black/15 px-5 py-3 text-sm font-semibold text-black/75 hover:border-[var(--brand-cyan)] hover:text-[var(--brand-cyan)] transition"
            >
              Back to login
            </Link>
          </div>
        </section>
      </main>
      <DealerSiteFooter />
    </div>
  );
}
