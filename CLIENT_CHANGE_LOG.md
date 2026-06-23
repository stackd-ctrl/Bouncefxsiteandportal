# Client Change Log — Bounce FX Party Rentals

**Engagement type:** Fixed price. This log tracks every change requested by the
client **from 2026-06-15 forward** so we can watch total scope and flag items
that fall outside the original build (potential change-order / add-on work).

**How to read the columns**
- **Size** — rough effort: `XS` (minutes), `S` (≤½ day), `M` (1–2 days), `L` (multi-day / new system).
- **Scope** —
  - `Build` = reasonable polish/content inside the agreed fixed-price website.
  - `Watch` = larger feature or integration that *could* be argued as added scope; track effort and raise with client before it balloons.
  - `Add-on` = clearly new system/integration beyond a standard marketing-site build → discuss as separate scope/billing.
- **Status** — `Backlog` / `In progress` / `Done`.

---

## Batch 1 — requested 2026-06-15

| # | Request | Size | Scope | Status | Notes |
|---|---------|------|-------|--------|-------|
| 1 | Stand up backend: Supabase, Resend, update domains in Vercel | L | Build | Backlog | **In scope** — required to deploy the site with a working admin portal (persistence, emails, live admin saves). Not an add-on. Biggest-effort Build item. |
| 2 | Documents page — agreements, privacy, terms | M | Watch | **Partial** | Client supplied the rental/safety agreement PDF (2026-06-22) → added at `/rental-agreement.pdf`: linked from the booking flow's e-sign step (customer can read full terms) + sendable per-booking from the admin ("Send agreement" pre-fills a customer email; "View PDF"). Remaining: dedicated Documents page + privacy/terms copy (still needs client text). |
| 3 | Add measurements & specs to products | S | Build | Backlog | Data/content per product; surface on product cards/pages. |
| 4 | Add more blog articles | S–M | Build | Backlog | Content volume depends on # of articles client supplies. |
| 5 | Google reviews live + link out to leave a review | M | **Add-on** | **Partial** | Client's 4 real Google reviews (5.0★) added by hand to `REVIEWS` in `src/lib/data.ts` + shown on home + /reviews, replacing the fabricated testimonials; "Read all reviews on Google" link-out added (`GOOGLE_REVIEWS_URL` — ⚠️ currently a Google **search** URL, needs the exact Google Maps profile link from client). Remaining add-on = the *live auto-pull* via Google Places API (key + billing + caching). (2026-06-22) |
| 6 | Calendar links + booking notifications | M | Watch | Backlog | ICS/Google Cal links (S) + notification emails on booking (needs Resend → ties to #1). |
| 7 | "Follow the fun" scrolling feature is broken | S | Build | **Done** | Root cause: `prefers-reduced-motion` CSS froze the marquees. Exempted the decorative brand marquees so they keep scrolling. (2026-06-18) |
| 8 | Bounce house has dual slides, basketball hoops, climbing walls, wet or dry | XS | Build | Backlog | Product description/spec copy (overlaps #3). **Needs client to supply the spec text.** |
| 9 | Add military discount to home page | XS | Build | **Done** | Military-discount pill under the home hero. (2026-06-18) |
| 10 | Bundle names, info & pricing are wrong | S | Build | **Done** | Client supplied final packages (2026-06-22): Small $315 (1 bounce / 2 tables / 16 chairs), Medium $365 (1 bounce / 4 tables / 32 chairs), Large $415 (1 bounce / 6 tables / 48 chairs), Tent Bundle Deal $350 (20x20 tent / 5 tables / 40 chairs). Replaced Bronze/Silver/Gold tiers; rebuilt comparison table as 4 packages; "you save" computed from real per-item rates; Medium = Most Popular. (2026-06-22) |
| 11 | Swap phone numbers — the …9996 number should be first | XS | Build | **Done** | 571-264-9996 now first in `DEFAULT_SITE.phones`. (2026-06-18) |
| 12 | Add date & time of delivery to the booking form | S | Build | **Done** | Preferred delivery date + time fields; shown on review + carried into order notes. (2026-06-18) |
| 13 | Flat **$50 deposit** everywhere, not 50% | S | Build | **Done** | New `lib/pricing.ts` (`depositFor`); checkout + BookingFlow + all copy updated. (2026-06-18) |
| 14 | Service area = anywhere in the DMV; $2.00/mi applies **beyond 15 mi**; calculator must work for any ZIP | M | Watch | **Partial** | Added offline ZIP3-region fallback so any VA/MD/DC ZIP estimates; unknown ZIPs show "we'll confirm" not $0. **Exact any-address distance still needs the Google Maps key (ties to #1).** (2026-06-18) |
| 15 | Lock the admin portal (real auth) | M | Watch | Backlog | Proper auth gate; ties to #1 (Supabase). More portal feature detail coming from client. |
| 16 | Add Stripe for payments; set client as a developer | M | **Add-on** | Backlog | Live Stripe account + keys + checkout wiring; add client to Stripe team. |
| 17 | Photo cards dynamic — adjust to photos added, no white space | S–M | Build | **Done** | Gallery now uniform square auto-fill tiles — gap-free for any photo count. (2026-06-18) |
| 18 | "Build Your Party" form — update for ease of use + correct info | S–M | Build | **Done** | Occasion now drives the recommendation (seating/shade/inflatable sizing) + explainer; clearer labeling. (2026-06-18) |
| 19 | Admin can add more products, photos, adjust inventory, etc. | M–L | Watch | **Built (needs #1 to persist live)** | Done 2026-06-22: (a) **inventory amounts** — every product now has a "Qty owned" field in admin Products; (b) **add/delete custom products** (name, category, price, qty, description, photos, availability) → show on Shop immediately; (c) **add/delete custom bundles** (name, price, compare-at, badge, what's-included lines, item picker, photos) → show on Bundles immediately. Stored in the content store (`customProducts`/`customBundles` + `quantity` override); catalog appends them everywhere. Verified e2e locally. ⚠️ Persists to `content/site.json` locally but is **ephemeral on the live Vercel site until Supabase (#1) is connected** — then it persists with no code change. |
| 20 | "Will it fit" — let user choose units (sq ft, inches, ft, etc.) | S | Build | **Done** | Unit toggle (ft/in/yd/m) + conversions in SpaceChecker. (2026-06-18) |
| 21 | Some empty spaces — condense a bit | S | Build | Backlog | Spacing/layout polish across pages. |

---

### Scope summary (Batch 1)

- **Build (in fixed price):** #1, #3, #4, #7, #8, #9, #10, #11, #12, #13, #17, #18, #20, #21
- **Watch (track effort, confirm before expanding):** #2, #6, #14, #15, #19
- **Add-on (flag as separate scope / billing):** #5, #16

**Backend is in scope (#1):** Supabase + Resend + Vercel domains are required to
deploy the site with the admin portal — treated as core Build, not add-on.

**Dependencies worth noting:** #1 (Supabase/Resend) is the foundation — it unblocks
#6 (notifications), #15 (admin auth/lock), and #19 (admin CRUD persistence). Build
#1 first. #16 (Stripe) and #13 ($50 deposit) should ship together.

> Keep adding new client requests below with the date received. Re-tally the
> scope summary whenever a new batch lands so total fixed-price exposure stays visible.

---

## Batch 2 — requested 2026-06-22

| # | Request | Size | Scope | Status | Notes |
|---|---------|------|-------|--------|-------|
| 22 | Resend email backend (send + reply routing) | M | Build (part of #1) | **Done** | API key added to `.env.local`, domain verified, test email delivered. Customer replies route to `Info@bouncefxpartyrentals.com` (Google Workspace inbox) via reply-to. Contact + review notifications live; booking-confirmation email still needs Stripe (#16) to fire. ⚠️ add `RESEND_API_KEY` to Vercel env for production. |
| 23 | Rental/safety agreement PDF on site + sendable from admin | S | Build | **Done** | See Batch 1 #2 (folded in). |
| 24 | Real Google reviews + link-out | S | Build/Add-on | **Done** | See Batch 1 #5. |
| 25 | Pay-in-full / deposit / partial payment choice + Checkout button | M | Build | **Done** | Booking flow now offers Pay deposit ($50) / Pay in full / Pay a custom partial amount (server-clamped between deposit and total). Confirmation + **admin** show amount paid, payment type (Deposit/Partial/Paid in full) + remaining balance; "Charge balance" hidden when paid in full. Real charging still needs Stripe (#16); works in demo now. (2026-06-22) |
| 26 | Simple one-page checkout (alternative to the multi-step flow) | M | Build | **Done** | New `/checkout` page (`QuickCheckout`): single form — pick items with quantity steppers (grouped by category) + optional bundle, one short details form, deposit/full/partial choice, agreement checkbox, live order summary, pay. Reuses `/api/checkout` (delivery + payment + admin all flow through). Nav **Checkout** button now points here; `/book` remains the guided "Book Now" flow. (2026-06-22) |
| 27 | Professional admin redesign + CRM-lite | L | Watch | **Done** | Rebuilt `/admin` as a dashboard: left **sidebar** nav (icons, no top tabs), neutral gray/white professional palette, **no italic lettering** anywhere (swept all admin headings). Bookings tab is now a **CRM-lite**: sortable columns (click headers), search (name/email/phone/address), status filter + Archived view, **CSV export** + **CSV import**, inline status change, **edit drawer** (customer/date/type/address/notes/status) saved via new `/api/admin/booking-update` (persists when Supabase live, session-only in demo), **archive/restore**, stats cards (revenue/collected/outstanding/upcoming). Rental-agreement email + PDF preserved in the edit drawer. ⚠️ Table is empty until real bookings exist (needs #1); preview via Import CSV. (2026-06-22) |
| 28 | Customers / Leads CRM section (unified) | M | Watch | **Done** | New **Customers** sidebar section: same table rules as Bookings — sortable columns, search, stage filter (new/contacted/quoted/booked) + Archived + **source** filter, **CSV export + import**, inline stage change, **+ Add**, edit drawer, archive/restore. **Unified "one system":** merges three sources deduped by email — (1) **bookings** (auto-derived customers w/ booking count + total spent), (2) **website contact-form** submissions (now persisted as leads via `addLeadFromContact` in `/api/contact`; repeat emails append a dated note), (3) manual/imported leads. Stored in content store (`leads[]` + `Lead` type), auto-saves via `/api/admin/content`. Editing a booking-derived customer "promotes" them into a saved lead. Persists locally now, Supabase once #1 live. Verified contact-form→lead e2e. (2026-06-22) |

### Scope summary (Batch 2)
- **Build (in fixed price):** #22 (part of #1), #23, #25
- **Add-on:** #24 (live Google auto-pull only; manual reviews were free)
