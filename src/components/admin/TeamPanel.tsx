"use client";

import { useState } from "react";

export default function TeamPanel({
  initialAdmins,
  ownerEmail,
  currentEmail,
}: {
  initialAdmins: string[];
  ownerEmail: string | null;
  currentEmail: string | null;
}) {
  const [admins, setAdmins] = useState<string[]>(initialAdmins);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function call(action: "add" | "remove", targetEmail: string) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          email: targetEmail,
          password: action === "add" ? password.trim() || undefined : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Something went wrong.");
      setAdmins(data.admins ?? []);
      if (action === "add") {
        setNotice(
          data.provisioned
            ? `Added ${targetEmail} — they can log in now with the password you set.`
            : `Added ${targetEmail}. They'll need a login (set a temp password here, or create one in Supabase) before they can sign in.`
        );
        setEmail("");
        setPassword("");
      } else {
        setNotice(`Removed ${targetEmail}.`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Admin access</h2>
        <p className="mt-1 text-sm text-party-ink/60">
          People listed here can sign in to this dashboard. Set a temporary
          password to create their login instantly — they can change it later.
        </p>
      </div>

      {/* Current admins */}
      <div className="space-y-2">
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">
              {ownerEmail ?? "Owner"}
            </p>
            <p className="text-xs text-party-ink/50">
              Owner · always has access
              {currentEmail?.toLowerCase() === ownerEmail
                ? " · that's you"
                : ""}
            </p>
          </div>
          <span className="rounded-full bg-party-yellow/40 px-3 py-1 text-xs font-bold uppercase tracking-wider text-party-ink">
            Owner
          </span>
        </div>

        {admins.map((a) => (
          <div
            key={a}
            className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">
                {a}
              </p>
              <p className="text-xs text-party-ink/50">
                Admin
                {currentEmail?.toLowerCase() === a ? " · that's you" : ""}
              </p>
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={() => call("remove", a)}
              className="text-sm font-semibold text-party-red hover:underline disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        ))}

        {admins.length === 0 && (
          <p className="rounded-xl bg-white px-4 py-5 text-center text-sm text-party-ink/50 shadow-soft">
            No additional admins yet.
          </p>
        )}
      </div>

      {/* Add admin */}
      <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-5">
        <h3 className="font-bold text-gray-900">Add an admin</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="field-label">Email</label>
            <input
              type="email"
              className="field"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="field-label">Temporary password (optional)</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="field pr-16"
                placeholder="min 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-0 px-3 text-sm font-bold uppercase tracking-wider text-party-ink/50 hover:text-party-red"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
        </div>
        <p className="text-xs text-party-ink/50">
          Leave the password blank if they already have a login. Share the
          temporary password with them securely (not by email).
        </p>
        <div className="flex justify-end">
          <button
            type="button"
            disabled={busy || !email.trim()}
            onClick={() => call("add", email.trim())}
            className="btn-red !px-5 !py-2 !text-sm disabled:opacity-50"
          >
            {busy ? "Saving…" : "Add admin"}
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-party-red/40 bg-party-red/10 px-4 py-3 text-sm font-semibold text-party-red">
          {error}
        </p>
      )}
      {notice && (
        <p className="rounded-lg border border-party-green/40 bg-party-green/10 px-4 py-3 text-sm font-semibold text-party-green">
          {notice}
        </p>
      )}
    </div>
  );
}
