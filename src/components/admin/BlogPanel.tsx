"use client";

import { useState } from "react";
import type { Post, Block } from "@/lib/posts";
import { prettyDate, todayISO } from "@/lib/format";

/** Editable post = a Post plus the body kept as plain text while editing. */
type Editable = Post & { _bodyText: string; _open: boolean };

/* ── body <-> plain text ─────────────────────────────────────────
   Blank line = new paragraph. A line starting with "## " is a heading.
   A block of lines each starting with "- " is a bullet list. */
function blocksToText(body: Block[]): string {
  return (body ?? [])
    .map((b) => {
      if (b.h) return `## ${b.h}`;
      if (b.ul) return b.ul.map((i) => `- ${i}`).join("\n");
      return b.p ?? "";
    })
    .join("\n\n");
}

function textToBlocks(text: string): Block[] {
  return text
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      if (chunk.startsWith("## ")) return { h: chunk.slice(3).trim() };
      const lines = chunk.split("\n").filter((l) => l.trim());
      if (lines.length > 0 && lines.every((l) => l.trim().startsWith("- "))) {
        return { ul: lines.map((l) => l.trim().slice(2).trim()) };
      }
      return { p: lines.join(" ") };
    });
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function toEditable(p: Post): Editable {
  return { ...p, _bodyText: blocksToText(p.body), _open: false };
}

function blankPost(): Editable {
  return {
    slug: "",
    title: "",
    excerpt: "",
    date: todayISO(),
    readMins: 3,
    category: "Planning",
    body: [],
    _bodyText: "",
    _open: true,
  };
}

export default function BlogPanel({ posts }: { posts: Post[] }) {
  const [items, setItems] = useState<Editable[]>(posts.map(toEditable));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(i: number, patch: Partial<Editable>) {
    setItems((list) => list.map((p, j) => (j === i ? { ...p, ...patch } : p)));
    setSaved(false);
  }
  function add() {
    setItems((list) => [blankPost(), ...list]);
    setSaved(false);
  }
  function remove(i: number) {
    setItems((list) => list.filter((_, j) => j !== i));
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    setSaved(false);
    setError(null);
    // Build final posts: parse body text, fill slug from title, drop empties.
    const cleaned: Post[] = items
      .filter((p) => p.title.trim())
      .map((p) => ({
        slug: (p.slug.trim() || slugify(p.title)) as string,
        title: p.title.trim(),
        excerpt: p.excerpt.trim(),
        date: p.date || todayISO(),
        readMins: Number(p.readMins) || 1,
        category: p.category.trim() || "Planning",
        body: textToBlocks(p._bodyText),
      }));
    // Guard against duplicate slugs (they'd collide on the public route).
    const slugs = cleaned.map((p) => p.slug);
    const dupe = slugs.find((s, i) => slugs.indexOf(s) !== i);
    if (dupe) {
      setError(`Two articles share the URL "/blog/${dupe}". Make slugs unique.`);
      setSaving(false);
      return;
    }
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customPosts: cleaned }),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
    } catch {
      setError("Could not save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="max-w-xl text-sm text-party-ink/60">
          Add, edit, or remove blog articles. They appear on your public Blog
          page right after you save. Slugs become the article&apos;s web address
          (<span className="font-mono">/blog/your-slug</span>).
        </p>
        <button onClick={add} className="btn-dark !px-5 !py-2 !text-sm">
          + New article
        </button>
      </div>

      {items.length === 0 && (
        <p className="rounded-2xl bg-white p-6 text-center text-sm text-party-ink/50 shadow-soft">
          No articles yet. Click “New article” to write your first one.
        </p>
      )}

      <div className="space-y-5">
        {items.map((p, i) => (
          <div key={i} className="rounded-2xl bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => set(i, { _open: !p._open })}
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
                aria-expanded={p._open}
              >
                <span
                  className={`shrink-0 text-party-ink/40 transition-transform ${
                    p._open ? "rotate-90" : ""
                  }`}
                >
                  ▸
                </span>
                <span className="truncate font-display text-base font-bold italic text-gray-900">
                  {p.title || "Untitled article"}
                </span>
                <span className="shrink-0 text-xs text-party-ink/45">
                  {p.category}
                  {p.date ? ` · ${prettyDate(p.date)}` : ""}
                </span>
              </button>
              <button
                onClick={() => remove(i)}
                className="shrink-0 text-sm font-semibold text-party-red hover:underline"
              >
                Delete
              </button>
            </div>

            {p._open && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="field-label">Title</label>
                <input
                  className="field"
                  placeholder="e.g. 5 Tips for a Great Backyard Party"
                  value={p.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    // Auto-fill slug from title until the owner customizes it.
                    const autoSlug =
                      !p.slug || p.slug === slugify(p.title)
                        ? slugify(title)
                        : p.slug;
                    set(i, { title, slug: autoSlug });
                  }}
                />
              </div>
              <div>
                <label className="field-label">URL slug</label>
                <input
                  className="field"
                  placeholder="backyard-party-tips"
                  value={p.slug}
                  onChange={(e) => set(i, { slug: slugify(e.target.value) })}
                />
              </div>
              <div>
                <label className="field-label">Category</label>
                <input
                  className="field"
                  placeholder="Planning · Safety · Ideas · Community"
                  value={p.category}
                  onChange={(e) => set(i, { category: e.target.value })}
                />
              </div>
              <div>
                <label className="field-label">Date</label>
                <input
                  type="date"
                  className="field"
                  value={p.date}
                  onChange={(e) => set(i, { date: e.target.value })}
                />
              </div>
              <div>
                <label className="field-label">Read time (mins)</label>
                <input
                  type="number"
                  min="1"
                  className="field"
                  value={p.readMins}
                  onChange={(e) =>
                    set(i, { readMins: Number(e.target.value) })
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <label className="field-label">Excerpt (card preview)</label>
                <textarea
                  rows={2}
                  className="field resize-none"
                  placeholder="One or two sentences shown on the blog list."
                  value={p.excerpt}
                  onChange={(e) => set(i, { excerpt: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="field-label">Article body</label>
                <p className="mb-1 text-xs text-party-ink/45">
                  Leave a blank line between paragraphs. Start a line with “## ”
                  for a heading, or “- ” for a bullet point.
                </p>
                <textarea
                  rows={10}
                  className="field resize-none font-mono text-sm"
                  placeholder={
                    "Intro paragraph here.\n\n## A heading\n\nSome more text.\n\n- First point\n- Second point"
                  }
                  value={p._bodyText}
                  onChange={(e) => set(i, { _bodyText: e.target.value })}
                />
              </div>
            </div>
            )}
          </div>
        ))}
      </div>

      <div className="sticky bottom-4 flex items-center gap-4 rounded-2xl border border-party-ink/10 bg-white/95 px-5 py-4 shadow-soft backdrop-blur">
        <button
          onClick={save}
          disabled={saving}
          className="btn-red disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save articles"}
        </button>
        {saved && <span className="font-semibold text-party-green">Saved ✓</span>}
        {error && (
          <span className="text-sm font-semibold text-party-red">{error}</span>
        )}
      </div>
    </div>
  );
}
