"use client";

import { useMemo, useState } from "react";
import type { Category, Product } from "@/lib/types";
import ImageUploader from "./ImageUploader";
import MultiImageEditor from "./MultiImageEditor";

interface Draft {
  name: string;
  price_per_day: number;
  description: string;
  image_url: string;
  images: string[];
  is_available: boolean;
  quantity: number;
  footprint?: [number, number];
  height?: number;
}

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "inflatable", label: "Inflatable / bounce house" },
  { value: "table", label: "Table" },
  { value: "chair", label: "Chair" },
  { value: "tent", label: "Tent" },
];

function blankProduct(): Product {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `custom-${Date.now()}`,
    name: "",
    description: "",
    price_per_day: 0,
    category: "inflatable",
    image_url: "",
    images: [],
    is_available: true,
    quantity: 1,
  };
}

export default function ProductsPanel({
  products,
  customProducts,
}: {
  products: Product[];
  customProducts: Product[];
}) {
  const customIds = useMemo(
    () => new Set(customProducts.map((p) => p.id)),
    [customProducts]
  );
  const baseProducts = useMemo(
    () => products.filter((p) => !customIds.has(p.id)),
    [products, customIds]
  );

  // ── Base catalog: per-product overrides ──
  const [drafts, setDrafts] = useState<Record<string, Draft>>(() =>
    Object.fromEntries(
      baseProducts.map((p) => [
        p.id,
        {
          name: p.name,
          price_per_day: p.price_per_day,
          description: p.description,
          image_url: p.image_url,
          images: p.images ?? [],
          is_available: p.is_available,
          quantity: p.quantity ?? 1,
          footprint: p.footprint,
          height: p.height,
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
      const w = Number(d.footprint?.[0]) || 0;
      const dep = Number(d.footprint?.[1]) || 0;
      const h = Number(d.height) || 0;
      const override = {
        name: d.name,
        price_per_day: Number(d.price_per_day) || 0,
        description: d.description,
        image_url: d.image_url,
        images: d.images.filter(Boolean),
        is_available: d.is_available,
        quantity: Number(d.quantity) || 1,
        // Only override dimensions when valid; otherwise omit (JSON drops
        // undefined) so the product keeps its built-in spec.
        footprint:
          w > 0 && dep > 0 ? ([w, dep] as [number, number]) : undefined,
        height: h > 0 ? h : undefined,
      };
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: { [id]: override } }),
      });
      if (!res.ok) throw new Error();
      setSavedId(id);
    } catch {
      /* ignore */
    } finally {
      setSavingId(null);
    }
  }

  // ── Owner-added products ──
  const [custom, setCustom] = useState<Product[]>(customProducts);
  const [savingCustom, setSavingCustom] = useState(false);
  const [savedCustom, setSavedCustom] = useState(false);

  function setItem(id: string, patch: Partial<Product>) {
    setCustom((list) =>
      list.map((p) => (p.id === id ? { ...p, ...patch } : p))
    );
    setSavedCustom(false);
  }
  function addItem() {
    setCustom((list) => [...list, blankProduct()]);
    setSavedCustom(false);
  }
  function removeItem(id: string) {
    setCustom((list) => list.filter((p) => p.id !== id));
    setSavedCustom(false);
  }

  async function saveCustom() {
    setSavingCustom(true);
    setSavedCustom(false);
    try {
      const cleaned = custom.map((p) => {
        const w = Number(p.footprint?.[0]) || 0;
        const d = Number(p.footprint?.[1]) || 0;
        const h = Number(p.height) || 0;
        return {
          ...p,
          price_per_day: Number(p.price_per_day) || 0,
          quantity: Number(p.quantity) || 1,
          images: (p.images ?? []).filter(Boolean),
          // Only keep real dimensions; a partial/empty footprint would otherwise
          // show as a 0×0 item in the Space & fit checker.
          footprint:
            w > 0 && d > 0 ? ([w, d] as [number, number]) : undefined,
          height: h > 0 ? h : undefined,
        };
      });
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customProducts: cleaned }),
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
      {/* Base catalog */}
      <section className="space-y-5">
        <p className="text-sm text-party-ink/60">
          Edit your catalog — names, prices, descriptions, how many you own,
          availability, and photos. Changes apply across the whole site.
        </p>

        {baseProducts.map((p) => {
          const d = drafts[p.id];
          if (!d) return null;
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
                <div className="grid gap-3 sm:grid-cols-[1fr_120px_120px]">
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
                  <div>
                    <label className="field-label">Qty owned</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      className="field"
                      value={d.quantity}
                      onChange={(e) =>
                        set(p.id, { quantity: Number(e.target.value) })
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

                <div>
                  <label className="field-label">Dimensions (ft)</label>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      className="field"
                      placeholder="Width"
                      value={d.footprint?.[0] ?? ""}
                      onChange={(e) =>
                        set(p.id, {
                          footprint: [
                            Number(e.target.value),
                            d.footprint?.[1] ?? 0,
                          ],
                        })
                      }
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      className="field"
                      placeholder="Depth"
                      value={d.footprint?.[1] ?? ""}
                      onChange={(e) =>
                        set(p.id, {
                          footprint: [
                            d.footprint?.[0] ?? 0,
                            Number(e.target.value),
                          ],
                        })
                      }
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      className="field"
                      placeholder="Height"
                      value={d.height ?? ""}
                      onChange={(e) =>
                        set(p.id, { height: Number(e.target.value) })
                      }
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-party-ink/50">
                    Width × Depth × Height. Inflatables also use these for the
                    Space &amp; fit checker; for other items they&apos;re for
                    your records and the product page.
                  </p>
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
      </section>

      {/* Owner-added products */}
      <section className="space-y-5 border-t border-party-ink/15 pt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Your added products
            </h2>
            <p className="text-sm text-party-ink/60">
              Add brand-new items to your catalog. They show up on the Shop page
              right away.
            </p>
          </div>
          <button onClick={addItem} className="btn-dark !px-5 !py-2 !text-sm">
            + Add a product
          </button>
        </div>

        {custom.length === 0 && (
          <p className="rounded-2xl bg-white p-6 text-center text-sm text-party-ink/50 shadow-soft">
            No added products yet. Click “Add a product” to create one.
          </p>
        )}

        {custom.map((p) => (
          <div
            key={p.id}
            className="grid gap-5 rounded-2xl bg-white p-5 shadow-soft sm:grid-cols-[160px_1fr]"
          >
            <div>
              <ImageUploader
                value={p.image_url}
                onChange={(url) => setItem(p.id, { image_url: url })}
                label={p.image_url ? "Replace photo" : "Add photo"}
              />
            </div>

            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
                <div>
                  <label className="field-label">Name</label>
                  <input
                    className="field"
                    placeholder="e.g. Princess Castle Bounce House"
                    value={p.name}
                    onChange={(e) => setItem(p.id, { name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="field-label">Category</label>
                  <select
                    className="field"
                    value={p.category}
                    onChange={(e) =>
                      setItem(p.id, { category: e.target.value as Category })
                    }
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="field-label">Price / day ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="field"
                    value={p.price_per_day}
                    onChange={(e) =>
                      setItem(p.id, { price_per_day: Number(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <label className="field-label">Qty owned</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className="field"
                    value={p.quantity ?? 1}
                    onChange={(e) =>
                      setItem(p.id, { quantity: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="field-label">Dimensions (ft)</label>
                <div className="grid gap-3 sm:grid-cols-3">
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    className="field"
                    placeholder="Width"
                    value={p.footprint?.[0] ?? ""}
                    onChange={(e) =>
                      setItem(p.id, {
                        footprint: [
                          Number(e.target.value),
                          p.footprint?.[1] ?? 0,
                        ],
                      })
                    }
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    className="field"
                    placeholder="Depth"
                    value={p.footprint?.[1] ?? ""}
                    onChange={(e) =>
                      setItem(p.id, {
                        footprint: [
                          p.footprint?.[0] ?? 0,
                          Number(e.target.value),
                        ],
                      })
                    }
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    className="field"
                    placeholder="Height"
                    value={p.height ?? ""}
                    onChange={(e) =>
                      setItem(p.id, { height: Number(e.target.value) })
                    }
                  />
                </div>
                <p className="mt-1.5 text-xs text-party-ink/50">
                  Width × Depth × Height. Inflatables also use these for the
                  Space &amp; fit checker. Leave blank if not applicable.
                </p>
              </div>

              <div>
                <label className="field-label">Description</label>
                <textarea
                  rows={3}
                  className="field resize-none"
                  value={p.description}
                  onChange={(e) =>
                    setItem(p.id, { description: e.target.value })
                  }
                />
              </div>

              <MultiImageEditor
                images={p.images ?? []}
                onChange={(imgs) => setItem(p.id, { images: imgs })}
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={p.is_available}
                    onChange={(e) =>
                      setItem(p.id, { is_available: e.target.checked })
                    }
                    className="h-4 w-4 accent-party-green"
                  />
                  Available for booking
                </label>
                <button
                  onClick={() => removeItem(p.id)}
                  className="text-sm font-semibold text-party-red hover:underline"
                >
                  Delete
                </button>
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
            {savingCustom ? "Saving…" : "Save added products"}
          </button>
        </div>
      </section>
    </div>
  );
}
