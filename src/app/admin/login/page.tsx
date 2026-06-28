"use client";

import { useState } from "react";
import Link from "next/link";
import { createBrowserSupabase, supabaseConfigured } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createBrowserSupabase();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      window.location.href = "/admin";
    } catch {
      setError("Invalid email or password.");
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-party-red px-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-6 block text-center font-display text-3xl font-bold italic text-white"
        >
          Bounce FX
        </Link>

        <div className="card bg-white p-8">
          <h1 className="font-display text-3xl font-bold italic">Owner Login</h1>
          <p className="mt-1 text-party-ink/60">
            Sign in to manage bookings.
          </p>

          {!supabaseConfigured && (
            <p className="mt-4 rounded-lg border border-party-yellow/50 bg-party-yellow/20 px-4 py-3 text-sm font-semibold">
              Supabase isn't configured yet — the dashboard is open in preview
              mode.{" "}
              <Link href="/admin" className="underline">
                Open dashboard →
              </Link>
            </p>
          )}

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="field-label">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field mt-1.5"
              />
            </div>
            <div>
              <label className="field-label">Password</label>
              <div className="relative mt-1.5">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="field pr-16"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-0 px-3 text-sm font-bold uppercase tracking-wider text-party-ink/50 hover:text-party-red"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            {error && (
              <p className="font-semibold text-party-red">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="btn-red w-full disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        <Link
          href="/"
          className="mt-4 block text-center text-sm text-white/80 hover:text-white"
        >
          ← Back to site
        </Link>
      </div>
    </div>
  );
}
