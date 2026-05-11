"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BadgeCheck,
  CheckCircle,
  Eye,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldOff,
} from "lucide-react";
import { safeReadJsonResponse } from "@/lib/safe-json";

type DealerStatus = "none" | "pending" | "approved" | "rejected" | "suspended" | "revoked";
type DealerFilter = "all" | "pending" | "approved" | "rejected" | "suspended" | "revoked";

type DealerProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: "user" | "dealer" | "admin";
  active_roles: Array<"customer" | "dealer" | "admin">;
  account_status: "active" | "suspended";
  dealer_status: DealerStatus;
  company_name: string | null;
  dealer_notes: string | null;
  dealer_access_code: string | null;
  approved_at: string | null;
  updated_at: string | null;
};

type Pagination = {
  total: number;
};

type Toast = {
  type: "success" | "error";
  text: string;
};

type DealerFormState = {
  email: string;
  full_name: string;
  company_name: string;
  dealer_notes: string;
  dealer_access_code: string;
  dealer_status: DealerStatus;
};

const emptyForm: DealerFormState = {
  email: "",
  full_name: "",
  company_name: "",
  dealer_notes: "",
  dealer_access_code: "",
  dealer_status: "pending",
};

const filters: Array<{ value: DealerFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "rejected", label: "Rejected" },
  { value: "revoked", label: "Revoked" },
];

const statusMeta: Record<
  DealerStatus,
  { label: string; className: string }
> = {
  none: {
    label: "Revoked",
    className: "border-zinc-600 bg-zinc-800 text-zinc-300",
  },
  pending: {
    label: "Pending",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  },
  approved: {
    label: "Active",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  },
  suspended: {
    label: "Suspended",
    className: "border-red-500/30 bg-red-500/10 text-red-300",
  },
  rejected: {
    label: "Rejected",
    className: "border-rose-500/30 bg-rose-500/10 text-rose-300",
  },
  revoked: {
    label: "Revoked",
    className: "border-zinc-600 bg-zinc-800 text-zinc-300",
  },
};

function toFormState(dealer: DealerProfile): DealerFormState {
  return {
    email: dealer.email ?? "",
    full_name: dealer.full_name ?? "",
    company_name: dealer.company_name ?? "",
    dealer_notes: dealer.dealer_notes ?? "",
    dealer_access_code: dealer.dealer_access_code ?? "",
    dealer_status: dealer.dealer_status === "none" ? "revoked" : dealer.dealer_status,
  };
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-GB");
}

