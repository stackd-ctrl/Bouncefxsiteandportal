"use client";

import { useState } from "react";
import type { Bundle } from "@/lib/types";
import ImageUploader from "./ImageUploader";
import MultiImageEditor from "./MultiImageEditor";

interface Draft {
  name: string;
  description: string;
  bundle_price: number;
  image_url: string;
  images: string[];
}

export default function BundlesPanel({ bundles }: { bundles: Bundle[] }) {
  const [drafts, setDrafts] = useState<Record<string, Draft>>(() =>
    Object.fromEntries(
      bundles.map((b) => [
        b.id,
        {
          name: b.name,
          description: b.description,
          bundle_price: b.bundle_price,
          image_url: b.image_url ?? "",
          images: b.images ?? [],
        },
      ])
    )
  );
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  function set(id: string, patch: Partial<Draft>) {
    setDrafts((d) => ({ ...d, [id]: { ...d[id], ...patch } }));
    setSavedId(null);
  }

  async function save(id: string) {
    setSavingId(id);
    setSavedId(null);
    try {
      const d = drafts[id];
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bundles: { [id]: { ...d, images: d.images.filter(Boolean) } },
        }),
      });
      if (!res.ok) throw new Error();
      setSavedId(id);
    } catch {
      /* ignore */
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-party-ink/60">
        Add photos to your bundle packages and edit their details. A primary
        photo shows on the bundle card; additional photos appear in its gallery.
      </p>

      {bundles.map((b) => {
        const d = drafts[b.id];
        return (
          <div
            key={b.id}
            className="grid gap-5 rounded-2xl bg-white p-5 shadow-soft sm:grid-cols-[160px_1fr]"
          >
            <div>
              <p className="field-label">Primary photo</p>
              <ImageUploader
                value={d.image_url}
                onChange={(url) => set(b.id, { image_url: url })}
                label={d.image_url ? "Replace photo" : "Add photo"}
              />
            </div>

            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
                <div>
                  <label className="field-label">Name</label>
                  <input
                    className="field"
                    value={d.name}
                    onChange={(e) => set(b.id, { name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="field-label">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="field"
                    value={d.bundle_price}
                    onChange={(e) =>
                      set(b.id, { bundle_price: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="field-label">Description</label>
                <textarea
                  rows={2}
                  className="field resize-none"
                  value={d.description}
                  onChange={(e) => set(b.id, { description: e.target.value })}
                />
              </div>

              <MultiImageEditor
                images={d.images}
                onChange={(imgs) => set(b.id, { images: imgs })}
              />

              <div className="flex items-center justify-end gap-3">
                {savedId === b.id && (
                  <span className="text-sm font-semibold text-party-green">
                    Saved ✓
                  </span>
                )}
                <button
                  onClick={() => save(b.id)}
                  disabled={savingId === b.id}
                  className="btn-red !px-5 !py-2 !text-sm disabled:opacity-50"
                >
                  {savingId === b.id ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
