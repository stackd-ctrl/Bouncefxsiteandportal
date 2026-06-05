"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import ImageUploader from "./ImageUploader";
import MultiImageEditor from "./MultiImageEditor";

interface Draft {
  name: string;
  price_per_day: number;
  description: string;
  image_url: string;
  images: string[];
  is_available: boolean;
}

export default function ProductsPanel({ products }: { products: Product[] }) {
  const [drafts, setDrafts] = useState<Record<string, Draft>>(() =>
    Object.fromEntries(
      products.map((p) => [
        p.id,
        {
          name: p.name,
          price_per_day: p.price_per_day,
          description: p.description,
          image_url: p.image_url,
          images: p.images ?? [],
          is_available: p.is_available,
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
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          products: {
            [id]: { ...drafts[id], images: drafts[id].images.filter(Boolean) },
          },
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
        Edit product names, prices, descriptions, availability, and photos.
        Changes apply across the whole site.
      </p>

      {products.map((p) => {
        const d = drafts[p.id];
        return (
          <div
            key={p.id}
            className="grid gap-5 rounded-2xl bg-white p-5 shadow-soft sm:grid-cols-[160px_1fr]"
          >
            <div>
              <ImageUploader
                value={d.image_url}
                onChange={(url) => set(p.id, { image_url: url })}
              />
            </div>

            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
                <div>
                  <label className="field-label">Name</label>
                  <input
                    className="field"
                    value={d.name}
                    onChange={(e) => set(p.id, { name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="field-label">Price / day ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="field"
                    value={d.price_per_day}
                    onChange={(e) =>
                      set(p.id, { price_per_day: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="field-label">Description</label>
                <textarea
                  rows={3}
                  className="field resize-none"
                  value={d.description}
                  onChange={(e) => set(p.id, { description: e.target.value })}
                />
              </div>

              <MultiImageEditor
                images={d.images}
                onChange={(imgs) => set(p.id, { images: imgs })}
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={d.is_available}
                    onChange={(e) =>
                      set(p.id, { is_available: e.target.checked })
                    }
                    className="h-4 w-4 accent-party-green"
                  />
                  Available for booking
                </label>
                <div className="flex items-center gap-3">
                  {savedId === p.id && (
                    <span className="text-sm font-semibold text-party-green">
                      Saved ✓
                    </span>
                  )}
                  <button
                    onClick={() => save(p.id)}
                    disabled={savingId === p.id}
                    className="btn-red !px-5 !py-2 !text-sm disabled:opacity-50"
                  >
                    {savingId === p.id ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