export default function AdminDealersPage() {
  const [dealers, setDealers] = useState<DealerProfile[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<DealerFilter>("all");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<Toast | null>(null);
  const [viewingDealer, setViewingDealer] = useState<DealerProfile | null>(null);
  const [editingDealer, setEditingDealer] = useState<DealerProfile | null>(null);
  const [editForm, setEditForm] = useState<DealerFormState>(emptyForm);
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<DealerFormState>(emptyForm);
  const [confirmAction, setConfirmAction] = useState<{
    dealer: DealerProfile;
    status: DealerStatus;
    title: string;
    body: string;
  } | null>(null);

  const filteredCountLabel = useMemo(() => {
    if (!pagination) return "";
    return `Showing ${dealers.length} of ${pagination.total} dealer profiles`;
  }, [dealers.length, pagination]);

  const loadDealers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: "1", limit: "50", status: filter });
      if (search.trim()) params.set("search", search.trim());

      const response = await fetch(`/api/admin/dealers?${params}`, {
        cache: "no-store",
      });
      const payload = await safeReadJsonResponse<{
        data?: DealerProfile[];
        pagination?: Pagination;
        error?: string;
      }>(response, "AdminDealersPage load");

      if (!response.ok) throw new Error(payload?.error || "Failed to load dealers");
      setDealers(payload?.data ?? []);
      setPagination(payload?.pagination ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dealers");
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => {
    void loadDealers();
  }, [loadDealers]);

  function patchDealerInList(profile: DealerProfile) {
    setDealers((current) =>
      current.some((item) => item.id === profile.id)
        ? current.map((item) => (item.id === profile.id ? profile : item))
        : [profile, ...current],
    );
  }

  async function updateDealer(
    dealer: DealerProfile,
    dealerStatus: DealerStatus,
    updates?: Partial<DealerFormState>,
  ) {
    setUpdatingId(dealer.id);
    setError("");
    setToast(null);
    try {
      const response = await fetch(`/api/admin/dealers/${dealer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealer_status: dealerStatus,
          company_name: updates?.company_name ?? dealer.company_name,
          dealer_notes: updates?.dealer_notes ?? dealer.dealer_notes,
          dealer_access_code: updates?.dealer_access_code ?? dealer.dealer_access_code,
        }),
      });
      const payload = await safeReadJsonResponse<{
        data?: DealerProfile;
        error?: string;
      }>(response, "AdminDealersPage update");

      if (!response.ok || !payload?.data) {
        throw new Error(payload?.error || "Failed to update dealer");
      }

      patchDealerInList(payload.data);
      setToast({ type: "success", text: "Dealer updated successfully." });
      return payload.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update dealer";
      setToast({ type: "error", text: message });
      throw err;
    } finally {
      setUpdatingId(null);
    }
  }

  async function createDealer() {
    setUpdatingId("new");
    setToast(null);
    try {
      const response = await fetch("/api/admin/dealers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      const payload = await safeReadJsonResponse<{
        data?: DealerProfile;
        error?: string;
      }>(response, "AdminDealersPage create");

      if (!response.ok || !payload?.data) {
        throw new Error(payload?.error || "Failed to add dealer");
      }

      patchDealerInList(payload.data);
      setAddOpen(false);
      setAddForm(emptyForm);
      setToast({ type: "success", text: "Dealer added successfully." });
    } catch (err) {
      setToast({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to add dealer",
      });
    } finally {
      setUpdatingId(null);
    }
  }

  function beginEdit(dealer: DealerProfile) {
    setEditingDealer(dealer);
    setEditForm(toFormState(dealer));
  }

  async function saveEdit() {
    if (!editingDealer) return;
    try {
      const updated = await updateDealer(editingDealer, editForm.dealer_status, editForm);
      setEditingDealer(null);
      if (viewingDealer?.id === updated.id) setViewingDealer(updated);
    } catch {
      // Toast handled by updateDealer.
    }
  }

  function askForConfirmation(dealer: DealerProfile, status: DealerStatus) {
    const titleByStatus: Record<DealerStatus, string> = {
      none: "Revoke dealer access?",
      pending: "Move dealer back to review?",
      approved: "Reactivate dealer access?",
      rejected: "Reject dealer?",
      suspended: "Suspend dealer?",
      revoked: "Revoke dealer access?",
    };
    const bodyByStatus: Record<DealerStatus, string> = {
      none: "This removes dealer storefront access and hides wholesale ordering for this account.",
      pending: "This puts the dealer back into review and removes active dealer access.",
      approved: "This restores approved dealer access to the wholesale storefront.",
      rejected: "This rejects the dealer request and removes dealer storefront access.",
      suspended: "This blocks the dealer storefront while keeping the dealer record for review.",
      revoked: "This removes the dealer role and keeps a revoked dealer history row.",
    };

    setConfirmAction({
      dealer,
      status,
      title: titleByStatus[status],
      body: bodyByStatus[status],
    });
  }

  async function confirmStatusChange() {
    if (!confirmAction) return;
    try {
      await updateDealer(confirmAction.dealer, confirmAction.status);
      setConfirmAction(null);
    } catch {
      // Toast handled by updateDealer.
    }
  }

  function renderActions(dealer: DealerProfile) {
    const commonView = (
      <button
        type="button"
        onClick={() => setViewingDealer(dealer)}
        className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 px-2 py-1.5 text-xs text-zinc-300 hover:border-zinc-500 hover:text-white"
      >
        <Eye className="h-3.5 w-3.5" />
        View
      </button>
    );
    const commonEdit = (
      <button
        type="button"
        onClick={() => beginEdit(dealer)}
        className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 px-2 py-1.5 text-xs text-zinc-300 hover:border-zinc-500 hover:text-white"
      >
        <Pencil className="h-3.5 w-3.5" />
        Edit
      </button>
    );

    if (dealer.dealer_status === "pending") {
      return (
        <>
          <button
            type="button"
            disabled={updatingId === dealer.id}
            onClick={() => void updateDealer(dealer, "approved")}
            className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2 py-1.5 text-xs text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50"
          >
            Approve
          </button>
          <button
            type="button"
            disabled={updatingId === dealer.id}
            onClick={() => askForConfirmation(dealer, "rejected")}
            className="rounded-lg border border-red-500/40 bg-red-500/10 px-2 py-1.5 text-xs text-red-300 hover:bg-red-500/20 disabled:opacity-50"
          >
            Reject
          </button>
          {commonView}
          {commonEdit}
        </>
      );
    }

    if (dealer.dealer_status === "approved") {
      return (
        <>
          {commonView}
          {commonEdit}
          <button
            type="button"
            disabled={updatingId === dealer.id}
            onClick={() => askForConfirmation(dealer, "suspended")}
            className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-2 py-1.5 text-xs text-amber-300 hover:bg-amber-500/20 disabled:opacity-50"
          >
            Suspend
          </button>
          <button
            type="button"
            disabled={updatingId === dealer.id}
            onClick={() => askForConfirmation(dealer, "revoked")}
            className="rounded-lg border border-red-500/40 bg-red-500/10 px-2 py-1.5 text-xs text-red-300 hover:bg-red-500/20 disabled:opacity-50"
          >
            Revoke Access
          </button>
        </>
      );
    }

    if (dealer.dealer_status === "suspended") {
      return (
        <>
          <button
            type="button"
            disabled={updatingId === dealer.id}
            onClick={() => void updateDealer(dealer, "approved")}
            className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2 py-1.5 text-xs text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50"
          >
            Reactivate
          </button>
          {commonView}
          {commonEdit}
          <button
            type="button"
            disabled={updatingId === dealer.id}
            onClick={() => askForConfirmation(dealer, "revoked")}
            className="rounded-lg border border-red-500/40 bg-red-500/10 px-2 py-1.5 text-xs text-red-300 hover:bg-red-500/20 disabled:opacity-50"
          >
            Revoke Access
          </button>
        </>
      );
    }

    if (dealer.dealer_status === "rejected") {
      return (
        <>
          <button
            type="button"
            disabled={updatingId === dealer.id}
            onClick={() => void updateDealer(dealer, "pending")}
            className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-2 py-1.5 text-xs text-amber-300 hover:bg-amber-500/20 disabled:opacity-50"
          >
            Review Again
          </button>
          {commonView}
          <button
            type="button"
            disabled={updatingId === dealer.id}
            onClick={() => askForConfirmation(dealer, "revoked")}
            className="rounded-lg border border-red-500/40 bg-red-500/10 px-2 py-1.5 text-xs text-red-300 hover:bg-red-500/20 disabled:opacity-50"
          >
            Delete/Revoke
          </button>
        </>
      );
    }

    return (
      <>
        {commonView}
        <button
          type="button"
          disabled={updatingId === dealer.id}
          onClick={() => void updateDealer(dealer, "approved")}
          className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2 py-1.5 text-xs text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50"
        >
          Restore Access
        </button>
      </>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Dealers</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage dealer approvals, wholesale access, and dealer account details.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setAddForm(emptyForm);
              setAddOpen(true);
            }}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-indigo-600 px-3 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            <Plus className="h-4 w-4" />
            Add Dealer
          </button>
          <button
            type="button"
            onClick={() => void loadDealers()}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-700 px-3 text-sm text-zinc-300 hover:border-zinc-500 hover:text-white"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {toast ? (
        <div
          className={`flex items-center gap-2 rounded-lg border p-4 ${
            toast.type === "success"
              ? "border-green-500/30 bg-green-500/10 text-green-400"
              : "border-red-500/30 bg-red-500/10 text-red-400"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="h-5 w-5 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0" />
          )}
          {toast.text}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={`rounded-lg border px-3 py-2 text-sm transition ${
                filter === item.value
                  ? "border-indigo-500/50 bg-indigo-500/15 text-indigo-300"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-[360px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, email, or business..."
            className="w-full rounded-lg border border-zinc-700/60 bg-zinc-900/60 py-2.5 pl-9 pr-3 text-sm text-zinc-200 outline-none focus:border-indigo-500/60"
          />
        </div>
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
            Loading dealers...
          </div>
        ) : dealers.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
            <BadgeCheck className="h-8 w-8 text-zinc-600" />
            <p className="text-sm font-medium text-zinc-300">No dealer profiles found</p>
            <p className="text-xs text-zinc-600">
              Add a dealer or change filters to review existing dealer records.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-800/70 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Dealer</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Roles</th>
                  <th className="px-5 py-3 font-medium">Access Code</th>
                  <th className="px-5 py-3 font-medium">Updated</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/70">
                {dealers.map((dealer) => {
                  const meta = statusMeta[dealer.dealer_status] ?? statusMeta.revoked;

                  return (
                    <tr key={dealer.id} className="text-zinc-300 hover:bg-zinc-800/30">
                      <td className="px-5 py-4">
                        <p className="text-zinc-100">{dealer.full_name || dealer.company_name || "Unnamed dealer"}</p>
                        <p className="mt-1 text-xs text-zinc-500">{dealer.email || dealer.id}</p>
                        {dealer.company_name ? (
                          <p className="mt-1 text-xs text-zinc-400">{dealer.company_name}</p>
                        ) : null}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.className}`}>
                          {meta.label}
                        </span>
                        {dealer.account_status === "suspended" ? (
                          <span className="ml-2 inline-flex rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-300">
                            Account suspended
                          </span>
                        ) : null}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          {dealer.active_roles.map((role) => (
                            <span
                              key={role}
                              className="rounded-full border border-zinc-700 px-2 py-1 text-xs text-zinc-300"
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs text-zinc-500">
                        {dealer.dealer_access_code || "-"}
                      </td>
                      <td className="px-5 py-4 text-xs text-zinc-500">
                        {formatDate(dealer.updated_at)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex min-w-[260px] flex-wrap gap-2">
                          {renderActions(dealer)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {pagination ? (
        <p className="text-xs text-zinc-600">{filteredCountLabel}</p>
      ) : null}

      {addOpen ? (
        <DealerFormModal
          title="Add dealer"
          form={addForm}
          setForm={setAddForm}
          submitting={updatingId === "new"}
          onCancel={() => setAddOpen(false)}
          onSave={() => void createDealer()}
          emailEditable
        />
      ) : null}

      {editingDealer ? (
        <DealerFormModal
          title="Edit dealer"
          form={editForm}
          setForm={setEditForm}
          submitting={updatingId === editingDealer.id}
          onCancel={() => setEditingDealer(null)}
          onSave={() => void saveEdit()}
          emailEditable={false}
        />
      ) : null}

      {viewingDealer ? (
        <ViewDealerModal
          dealer={viewingDealer}
          onClose={() => setViewingDealer(null)}
          onEdit={() => {
            beginEdit(viewingDealer);
            setViewingDealer(null);
          }}
        />
      ) : null}

      {confirmAction ? (
        <ConfirmModal
          title={confirmAction.title}
          body={confirmAction.body}
          confirmLabel={confirmAction.status === "approved" ? "Continue" : "Confirm"}
          loading={updatingId === confirmAction.dealer.id}
          onCancel={() => setConfirmAction(null)}
          onConfirm={() => void confirmStatusChange()}
        />
      ) : null}
    </div>
  );
}

function DealerFormModal({
  title,
  form,
  setForm,
  submitting,
  onCancel,
  onSave,
  emailEditable,
}: {
  title: string;
  form: DealerFormState;
  setForm: React.Dispatch<React.SetStateAction<DealerFormState>>;
  submitting: boolean;
  onCancel: () => void;
  onSave: () => void;
  emailEditable: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-xl rounded-2xl border border-zinc-800 bg-[#13131a] p-5 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <p className="mt-1 text-xs text-zinc-500">
              Dealer details are used for wholesale access and internal review.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-400 hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-xs font-medium text-zinc-400">
            Email
            <input
              type="email"
              value={form.email}
              disabled={!emailEditable}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
              className="w-full rounded-lg border border-zinc-700/60 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-indigo-500/60 disabled:opacity-50"
            />
          </label>
          <label className="space-y-1.5 text-xs font-medium text-zinc-400">
            Dealer status
            <select
              value={form.dealer_status}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  dealer_status: event.target.value as DealerStatus,
                }))
              }
              className="w-full rounded-lg border border-zinc-700/60 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-indigo-500/60"
            >
              <option value="pending">Pending</option>
              <option value="approved">Active</option>
              <option value="suspended">Suspended</option>
              <option value="rejected">Rejected</option>
              <option value="revoked">Revoked</option>
            </select>
          </label>
          <label className="space-y-1.5 text-xs font-medium text-zinc-400">
            Name
            <input
              value={form.full_name}
              onChange={(event) =>
                setForm((current) => ({ ...current, full_name: event.target.value }))
              }
              className="w-full rounded-lg border border-zinc-700/60 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-indigo-500/60"
            />
          </label>
          <label className="space-y-1.5 text-xs font-medium text-zinc-400">
            Business name
            <input
              value={form.company_name}
              onChange={(event) =>
                setForm((current) => ({ ...current, company_name: event.target.value }))
              }
              className="w-full rounded-lg border border-zinc-700/60 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-indigo-500/60"
            />
          </label>
          <label className="space-y-1.5 text-xs font-medium text-zinc-400 sm:col-span-2">
            Dealer access code
            <input
              value={form.dealer_access_code}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  dealer_access_code: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-zinc-700/60 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-indigo-500/60"
            />
          </label>
          <label className="space-y-1.5 text-xs font-medium text-zinc-400 sm:col-span-2">
            Internal notes
            <textarea
              value={form.dealer_notes}
              onChange={(event) =>
                setForm((current) => ({ ...current, dealer_notes: event.target.value }))
              }
              rows={4}
              className="w-full rounded-lg border border-zinc-700/60 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-indigo-500/60"
            />
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-500 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting || (emailEditable && !form.email.trim())}
            onClick={onSave}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function ViewDealerModal({
  dealer,
  onClose,
  onEdit,
}: {
  dealer: DealerProfile;
  onClose: () => void;
  onEdit: () => void;
}) {
  const meta = statusMeta[dealer.dealer_status] ?? statusMeta.revoked;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-[#13131a] p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {dealer.full_name || dealer.company_name || "Dealer profile"}
            </h2>
            <p className="mt-1 text-xs text-zinc-500">{dealer.email || dealer.id}</p>
          </div>
          <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.className}`}>
            {meta.label}
          </span>
        </div>

        <div className="mt-5 space-y-4 text-sm">
          <InfoRow label="Business" value={dealer.company_name || "-"} />
          <InfoRow label="Access code" value={dealer.dealer_access_code || "-"} />
          <InfoRow label="Approved" value={formatDate(dealer.approved_at)} />
          <InfoRow label="Updated" value={formatDate(dealer.updated_at)} />
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500">Notes</p>
            <p className="mt-1 rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-zinc-300">
              {dealer.dealer_notes || "No notes added."}
            </p>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-500 hover:text-white"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-zinc-800 pb-3">
      <span className="text-xs uppercase tracking-wide text-zinc-500">{label}</span>
      <span className="text-right text-zinc-300">{value}</span>
    </div>
  );
}

function ConfirmModal({
  title,
  body,
  confirmLabel,
  loading,
  onCancel,
  onConfirm,
}: {
  title: string;
  body: string;
  confirmLabel: string;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#13131a] p-5 shadow-2xl">
        <div className="flex gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-300">
            <ShieldOff className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">{body}</p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-500 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
