"use client";

import { useState } from "react";
import type { PagesContent, SiteInfo } from "@/lib/content";

/**
 * Page copy editor. Lets the owner change the words on every public page —
 * headlines, body text, list items, button labels — without touching code.
 * Structural pieces (forms, calculators, pricing tables, product data) are
 * intentionally not here so an edit can never break a feature.
 *
 * The form is schema-driven: SECTIONS describes which fields show up under each
 * page and how to render them. Values are read/written by dot-path against a
 * single draft object that holds both `pages` and the few page-headline fields
 * that still live on `site` (hero + about).
 */

type Draft = { pages: PagesContent; site: SiteInfo };

type Field =
  | { kind: "text"; label: string; path: string; hint?: string }
  | { kind: "area"; label: string; path: string; rows?: number; hint?: string }
  | { kind: "list"; label: string; path: string; hint?: string }
  | {
      kind: "pairs";
      label: string;
      path: string;
      titleLabel: string;
      descLabel: string;
      descArea?: boolean;
      hint?: string;
    }
  | { kind: "stats"; label: string; path: string; hint?: string };

type Section = { id: string; label: string; blurb?: string; fields: Field[] };

const SECTIONS: Section[] = [
  {
    id: "home",
    label: "Home page",
    blurb: "The main landing page.",
    fields: [
      {
        kind: "area",
        label: "Hero headline",
        path: "site.heroHeadline",
        rows: 2,
        hint: "Put a line break where you want the headline to wrap. The small line above it (“service area”) is set in the Settings tab.",
      },
      { kind: "area", label: "Hero subheading", path: "site.heroSub", rows: 3 },
      { kind: "text", label: "Featured eyebrow", path: "pages.home.featuredEyebrow" },
      { kind: "text", label: "Featured title", path: "pages.home.featuredTitle" },
      { kind: "text", label: "“How it works” eyebrow", path: "pages.home.howEyebrow" },
      { kind: "text", label: "“How it works” title", path: "pages.home.howTitle" },
      {
        kind: "pairs",
        label: "How it works — steps",
        path: "pages.home.howSteps",
        titleLabel: "Step title",
        descLabel: "Step description",
        descArea: true,
        hint: "Numbered automatically (01, 02, 03…).",
      },
      { kind: "text", label: "Bundles eyebrow", path: "pages.home.bundlesEyebrow" },
      { kind: "text", label: "Bundles title", path: "pages.home.bundlesTitle" },
      { kind: "text", label: "Bundles subheading", path: "pages.home.bundlesSub" },
      {
        kind: "pairs",
        label: "Services strip",
        path: "pages.home.servicesStrip",
        titleLabel: "Title",
        descLabel: "Subtext",
      },
      { kind: "text", label: "Gallery eyebrow", path: "pages.home.galleryEyebrow" },
      { kind: "text", label: "Gallery title", path: "pages.home.galleryTitle" },
      { kind: "text", label: "Testimonials eyebrow", path: "pages.home.testimonialsEyebrow" },
      { kind: "text", label: "Testimonials title", path: "pages.home.testimonialsTitle" },
      { kind: "text", label: "Delivery eyebrow", path: "pages.home.deliveryEyebrow" },
      { kind: "text", label: "Delivery title", path: "pages.home.deliveryTitle" },
      { kind: "area", label: "Delivery body", path: "pages.home.deliveryBody", rows: 3 },
      { kind: "list", label: "Delivery bullet points", path: "pages.home.deliveryBullets" },
      { kind: "text", label: "Closing CTA title", path: "pages.home.ctaTitle" },
      { kind: "area", label: "Closing CTA subtext", path: "pages.home.ctaSub", rows: 2 },
    ],
  },
  {
    id: "about",
    label: "About page",
    fields: [
      { kind: "text", label: "Story eyebrow", path: "pages.about.storyEyebrow" },
      {
        kind: "area",
        label: "About headline",
        path: "site.aboutHeadline",
        rows: 2,
        hint: "Line break controls where the headline wraps.",
      },
      {
        kind: "area",
        label: "About intro text",
        path: "site.aboutBody",
        rows: 5,
        hint: "Leave a blank line between paragraphs.",
      },
      { kind: "list", label: "“We specialize in” items", path: "pages.about.specialties" },
      { kind: "area", label: "Closing paragraph", path: "pages.about.closingBody", rows: 3 },
      { kind: "text", label: "Closing tagline", path: "pages.about.closingTagline" },
      { kind: "text", label: "Button label", path: "pages.about.ctaLabel" },
      { kind: "text", label: "Pride eyebrow", path: "pages.about.prideEyebrow" },
      { kind: "text", label: "Pride title", path: "pages.about.prideTitle" },
      {
        kind: "pairs",
        label: "“We take pride in” items",
        path: "pages.about.pride",
        titleLabel: "Heading",
        descLabel: "Detail",
      },
      { kind: "text", label: "Service area eyebrow", path: "pages.about.serviceAreaEyebrow" },
      { kind: "text", label: "Service area title", path: "pages.about.serviceAreaTitle" },
      { kind: "area", label: "Service area body", path: "pages.about.serviceAreaBody", rows: 3 },
      { kind: "text", label: "Service area note", path: "pages.about.serviceAreaNote" },
      { kind: "list", label: "Cities served", path: "pages.about.cities" },
    ],
  },
  {
    id: "services",
    label: "Services page",
    fields: [
      { kind: "text", label: "Eyebrow", path: "pages.services.eyebrow" },
      {
        kind: "area",
        label: "Headline",
        path: "pages.services.headline",
        rows: 2,
        hint: "Line break controls where the headline wraps.",
      },
      {
        kind: "pairs",
        label: "Services list",
        path: "pages.services.services",
        titleLabel: "Service",
        descLabel: "Description",
      },
      { kind: "text", label: "“Who we serve” eyebrow", path: "pages.services.whoEyebrow" },
      { kind: "text", label: "“Who we serve” title", path: "pages.services.whoTitle" },
      {
        kind: "pairs",
        label: "Audiences",
        path: "pages.services.audiences",
        titleLabel: "Audience",
        descLabel: "Description",
      },
      {
        kind: "pairs",
        label: "Our promise",
        path: "pages.services.promise",
        titleLabel: "Heading",
        descLabel: "Detail",
      },
      { kind: "text", label: "CTA title", path: "pages.services.ctaTitle" },
      { kind: "area", label: "CTA subtext", path: "pages.services.ctaSub", rows: 2 },
    ],
  },
  {
    id: "contact",
    label: "Contact page",
    fields: [
      { kind: "text", label: "Eyebrow", path: "pages.contact.eyebrow" },
      {
        kind: "area",
        label: "Headline",
        path: "pages.contact.headline",
        rows: 2,
        hint: "Line break controls where the headline wraps.",
      },
      { kind: "area", label: "Intro text", path: "pages.contact.intro", rows: 3 },
      { kind: "text", label: "Military discount note", path: "pages.contact.militaryNote" },
      { kind: "text", label: "Delivery note", path: "pages.contact.deliveryNote" },
      { kind: "text", label: "Response-time note", path: "pages.contact.respondNote" },
      { kind: "text", label: "Banner title", path: "pages.contact.bannerTitle" },
      { kind: "area", label: "Banner body", path: "pages.contact.bannerBody", rows: 2 },
      {
        kind: "stats",
        label: "Stat tiles",
        path: "pages.contact.stats",
        hint: "Big value on top, small label underneath.",
      },
    ],
  },
  {
    id: "shop",
    label: "Shop page",
    blurb: "Header only — products are managed in the Products tab.",
    fields: [
      { kind: "text", label: "Eyebrow", path: "pages.shop.eyebrow" },
      { kind: "text", label: "Title", path: "pages.shop.title" },
      { kind: "area", label: "Subtitle", path: "pages.shop.subtitle", rows: 2 },
    ],
  },
  {
    id: "bundles",
    label: "Bundles page",
    blurb: "Header + FAQ. Prices and the comparison table come from the Bundles tab.",
    fields: [
      { kind: "text", label: "Header eyebrow", path: "pages.bundles.headerEyebrow" },
      { kind: "text", label: "Header title", path: "pages.bundles.headerTitle" },
      { kind: "area", label: "Header subtitle", path: "pages.bundles.headerSubtitle", rows: 2 },
      {
        kind: "pairs",
        label: "FAQ",
        path: "pages.bundles.faq",
        titleLabel: "Question",
        descLabel: "Answer",
        descArea: true,
      },
    ],
  },
  {
    id: "availability",
    label: "Availability page",
    blurb: "Header only — the live calendar is automatic.",
    fields: [
      { kind: "text", label: "Eyebrow", path: "pages.availability.eyebrow" },
      {
        kind: "area",
        label: "Headline",
        path: "pages.availability.headline",
        rows: 2,
        hint: "Line break controls where the headline wraps.",
      },
      { kind: "area", label: "Subtitle", path: "pages.availability.subtitle", rows: 2 },
    ],
  },
  {
    id: "build",
    label: "Build Your Party page",
    blurb: "Header only — the builder tool is automatic.",
    fields: [
      { kind: "text", label: "Eyebrow", path: "pages.build.eyebrow" },
      { kind: "text", label: "Title", path: "pages.build.title" },
      { kind: "area", label: "Subtitle", path: "pages.build.subtitle", rows: 2 },
    ],
  },
  {
    id: "reviews",
    label: "Reviews page",
    blurb: "Subtitle only — the rating and review cards are automatic.",
    fields: [
      { kind: "area", label: "Subtitle", path: "pages.reviews.subtitle", rows: 2 },
    ],
  },
];

