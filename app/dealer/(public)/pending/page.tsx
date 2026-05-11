import DealerStatusPage from "../_components/DealerStatusPage";

export const dynamic = "force-dynamic";

export default function DealerPendingPage() {
  return <DealerStatusPage expectedStatus="pending" />;
}
