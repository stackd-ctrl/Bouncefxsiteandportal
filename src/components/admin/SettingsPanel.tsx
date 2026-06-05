"use client";

import { useState } from "react";
import type { SiteInfo } from "@/lib/content";

export default function SettingsPanel({ site }: { site: SiteInfo }) {
  const [draft, setDraft] = useState<SiteInfo>(site);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function update(patch: Partial<SiteInfo>) {
    setDraft((d) => ({ ...d, ...patch }));
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site: { ...draft, phones: draft.phones.filter(Boolean) },
        }),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-5">
      <p className="text-sm text-party-ink/60">
        Update the business info shown across the site (footer, contact page,
        and search listings).
      </p>

      <div className="rounded-2xl bg-white p-6 shadow-soft">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label">Phone 1</label>
            <input
              className="field"
              value={draft.phones[0] ?? ""}
              onChange={(e) =>
                update({ phones: [e.target.value, draft.phones[1] ?? ""] })
              }
            />
          </div>
          <div>
            <label className="field-label">Phone 2</label>
            <input
              className="field"
              value={draft.phones[1] ?? ""}
              onChange={(e) =>
                update({ phones: [draft.phones[0] ?? "", e.target.value] })
              }
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="field-label">Email</label>
          <input
            className="field"
            value={draft.email}
            onChange={(e) => update({ email: e.target.value })}
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label">Instagram URL</label>
            <input
              className="field"
              value={draft.instagram}
              onChange={(e) => update({ instagram: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">Facebook URL</label>
            <input
              className="field"
              value={draft.facebook}
              onChange={(e) => update({ facebook: e.target.value })}
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="field-label">Tagline</label>
          <input
            className="field"
            value={draft.tagline}
            onChange={(e) => update({ tagline: e.target.value })}
          />
        </div>

        <div className="mt-4">
          <label className="field-label">Service area text</label>
          <input
            className="field"
            value={draft.areaText}
            onChange={(e) => update({ areaText: e.target.value })}
          />
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-soft">
        <h3 className="font-display text-lg font-bold italic">
          Homepage &amp; About text
        </h3>
        <p className="mb-4 text-sm text-party-ink/55">
          Use a blank line to start a new paragraph. The headline can use a line
          break for two lines.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label">Homepage headline</label>
            <textarea
              rows={2}
              className="field resize-none"
              value={draft.heroHeadline}
              onChange={(e) => update({ heroHeadline: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">About headline</label>
            <textarea
              rows={2}
              className="field resize-none"
              value={draft.aboutHeadline}
              onChange={(e) => update({ aboutHeadline: e.target.value })}
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="field-label">Homepage subheading</label>
          <textarea
            rows={3}
            className="field resize-none"
            value={draft.heroSub}
            onChange={(e) => update({ heroSub: e.target.value })}
          />
        </div>

        <div className="mt-4">
          <label className="field-label">About intro text</label>
          <textarea
            rows={5}
            className="field resize-none"
            value={draft.aboutBody}
            onChange={(e) => update({ aboutBody: e.target.value })}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={save}
          disabled={saving}
          className="btn-red disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save settings"}
        </button>
        {saved && (
          <span className="font-semibold text-party-green">Saved ✓</span>
        )}
      </div>
    </div>
  );
}
