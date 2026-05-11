"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw, Search, Users, Shield, AlertCircle, CheckCircle } from "lucide-react";
import { safeReadJsonResponse } from "@/lib/safe-json";

type UserProfile = {
  user_id: string;
  email: string | null;
  full_name: string | null;
  active_roles: string[] | null;
  active_role_count: number | null;
  created_at: string | null;
};

type Pagination = {
  limit: number;
  offset: number;
  total: number;
  totalPages: number;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [roleFilter, setRoleFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ limit: "50", offset: "0" });
      if (roleFilter) params.set("role", roleFilter);
      if (search.trim()) params.set("search", search.trim());

      const response = await fetch(`/api/admin/users?${params}`, {
        cache: "no-store",
      });
      const payload = await safeReadJsonResponse<{
        data?: UserProfile[];
        pagination?: Pagination;
        error?: string;
      }>(response, "AdminUsersPage load");

      if (!response.ok) throw new Error(payload?.error || "Failed to load users");
      setUsers(payload?.data ?? []);
      setPagination(payload?.pagination ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [roleFilter, search]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  async function grantRole(userId: string, role: string) {
    try {
      setUpdating(userId);
      setMessage(null);
      const res = await fetch("/api/admin/roles/grant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Failed to grant role" });
        return;
      }

      setMessage({ type: "success", text: `${role} role granted successfully` });
      await loadUsers();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setMessage({ type: "error", text: msg });
    } finally {
      setUpdating(null);
    }
  }

  async function revokeRole(userId: string, role: string) {
    try {
      setUpdating(userId);
      setMessage(null);
      const res = await fetch("/api/admin/roles/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Failed to revoke role" });
        return;
      }

      setMessage({ type: "success", text: `${role} role revoked successfully` });
      await loadUsers();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setMessage({ type: "error", text: msg });
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-400" />
            Users & Roles Management
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage user roles and access permissions. Assign or revoke roles for each user.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadUsers()}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-700 px-3 text-sm text-zinc-300 hover:border-zinc-500 hover:text-white"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 p-4 rounded-lg border ${
            message.type === "success"
              ? "bg-green-500/10 border-green-500/30 text-green-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          {message.text}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, email..."
            className="w-full rounded-lg border border-zinc-700/60 bg-zinc-900/60 py-2.5 pl-9 pr-3 text-sm text-zinc-200 outline-none focus:border-indigo-500/60"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value)}
          className="rounded-lg border border-zinc-700/60 bg-zinc-900/60 px-3 py-2.5 text-sm text-zinc-200 outline-none focus:border-indigo-500/60"
        >
          <option value="">All roles</option>
          <option value="admin">Admins</option>
          <option value="dealer">Dealers</option>
          <option value="customer">Customers</option>
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
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
            <Users className="h-8 w-8 text-zinc-600" />
            <p className="text-sm font-medium text-zinc-300">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-800/70 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-5 py-3 font-medium">User</th>
                  <th className="px-5 py-3 font-medium">Active Roles</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/70">
                {users.map((user) => (
                  <tr key={user.user_id} className="text-zinc-300 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-zinc-100">{user.full_name || "Unnamed user"}</p>
                      <p className="mt-1 text-xs text-zinc-500 font-mono">{user.email || "No email"}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2 flex-wrap">
                        {user.active_roles && user.active_roles.length > 0 ? (
                          user.active_roles.map((role) => (
                            <span
                              key={role}
                              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                            >
                              {role}
                            </span>
                          ))
                        ) : (
                          <span className="text-zinc-500 text-xs">No roles assigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2 flex-wrap">
                        {(!user.active_roles || !user.active_roles.includes("admin")) && (
                          <button
                            onClick={() => grantRole(user.user_id, "admin")}
                            disabled={updating === user.user_id}
                            className="px-2 py-1 text-xs font-medium bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-600/50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            +Admin
                          </button>
                        )}
                        {(!user.active_roles || !user.active_roles.includes("dealer")) && (
                          <button
                            onClick={() => grantRole(user.user_id, "dealer")}
                            disabled={updating === user.user_id}
                            className="px-2 py-1 text-xs font-medium bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-600/50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            +Dealer
                          </button>
                        )}

                        {user.active_roles && user.active_roles.includes("admin") && (
                          <button
                            onClick={() => revokeRole(user.user_id, "admin")}
                            disabled={updating === user.user_id}
                            className="px-2 py-1 text-xs font-medium bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-600/50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            -Admin
                          </button>
                        )}
                        {user.active_roles && user.active_roles.includes("dealer") && (
                          <button
                            onClick={() => revokeRole(user.user_id, "dealer")}
                            disabled={updating === user.user_id}
                            className="px-2 py-1 text-xs font-medium bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-600/50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            -Dealer
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-zinc-500">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString("en-GB") : "-"}
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
          Showing {users.length} of {pagination.total} users
        </p>
      ) : null}
    </div>
  );
}
