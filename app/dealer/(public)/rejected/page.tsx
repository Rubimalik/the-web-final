import DealerStatusPage from "../_components/DealerStatusPage";

export const dynamic = "force-dynamic";

export default function DealerRejectedPage() {
  return <DealerStatusPage expectedStatus="rejected" />;
}
