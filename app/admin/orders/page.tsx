"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw, Search, ShoppingCart } from "lucide-react";
import { safeReadJsonResponse } from "@/lib/safe-json";

type OrderItem = {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number | null;
};

type Order = {
  id: string;
  customerName: string | null;
  customerEmail: string | null;
  status: string;
  paymentStatus: string;
  amountTotal: number | null;
  currency: string;
  source: string;
  createdAt: string;
  items: OrderItem[];
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const orderStatuses = ["pending", "confirmed", "paid", "fulfilled", "cancelled"];

function formatMoney(value: number | null, currency: string) {
  if (value == null) return "POA";
  return `${currency.toUpperCase()} ${value.toFixed(2)}`;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: "1", limit: "25" });
      if (status) params.set("status", status);
      if (search.trim()) params.set("search", search.trim());

      const response = await fetch(`/api/admin/orders?${params}`, {
        cache: "no-store",
      });
      const payload = await safeReadJsonResponse<{
        data?: Order[];
        pagination?: Pagination;
        error?: string;
      }>(response, "AdminOrdersPage load");

      if (!response.ok) throw new Error(payload?.error || "Failed to load orders");
      setOrders(payload?.data ?? []);
      setPagination(payload?.pagination ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  async function updateStatus(orderId: string, nextStatus: string) {
    setUpdatingId(orderId);
    setError("");
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const payload = await safeReadJsonResponse<{ data?: Order; error?: string }>(
        response,
        "AdminOrdersPage update",
      );
      if (!response.ok) throw new Error(payload?.error || "Failed to update order");
      setOrders((current) =>
        current.map((order) => (order.id === orderId && payload?.data ? payload.data : order)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update order");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Orders</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Review checkout requests and payment-backed orders.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadOrders()}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-700 px-3 text-sm text-zinc-300 hover:border-zinc-500 hover:text-white"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search order id, name, or email..."
            className="w-full rounded-lg border border-zinc-700/60 bg-zinc-900/60 py-2.5 pl-9 pr-3 text-sm text-zinc-200 outline-none focus:border-indigo-500/60"
          />
        </div>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-lg border border-zinc-700/60 bg-zinc-900/60 px-3 py-2.5 text-sm text-zinc-200 outline-none focus:border-indigo-500/60"
        >
          <option value="">All statuses</option>
          {orderStatuses.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-zinc-800/70 bg-[#13131a]">
        {loading ? (
          <div className="flex items-center gap-2 px-5 py-8 text-sm text-zinc-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
            <ShoppingCart className="h-8 w-8 text-zinc-600" />
            <p className="text-sm font-medium text-zinc-300">No orders found</p>
            <p className="text-xs text-zinc-600">Orders will appear here after checkout.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-800/70 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Items</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Payment</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/70">
                {orders.map((order) => (
                  <tr key={order.id} className="text-zinc-300">
                    <td className="px-5 py-4 align-top">
                      <p className="font-mono text-xs text-zinc-400">{order.id.slice(0, 8)}</p>
                      <p className="mt-1 text-xs text-zinc-600">
                        {new Date(order.createdAt).toLocaleString("en-GB")}
                      </p>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <p>{order.customerName || "Guest"}</p>
                      <p className="mt-1 text-xs text-zinc-500">{order.customerEmail || "-"}</p>
                    </td>
                    <td className="px-5 py-4 align-top">
                      {order.items.slice(0, 2).map((item) => (
                        <p key={item.id} className="text-xs text-zinc-400">
                          {item.quantity} x {item.productName}
                        </p>
                      ))}
                      {order.items.length > 2 ? (
                        <p className="mt-1 text-xs text-zinc-600">+{order.items.length - 2} more</p>
                      ) : null}
                    </td>
                    <td className="px-5 py-4 align-top text-zinc-100">
                      {formatMoney(order.amountTotal, order.currency)}
                    </td>
                    <td className="px-5 py-4 align-top">
                      <span className="rounded-full border border-zinc-700 px-2 py-1 text-xs text-zinc-300">
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <select
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(event) => void updateStatus(order.id, event.target.value)}
                        className="rounded-lg border border-zinc-700/60 bg-zinc-900 px-2 py-1.5 text-xs text-zinc-200 outline-none"
                      >
                        {orderStatuses.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {pagination ? (
        <p className="text-xs text-zinc-600">
          Showing {orders.length} of {pagination.total} orders
        </p>
      ) : null}
    </div>
  );
}
