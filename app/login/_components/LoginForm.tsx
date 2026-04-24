"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertCircle, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { safeReadJsonResponse } from "@/lib/safe-json";

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const from = searchParams.get("from") || "/dashboard";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await safeReadJsonResponse<{ error?: string }>(
                res,
                "LoginForm login"
            );

            if (!res.ok) {
                setError(data?.error || "Login failed");
                return;
            }

            router.push(from);
            router.refresh();
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f0f11] flex items-center justify-center p-4">
            {/* Background glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-sm">
                {/* Logo / Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 mb-4">
                        <ShieldCheck className="w-7 h-7 text-indigo-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Admin Panel</h1>
                    <p className="text-sm text-zinc-500 mt-1">Sign in to access the dashboard</p>
                </div>

                {/* Card */}
                <div className="bg-[#13131a] border border-zinc-800/70 rounded-2xl p-6 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-300">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@example.com"
                                required
                                autoComplete="email"
                                className="w-full bg-zinc-900/60 border border-zinc-700/60 text-sm text-zinc-200 placeholder:text-zinc-600 rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 hover:border-zinc-600 transition-all"
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-300">Password</label>
                            <div className="relative">
                                <input
                                    type={showPass ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    autoComplete="current-password"
                                    className="w-full bg-zinc-900/60 border border-zinc-700/60 text-sm text-zinc-200 placeholder:text-zinc-600 rounded-lg px-3 py-2.5 pr-10 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 hover:border-zinc-600 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                                >
                                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-lg shadow-indigo-900/30 flex items-center justify-center gap-2 mt-2"
                        >
                            {loading ? (
                                <><Loader2 className="w-4 h-4 animate-spin" />Signing in...</>
                            ) : (
                                "Sign in"
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs text-zinc-700 mt-6">
                    Protected admin area
                </p>
            </div>
        </div>
    );
}