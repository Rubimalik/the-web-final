"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function DealerLogoutButton({
  className = "",
  onDone,
}: {
  className?: string;
  onDone?: () => void;
}) {
  const router = useRouter();

  async function handleLogout() {
    onDone?.();
    try {
      await fetch("/api/auth/dealer/logout", {
        method: "POST",
        cache: "no-store",
      });
    } catch {
      // Local navigation still moves the user away from protected dealer routes.
    }

    try {
      localStorage.removeItem("buysupply_auth");
      sessionStorage.removeItem("buysupply_auth");
    } catch {
      // Ignore storage cleanup failures.
    }

    router.replace("/dealer/login");
    router.refresh();
  }

  return (
    <button type="button" onClick={() => void handleLogout()} className={className}>
      <LogOut className="h-4 w-4" />
      Logout
    </button>
  );
}
