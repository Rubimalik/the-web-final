import type { Metadata } from "next";
import SectionPageLayout from "@/components/SectionPageLayout";

export const metadata: Metadata = {
  title: "Photocopier Rental (No Lease)",
  description:
    "Photocopier rental in Slough, London, and surrounding areas with no lease, no long-term contracts, and fully serviced machines from BuySupply.",
  alternates: {
    canonical: "/photocopier-rental",
  },
};

export default function PhotocopierRentalPage() {
  return (
    <SectionPageLayout title="PHOTOCOPIER RENTAL (NO LEASE)">
      <h2 className="text-2xl font-semibold mb-4 text-white">
        PHOTOCOPIER RENTAL SLOUGH & LONDON – NO LEASE
      </h2>

      <p className="mb-4">
        <strong>Rent a Photocopier from £85/Month – Fully Serviced, No Contracts</strong>
      </p>

      <p className="mb-4">
        Looking for a reliable office photocopier without being tied into an
        expensive lease?
      </p>

      <p className="mb-6">
        At BuySupply, we supply fully serviced photocopiers on a simple rental
        basis - no long-term contracts, no hidden costs, just straightforward
        printing.
      </p>

      <h3 className="text-xl font-semibold mb-3 text-white">
        What You Get
      </h3>

      <ul className="list-disc list-inside space-y-2 mb-6">
        <li>Photocopier rental from just £85 per month</li>
        <li>NO lease agreements - total flexibility</li>
        <li>Full service & maintenance included</li>
        <li>Toner & parts included</li>
        <li>Fast installation (often same or next day)</li>
        <li>No minimum usage contracts</li>
      </ul>

      <p className="mb-6">
        Everything you need, without the usual hassle.
      </p>

      <h3 className="text-xl font-semibold mb-3 text-white">
        Perfect For
      </h3>

      <ul className="list-disc list-inside space-y-2 mb-6">
        <li>Offices (5-50 staff)</li>
        <li>Construction site cabins</li>
        <li>Film & TV production offices</li>
        <li>Schools & temporary workspaces</li>
        <li>Businesses needing short-term or flexible setups</li>
      </ul>

      <h3 className="text-xl font-semibold mb-3 text-white">
        Local & Fast Response
      </h3>

      <p className="mb-3">
        We are based in Burnham, Slough and cover:
      </p>

      <ul className="list-disc list-inside space-y-2 mb-6">
        <li>Slough</li>
        <li>Windsor</li>
        <li>Maidenhead</li>
        <li>Reading</li>
        <li>West London</li>
        <li>Greater London</li>
        <li>Berkshire & surrounding areas</li>
      </ul>

      <p className="mb-6">
        We can often deliver and install within days.
      </p>

      <h3 className="text-xl font-semibold mb-3 text-white">
        Fully Managed Service
      </h3>

      <p className="mb-4">
        Unlike leasing companies, we keep things simple.
      </p>

      <p className="mb-3">
        Your rental includes:
      </p>

      <ul className="list-disc list-inside space-y-2 mb-6">
        <li>Delivery & installation</li>
        <li>Setup to your network</li>
        <li>Ongoing servicing & support</li>
        <li>Breakdown cover</li>
        <li>Toner replacements</li>
      </ul>

      <p className="mb-6">
        No third parties - everything handled in-house.
      </p>

      <h3 className="text-xl font-semibold mb-3 text-white">
        Why Businesses Choose BuySupply
      </h3>

      <ul className="list-disc list-inside space-y-2 mb-6">
        <li>Over 20+ years industry experience</li>
        <li>Straightforward pricing</li>
        <li>No hidden clauses or penalties</li>
        <li>Friendly, responsive support</li>
        <li>Fast turnaround times</li>
      </ul>

      <h3 className="text-xl font-semibold mb-3 text-white">
        Stop Overpaying on Copier Leases
      </h3>

      <p className="mb-4">
        Many businesses are stuck in expensive, inflexible leasing agreements.
      </p>

      <p className="mb-3">
        With BuySupply, you get:
      </p>

      <ul className="list-disc list-inside space-y-2 mb-6">
        <li>Lower monthly costs</li>
        <li>No long-term commitment</li>
        <li>Total flexibility</li>
      </ul>

      <h3 className="text-xl font-semibold mb-3 text-white">
        Get Installed This Week
      </h3>

      <p className="mb-4">
        Ready to upgrade your office printing without the hassle?
      </p>

      <ul className="list-disc list-inside space-y-2 mb-6">
        <li>Call now for a quick quote</li>
        <li>Or message us for fast installation this week</li>
      </ul>

      <h3 className="text-xl font-semibold mb-3 text-white">
        Limited Stock Available
      </h3>

      <p>
        We hold a range of quality refurbished and newer low-volume machines,
        but availability changes quickly.
      </p>

      <p className="mt-4">
        Contact us today to secure your machine.
      </p>
    </SectionPageLayout>
  );
}
