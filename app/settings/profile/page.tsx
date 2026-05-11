import NavBar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import CustomerProfileForm from "@/components/auth/CustomerProfileForm";
import { getCustomerAuth } from "@/lib/customer-auth";
import { redirect } from "next/navigation";

export default async function ProfileSettingsPage() {
  const auth = await getCustomerAuth();
  if (!auth) redirect("/signin?from=%2Fsettings%2Fprofile");

  return (
    <div className="min-h-screen bg-white text-black font-myriad">
      <NavBar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <section className="brand-surface rounded-2xl p-6 sm:p-7">
          <h1 className="text-2xl font-bold brand-title mb-6">Your profile</h1>

          <CustomerProfileForm
            fullName={auth.profile?.full_name ?? ""}
            email={auth.user?.email ?? ""}
            phone={auth.profile?.phone ?? ""}
            address={auth.profile?.address ?? ""}
          />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