/* ── dot-path helpers (immutable) ─────────────────────────────── */
function getPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}
function setPath<T>(obj: T, path: string, value: unknown): T {
  const keys = path.split(".");
  const clone: any = Array.isArray(obj) ? [...(obj as any)] : { ...(obj as any) };
  let node = clone;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    node[k] = Array.isArray(node[k]) ? [...node[k]] : { ...node[k] };
    node = node[k];
  }
  node[keys[keys.length - 1]] = value;
  return clone;
}

export default function PagesPanel({
  pages,
  site,
}: {
  pages: PagesContent;
  site: SiteInfo;
}) {
  const [draft, setDraft] = useState<Draft>({ pages, site });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [open, setOpen] = useState<string>(SECTIONS[0].id);

  function set(path: string, value: unknown) {
    setDraft((d) => setPath(d, path, value));
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
          pages: draft.pages,
          // Only the page-headline fields that live on `site` — leave the
          // business info (phones/email/social/area) to the Settings tab.
          site: {
            heroHeadline: draft.site.heroHeadline,
            heroSub: draft.site.heroSub,
            aboutHeadline: draft.site.aboutHeadline,
            aboutBody: draft.site.aboutBody,
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
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <p className="max-w-xl text-sm text-party-ink/60">
          Edit the words on any page of your site. These are the things you can
          safely change yourself — headlines, descriptions, lists and button
          text. Features like forms, the calendar and pricing tables stay as-is.
        </p>
      </div>

      {/* Quick jump nav */}
      <div className="flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setOpen(s.id)}
            className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
              open === s.id
                ? "border-party-red bg-party-red text-white"
                : "border-party-ink/15 bg-white text-party-ink/70 hover:border-party-ink/30"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {SECTIONS.filter((s) => s.id === open).map((section) => (
        <div key={section.id} className="rounded-2xl bg-white p-6 shadow-soft">
          <h3 className="font-display text-xl font-bold italic">
            {section.label}
          </h3>
          {section.blurb && (
            <p className="mt-1 text-sm text-party-ink/55">{section.blurb}</p>
          )}
          <div className="mt-5 space-y-5">
            {section.fields.map((field) => (
              <FieldRow
                key={field.path}
                field={field}
                value={getPath(draft, field.path)}
                onChange={(v) => set(field.path, v)}
              />
            ))}
          </div>
        </div>
      ))}

      <div className="sticky bottom-4 flex items-center gap-4 rounded-2xl border border-party-ink/10 bg-white/95 px-5 py-4 shadow-soft backdrop-blur">
        <button
          onClick={save}
          disabled={saving}
          className="btn-red disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save page content"}
        </button>
        {saved && <span className="font-semibold text-party-green">Saved ✓</span>}
        <span className="ml-auto text-xs text-party-ink/45">
          Saves every page — you don't have to switch tabs first.
        </span>
      </div>
    </div>
  );
}

