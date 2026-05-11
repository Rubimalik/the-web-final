import { redirect } from "next/navigation";
import { getDealerAccessDecision } from "@/lib/dealer-session";
import DealerLayout from "@/components/dealer/DealerLayout";

export const dynamic = "force-dynamic";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const decision = await getDealerAccessDecision();
  if (!decision.allowed) {
    redirect(decision.redirectTo);
  }

  return <DealerLayout>{children}</DealerLayout>;
}
