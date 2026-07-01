"use client";

import { useState } from "react";
import type { SiteInfo, AdminProfile } from "@/lib/content";

export default function SettingsPanel({
  site,
  email,
  adminProfiles,
}: {
  site: SiteInfo;
  email: string | null;
  adminProfiles: Record<string, AdminProfile>;
}) {
  const [draft, setDraft] = useState<SiteInfo>(site);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // ── Your profile (admin-only; never shown on the public site) ──
  const key = (email ?? "").toLowerCase();
  const [profile, setProfile] = useState<AdminProfile>(
    adminProfiles[key] ?? {}
  );
  const [savingProfile, setSavingProfile] = useState(false);
  const [savedProfile, setSavedProfile] = useState(false);

  async function saveProfile() {
    if (!key) return;
    setSavingProfile(true);
    setSavedProfile(false);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send the full merged map so we don't drop other admins' profiles.
        body: JSON.stringify({
          adminProfiles: { ...adminProfiles, [key]: profile },
        }),
      });
      if (!res.ok) throw new Error();
      setSavedProfile(true);
    } catch {
      /* ignore */
    } finally {
      setSavingProfile(false);
    }
  }

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
          // Only the business-info fields this tab owns. Page headlines on
          // `site` (hero/about) are edited from the Pages tab, so leaving them
          // out keeps the two tabs from overwriting each other.
          site: {
            phones: draft.phones.filter(Boolean),
            email: draft.email,
            instagram: draft.instagram,
            facebook: draft.facebook,
            tagline: draft.tagline,
            areaText: draft.areaText,
          },
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
      {/* Your profile — admin-only */}
      <div className="rounded-2xl bg-white p-6 shadow-soft">
        <h3 className="text-base font-bold text-gray-900">Your profile</h3>
        <p className="mt-1 text-sm text-party-ink/60">
          Just for your admin dashboard greeting — this is{" "}
          <span className="font-semibold">not shown anywhere on the public
          website</span>.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label">Your name</label>
            <input
              className="field"
              placeholder="e.g. Chanel"
              value={profile.displayName ?? ""}
              onChange={(e) => {
                setProfile((p) => ({ ...p, displayName: e.target.value }));
                setSavedProfile(false);
              }}
            />
          </div>
          <div>
            <label className="field-label">Role / title (optional)</label>
            <input
              className="field"
              placeholder="e.g. Owner"
              value={profile.role ?? ""}
              onChange={(e) => {
                setProfile((p) => ({ ...p, role: e.target.value }));
                setSavedProfile(false);
              }}
            />
          </div>
        </div>
        {email && (
          <p className="mt-3 text-xs text-gray-400">Signed in as {email}</p>
        )}
        <div className="mt-4 flex items-center gap-4">
          <button
            onClick={saveProfile}
            disabled={savingProfile || !key}
            className="btn-red disabled:opacity-50"
          >
            {savingProfile ? "Saving…" : "Save profile"}
          </button>
          {savedProfile && (
            <span className="font-semibold text-party-green">Saved ✓</span>
          )}
        </div>
      </div>

      <p className="text-sm text-party-ink/60">
        Your business contact details — shown in the footer, on the contact
        page, and in search listings. To edit the words on a specific page, use
        the <span className="font-semibold">Pages</span> tab.
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
