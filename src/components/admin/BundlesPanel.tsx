"use client";

import { useMemo, useState } from "react";
import type { Bundle, Product } from "@/lib/types";
import ImageUploader from "./ImageUploader";
import MultiImageEditor from "./MultiImageEditor";

interface Draft {
  name: string;
  description: string;
  bundle_price: number;
  image_url: string;
  images: string[];
}

function blankBundle(): Bundle {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `custom-${Date.now()}`,
    name: "",
    description: "",
    product_ids: [],
    bundle_price: 0,
    individual_value: 0,
    highlights: [],
    badge: "",
    image_url: "",
    images: [],
  };
}

export default function BundlesPanel({
  bundles,
  customBundles,
  products,
}: {
  bundles: Bundle[];
  customBundles: Bundle[];
  products: Product[];
}) {
  const customIds = useMemo(
    () => new Set(customBundles.map((b) => b.id)),
    [customBundles]
  );
  const baseBundles = useMemo(
    () => bundles.filter((b) => !customIds.has(b.id)),
    [bundles, customIds]
  );

  // ── Base bundles: per-bundle overrides ──
  const [drafts, setDrafts] = useState<Record<string, Draft>>(() =>
    Object.fromEntries(
      baseBundles.map((b) => [
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

  // ── Owner-added bundles ──
  const [custom, setCustom] = useState<Bundle[]>(customBundles);
  const [savingCustom, setSavingCustom] = useState(false);
  const [savedCustom, setSavedCustom] = useState(false);

  function setItem(id: string, patch: Partial<Bundle>) {
    setCustom((list) =>
      list.map((b) => (b.id === id ? { ...b, ...patch } : b))
    );
    setSavedCustom(false);
  }
  function toggleProduct(id: string, productId: string) {
    setCustom((list) =>
      list.map((b) => {
        if (b.id !== id) return b;
        const has = b.product_ids.includes(productId);
        return {
          ...b,
          product_ids: has
            ? b.product_ids.filter((p) => p !== productId)
            : [...b.product_ids, productId],
        };
      })
    );
    setSavedCustom(false);
  }
  function addItem() {
    setCustom((list) => [...list, blankBundle()]);
    setSavedCustom(false);
  }
  function removeItem(id: string) {
    setCustom((list) => list.filter((b) => b.id !== id));
    setSavedCustom(false);
  }

  async function saveCustom() {
    setSavingCustom(true);
    setSavedCustom(false);
    try {
      const cleaned = custom.map((b) => ({
        ...b,
        bundle_price: Number(b.bundle_price) || 0,
        individual_value: Number(b.individual_value) || 0,
        highlights: (b.highlights ?? []).filter(Boolean),
        images: (b.images ?? []).filter(Boolean),
      }));
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customBundles: cleaned }),
      });
      if (!res.ok) throw new Error();
      setSavedCustom(true);
    } catch {
      /* ignore */
    } finally {
      setSavingCustom(false);
    }
  }

  return (
    <div className="space-y-10">
      {/* Base bundles */}
      <section className="space-y-5">
        <p className="text-sm text-party-ink/60">
          Edit your bundle packages and their photos. A primary photo shows on
          the bundle card; additional photos appear in its gallery.
        </p>

        {baseBundles.map((b) => {
          const d = drafts[b.id];
          if (!d) return null;
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
      </section>

      {/* Owner-added bundles */}
      <section className="space-y-5 border-t border-party-ink/15 pt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Your added bundles
            </h2>
            <p className="text-sm text-party-ink/60">
              Build new package deals. They appear on the Bundles page right
              away.
            </p>
          </div>
          <button onClick={addItem} className="btn-dark !px-5 !py-2 !text-sm">
            + Add a bundle
          </button>
        </div>

        {custom.length === 0 && (
          <p className="rounded-2xl bg-white p-6 text-center text-sm text-party-ink/50 shadow-soft">
            No added bundles yet. Click “Add a bundle” to create one.
          </p>
        )}

        {custom.map((b) => (
          <div key={b.id} className="rounded-2xl bg-white p-5 shadow-soft">
            <div className="grid gap-5 sm:grid-cols-[160px_1fr]">
              <div>
                <p className="field-label">Primary photo</p>
                <ImageUploader
                  value={b.image_url ?? ""}
                  onChange={(url) => setItem(b.id, { image_url: url })}
                  label={b.image_url ? "Replace photo" : "Add photo"}
                />
              </div>

              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-[1fr_150px]">
                  <div>
                    <label className="field-label">Name</label>
                    <input
                      className="field"
                      placeholder="e.g. Ultimate Party Package"
                      value={b.name}
                      onChange={(e) => setItem(b.id, { name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="field-label">Badge (optional)</label>
                    <input
                      className="field"
                      placeholder="e.g. Highly Requested"
                      value={b.badge ?? ""}
                      onChange={(e) => setItem(b.id, { badge: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="field-label">Bundle price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="field"
                      value={b.bundle_price}
                      onChange={(e) =>
                        setItem(b.id, { bundle_price: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div>
                    <label className="field-label">
                      Compare-at value ($, optional)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="field"
                      value={b.individual_value}
                      onChange={(e) =>
                        setItem(b.id, {
                          individual_value: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="field-label">Description</label>
                  <textarea
                    rows={2}
                    className="field resize-none"
                    value={b.description}
                    onChange={(e) =>
                      setItem(b.id, { description: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="field-label">
                    What's included (one per line)
                  </label>
                  <textarea
                    rows={4}
                    className="field resize-none"
                    placeholder={"1 bounce house\n4 tables\n32 chairs"}
                    value={(b.highlights ?? []).join("\n")}
                    onChange={(e) =>
                      setItem(b.id, { highlights: e.target.value.split("\n") })
                    }
                  />
                </div>

                <div>
                  <label className="field-label">
                    Items in this bundle (for booking)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {products.map((p) => {
                      const on = b.product_ids.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => toggleProduct(b.id, p.id)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                            on
                              ? "border-transparent bg-party-green text-white"
                              : "border-party-ink/20 bg-white hover:bg-party-cream"
                          }`}
                        >
                          {on ? "✓ " : ""}
                          {p.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <MultiImageEditor
                  images={b.images ?? []}
                  onChange={(imgs) => setItem(b.id, { images: imgs })}
                />

                <div className="flex justify-end">
                  <button
                    onClick={() => removeItem(b.id)}
                    className="text-sm font-semibold text-party-red hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="flex items-center justify-end gap-3">
          {savedCustom && (
            <span className="text-sm font-semibold text-party-green">
              Saved ✓
            </span>
          )}
          <button
            onClick={saveCustom}
            disabled={savingCustom}
            className="btn-red !px-5 !py-2 !text-sm disabled:opacity-50"
          >
            {savingCustom ? "Saving…" : "Save added bundles"}
          </button>
        </div>
      </section>
    </div>
  );
}
