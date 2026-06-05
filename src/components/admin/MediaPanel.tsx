"use client";

import { useState } from "react";
import type { MediaInfo } from "@/lib/content";
import ImageUploader from "./ImageUploader";

export default function MediaPanel({ media }: { media: MediaInfo }) {
  const [draft, setDraft] = useState<MediaInfo>(media);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function update(patch: Partial<MediaInfo>) {
    setDraft((d) => ({ ...d, ...patch }));
    setSaved(false);
  }

  function setGallery(i: number, url: string) {
    const g = [...draft.gallery];
    g[i] = url;
    update({ gallery: g });
  }
  function removeGallery(i: number) {
    update({ gallery: draft.gallery.filter((_, idx) => idx !== i) });
  }
  function addGallery() {
    update({ gallery: [...draft.gallery, ""] });
  }

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          media: { ...draft, gallery: draft.gallery.filter(Boolean) },
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
    <div className="space-y-8">
      <p className="text-sm text-party-ink/60">
        Replace the homepage hero image, your logo, and gallery photos.
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-soft">
          <h3 className="font-display text-lg font-bold italic">Homepage hero</h3>
          <p className="mb-3 text-sm text-party-ink/55">
            The big banner photo at the top of the home page.
          </p>
          <div className="max-w-xs">
            <ImageUploader
              value={draft.hero}
              aspect="aspect-[16/9]"
              onChange={(url) => update({ hero: url })}
              label="Replace hero"
            />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-soft">
          <h3 className="font-display text-lg font-bold italic">Logo</h3>
          <p className="mb-3 text-sm text-party-ink/55">
            Shown in the footer, about, availability, and confirmation.
          </p>
          <div className="max-w-[180px]">
            <ImageUploader
              value={draft.logo}
              aspect="aspect-square"
              onChange={(url) => update({ logo: url })}
              label="Replace logo"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold italic">
            Gallery photos
          </h3>
          <button
            onClick={addGallery}
            className="rounded-lg border border-party-ink/20 px-3 py-1.5 text-sm font-semibold hover:bg-party-cream"
          >
            + Add photo
          </button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {draft.gallery.map((src, i) => (
            <div key={i}>
              <ImageUploader
                value={src}
                aspect="aspect-square"
                onChange={(url) => setGallery(i, url)}
                label="Replace"
              />
              <button
                onClick={() => removeGallery(i)}
                className="mt-1 w-full text-xs font-semibold text-party-red hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={save}
          disabled={saving}
          className="btn-red disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save media"}
        </button>
        {saved && (
          <span className="font-semibold text-party-green">Saved ✓</span>
        )}
      </div>
    </div>
  );
}
