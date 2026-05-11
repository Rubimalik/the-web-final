"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { safeReadJsonResponse } from "@/lib/safe-json";

type CustomerProfileFormProps = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
};

export default function CustomerProfileForm({
  fullName,
  email,
  phone,
  address,
}: CustomerProfileFormProps) {
  const router = useRouter();
  const [nameValue, setNameValue] = useState(fullName);
  const [phoneValue, setPhoneValue] = useState(phone);
  const [addressValue, setAddressValue] = useState(address);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (saving) return;

    setSaving(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch("/api/customer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: nameValue,
          phone: phoneValue,
          address: addressValue,
        }),
      });
      const payload = await safeReadJsonResponse<{ error?: string }>(
        response,
        "CustomerProfileForm update",
      );
      if (!response.ok) throw new Error(payload?.error || "Failed to update profile");

      setMessage("Profile updated.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-black/75" htmlFor="profile-name">
          Full Name
        </label>
        <input
          id="profile-name"
          value={nameValue}
          onChange={(event) => setNameValue(event.target.value)}
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-[var(--brand-cyan)] focus:ring-2 focus:ring-[var(--brand-cyan)]/25"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-black/75" htmlFor="profile-email">
          Email
        </label>
        <input
          id="profile-email"
          value={email}
          disabled
          className="w-full rounded-xl border border-black/10 bg-black/5 px-4 py-3 text-sm text-black/55"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-black/75" htmlFor="profile-phone">
          Phone Number
        </label>
        <input
          id="profile-phone"
          value={phoneValue}
          onChange={(event) => setPhoneValue(event.target.value)}
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-[var(--brand-cyan)] focus:ring-2 focus:ring-[var(--brand-cyan)]/25"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-black/75" htmlFor="profile-address">
          Address
        </label>
        <textarea
          id="profile-address"
          value={addressValue}
          onChange={(event) => setAddressValue(event.target.value)}
          rows={4}
          className="w-full resize-none rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-[var(--brand-cyan)] focus:ring-2 focus:ring-[var(--brand-cyan)]/25"
        />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      <button
        type="submit"
        disabled={saving}
        className="brand-button rounded-xl px-5 py-3 text-sm font-semibold disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save Profile"}
      </button>
    </form>
  );
}
