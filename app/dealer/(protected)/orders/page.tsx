import Link from "next/link";
import { redirect } from "next/navigation";
import { getApprovedDealerAuth } from "@/lib/dealer-session";
import { listDealerOrders, type OrderRecord } from "@/lib/orders-store";

export const dynamic = "force-dynamic";

function formatPrice(value: number | null) {
  return typeof value === "number" ? `\u00a3${value.toFixed(2)}` : "POA";
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(value);
}

function statusClass(order: OrderRecord) {
  if (order.status === "fulfilled") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (order.status === "cancelled") return "bg-red-50 text-red-700 border-red-200";
  if (order.status === "paid") return "bg-cyan-50 text-cyan-700 border-cyan-200";
  return "bg-amber-50 text-amber-800 border-amber-200";
}

export default async function DealerOrdersPage() {
  const auth = await getApprovedDealerAuth();
  if (!auth?.user) {
    redirect("/dealer/login");
  }

  const { data: orders } = await listDealerOrders(auth.user.id, {
    page: 1,
    limit: 20,
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold brand-title">My Orders</h1>
          <p className="mt-2 text-black/60 text-sm sm:text-base">
            Track order requests placed through the portal.
          </p>
        </div>
        <Link
          href="/dealer/products"
          className="inline-flex justify-center rounded-lg brand-button px-5 py-2.5 text-sm"
        >
          Continue Shopping
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="mt-10 rounded-2xl brand-surface p-8 text-center">
          <p className="text-black/70">No orders yet.</p>
          <Link
            href="/dealer/products"
            className="mt-5 inline-flex rounded-lg brand-button px-5 py-2.5 text-sm"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="mt-10 space-y-4">
          {orders.map((order) => (
            <article key={order.id} className="rounded-2xl brand-surface p-5 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-black/45">
                    Order #{order.id.slice(0, 8)}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-black">
                    {formatDate(order.createdAt)}
                  </h2>
                </div>
                <span
                  className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-bold capitalize ${statusClass(order)}`}
                >
                  {order.status}
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {order.items.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 border-t border-black/10 pt-3 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-black">{item.productName}</p>
                      <p className="text-black/50">Qty {item.quantity}</p>
                    </div>
                    <p className="shrink-0 text-black/75">
                      {formatPrice(item.lineTotal)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-black/10 pt-4">
                <span className="text-sm text-black/60">Estimated total</span>
                <strong className="text-lg text-black">{formatPrice(order.amountTotal)}</strong>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
