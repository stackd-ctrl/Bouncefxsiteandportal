"use client";

import { useState } from "react";

export default function ReviewForm() {
  const [form, setForm] = useState({ name: "", city: "", text: "", rating: 5 });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-card">
        <h3 className="font-display text-2xl font-bold italic">Thank you!</h3>
        <p className="mt-2 text-party-ink/65">
          We so appreciate you taking the time. Your review helps other families
          find us.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl bg-white p-6 shadow-card sm:p-8">
      <h3 className="font-display text-2xl font-bold italic">Leave a review</h3>
      <p className="mt-1 text-sm text-party-ink/60">
        Rented with us? We'd love to hear how it went.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label">Name</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="field"
          />
        </div>
        <div>
          <label className="field-label">City</label>
          <input
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            placeholder="e.g. Stafford, VA"
            className="field"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="field-label">Rating</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setForm({ ...form, rating: n })}
              className={`h-10 w-10 rounded-lg border text-lg font-bold transition-colors ${
                n <= form.rating
                  ? "border-transparent bg-party-yellow text-party-ink"
                  : "border-party-ink/20 text-party-ink/40"
              }`}
              aria-label={`${n} stars`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <label className="field-label">Your review</label>
        <textarea
          required
          rows={4}
          value={form.text}
          onChange={(e) => setForm({ ...form, text: e.target.value })}
          placeholder="Tell us about your experience…"
          className="field resize-none"
        />
      </div>

      {status === "error" && (
        <p className="mt-3 text-sm font-semibold text-party-red">
          Something went wrong — please try again.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="btn-red mt-5 w-full disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Submit Review"}
      </button>
    </form>
  );
}
