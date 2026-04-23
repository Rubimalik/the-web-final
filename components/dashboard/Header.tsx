"use client";

import { Bell, Search, Menu, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function Header() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="h-16 border-b border-zinc-800/60 bg-[#0c0c0f]/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
      {/* Left: Mobile menu + Search */}
      <div className="flex items-center gap-4">
        <div className="relative hidden sm:flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search products, orders..."
            className="pl-9 pr-4 py-2 text-sm bg-zinc-800/50 border border-zinc-700/50 text-zinc-300 placeholder:text-zinc-600 rounded-lg focus:outline-none focus:border-indigo-500/50 focus:bg-zinc-800 transition-all w-64"
          />
          <kbd className="absolute right-3 text-[10px] text-zinc-600 border border-zinc-700 rounded px-1">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full border border-[#0c0c0f]" />
        </button>

        <div className="w-px h-6 bg-zinc-800" />

        {/* Avatar + logout */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
              A
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-medium text-zinc-300">Admin</p>
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            title="Sign out"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50 ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}