/* ── field renderers ──────────────────────────────────────────── */
function FieldRow({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  if (field.kind === "text") {
    return (
      <Labeled label={field.label} hint={field.hint}>
        <input
          className="field"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      </Labeled>
    );
  }

  if (field.kind === "area") {
    return (
      <Labeled label={field.label} hint={field.hint}>
        <textarea
          rows={field.rows ?? 3}
          className="field resize-none"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      </Labeled>
    );
  }

  if (field.kind === "list") {
    const items = (value as string[]) ?? [];
    return (
      <Labeled label={field.label} hint={field.hint}>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex gap-2">
              <input
                className="field"
                value={item}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = e.target.value;
                  onChange(next);
                }}
              />
              <RemoveBtn onClick={() => onChange(items.filter((_, j) => j !== i))} />
            </div>
          ))}
          <AddBtn onClick={() => onChange([...items, ""])} label="Add item" />
        </div>
      </Labeled>
    );
  }

  if (field.kind === "pairs") {
    const items = (value as { title: string; desc: string }[]) ?? [];
    return (
      <Labeled label={field.label} hint={field.hint}>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div
              key={i}
              className="rounded-xl border border-party-ink/10 bg-party-cream/40 p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-party-ink/45">
                  {field.titleLabel} {i + 1}
                </span>
                <RemoveBtn onClick={() => onChange(items.filter((_, j) => j !== i))} />
              </div>
              <input
                className="field mt-2"
                placeholder={field.titleLabel}
                value={item.title}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = { ...item, title: e.target.value };
                  onChange(next);
                }}
              />
              {field.descArea ? (
                <textarea
                  rows={3}
                  className="field mt-2 resize-none"
                  placeholder={field.descLabel}
                  value={item.desc}
                  onChange={(e) => {
                    const next = [...items];
                    next[i] = { ...item, desc: e.target.value };
                    onChange(next);
                  }}
                />
              ) : (
                <input
                  className="field mt-2"
                  placeholder={field.descLabel}
                  value={item.desc}
                  onChange={(e) => {
                    const next = [...items];
                    next[i] = { ...item, desc: e.target.value };
                    onChange(next);
                  }}
                />
              )}
            </div>
          ))}
          <AddBtn
            onClick={() => onChange([...items, { title: "", desc: "" }])}
            label="Add"
          />
        </div>
      </Labeled>
    );
  }

  // stats
  const items = (value as { big: string; small: string }[]) ?? [];
  return (
    <Labeled label={field.label} hint={field.hint}>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div
            key={i}
            className="rounded-xl border border-party-ink/10 bg-party-cream/40 p-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-party-ink/45">
                Tile {i + 1}
              </span>
              <RemoveBtn onClick={() => onChange(items.filter((_, j) => j !== i))} />
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <input
                className="field"
                placeholder="Big value"
                value={item.big}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = { ...item, big: e.target.value };
                  onChange(next);
                }}
              />
              <input
                className="field"
                placeholder="Small label"
                value={item.small}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = { ...item, small: e.target.value };
                  onChange(next);
                }}
              />
            </div>
          </div>
        ))}
        <AddBtn
          onClick={() => onChange([...items, { big: "", small: "" }])}
          label="Add tile"
        />
      </div>
    </Labeled>
  );
}

function Labeled({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="field-label">{label}</label>
      {hint && <p className="mb-1 text-xs text-party-ink/45">{hint}</p>}
      {children}
    </div>
  );
}

function RemoveBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-sm font-semibold text-party-red/70 hover:text-party-red"
    >
      Remove
    </button>
  );
}

function AddBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-dashed border-party-ink/25 px-3 py-2 text-sm font-semibold text-party-ink/60 hover:border-party-ink/40 hover:text-party-ink"
    >
      + {label}
    </button>
  );
}
