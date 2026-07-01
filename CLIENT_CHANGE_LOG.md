# Client Change Log — Bounce FX Party Rentals

**Engagement type:** Fixed price. This log tracks every change requested by the
client **from 2026-06-15 forward** so we can watch total scope and flag items
that fall outside the original build (potential change-order / add-on work).

---

## 🚦 Launch readiness — status as of 2026-06-30

**All development work is complete, committed, pushed (`main`), and typecheck-green.
Backend (Supabase + Resend + Stripe live) is verified working and the production
Vercel site is up.** The only remaining items are user/client actions, not code:

**Blocking launch (user must do):**
- **Vercel prod env parity** — client **confirmed Vercel env is set** (2026-06-30). Keep `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_*`, live Stripe keys, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY` (+ optional `OWNER_CALENDAR_EMAIL`) in sync on any future key rotation.
- **Custom domain cutover** — point `bouncefxpartyrentals.com` DNS to Vercel.

**Optional / not blocking (works without them via fallbacks or is an add-on):**
- **Google Maps API key** (#14) — **no longer needed for address validation** (that now uses free OpenStreetMap geocoding, #29). The Maps key only adds *exact driving-distance* mileage; without it the geocoded-coordinate + ZIP-region estimate covers the DMV.
- **Client content** — product spec copy (#3/#8), more blog articles (#4), Privacy/Terms copy review (#2). _(Reviews profile URL #5 now resolved.)_
- **Live Google reviews auto-pull** (#5 add-on) — Places API key + billing; the 4 real reviews are already shown statically and the "Read all reviews" link now points at the real profile.

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
| 1 | Stand up backend: Supabase, Resend, update domains in Vercel | L | Build | **Done** | Backend live (verified 2026-06-30): Supabase anon + service_role keys work (REST 200); `site_content` table + `media` Storage bucket provisioned; Resend live (domain verified). Admin persistence + emails functional. Remaining launch step is user-side: confirm the same keys are in **Vercel prod env** + final domain cutover. |
| 2 | Documents page — agreements, privacy, terms | M | Watch | **Done** | Dedicated `/documents` hub + `/privacy` + `/terms` pages shipped (commit `521e406`, live on prod), linking the signed `rental-agreement.pdf`; footer legal links + sitemap entries added. Privacy/Terms use standard party-rental boilerplate — **client should review the copy** and send any edits, but nothing is blocked. Agreement PDF still linked from the booking e-sign step + sendable per-booking from admin. |
| 3 | Add measurements & specs to products | S | Build | Backlog | Data/content per product; surface on product cards/pages. |
| 4 | Add more blog articles | S–M | Build | Backlog | Content volume depends on # of articles client supplies. |
| 5 | Google reviews live + link out to leave a review | M | **Add-on** | **Partial** | Client's 4 real Google reviews (5.0★) added by hand to `REVIEWS` in `src/lib/data.ts` + shown on home + /reviews, replacing the fabricated testimonials; "Read all reviews on Google" link-out now points at the **real Bounce FX Google Business profile** (kgmid `/g/11zbr8kym4`, from the client's share.google link, resolved 2026-06-30) → `GOOGLE_REVIEWS_URL`. Remaining add-on = the *live auto-pull* via Google Places API (key + billing + caching). (2026-06-30) |
| 6 | Calendar links + booking notifications | M | Watch | **Done** | `lib/calendar.ts` builds all-day `.ics` + Google Calendar links (commit `db71441`). Booking-confirmation email now has an "Add to Google Calendar" button + `.ics` attachment; new `sendOwnerBookingNotification` emails the business a booking summary + a REQUEST `.ics` invite that auto-drops into their Google Calendar. Owner routing via `OWNER_CALENDAR_EMAIL` (defaults to `Info@bouncefxpartyrentals.com`). |
| 7 | "Follow the fun" scrolling feature is broken | S | Build | **Done** | Root cause: `prefers-reduced-motion` CSS froze the marquees. Exempted the decorative brand marquees so they keep scrolling. (2026-06-18) |
| 8 | Bounce house has dual slides, basketball hoops, climbing walls, wet or dry | XS | Build | Backlog | Product description/spec copy (overlaps #3). **Needs client to supply the spec text.** |
| 9 | Add military discount to home page | XS | Build | **Done** | Military-discount pill under the home hero. (2026-06-18) |
| 10 | Bundle names, info & pricing are wrong | S | Build | **Done** | Client supplied final packages (2026-06-22): Small $315 (1 bounce / 2 tables / 16 chairs), Medium $365 (1 bounce / 4 tables / 32 chairs), Large $415 (1 bounce / 6 tables / 48 chairs), Tent Bundle Deal $350 (20x20 tent / 5 tables / 40 chairs). Replaced Bronze/Silver/Gold tiers; rebuilt comparison table as 4 packages; "you save" computed from real per-item rates; Medium = Most Popular. (2026-06-22) |
| 11 | Swap phone numbers — the …9996 number should be first | XS | Build | **Done** | 571-264-9996 now first in `DEFAULT_SITE.phones`. (2026-06-18) |
| 12 | Add date & time of delivery to the booking form | S | Build | **Done** | Preferred delivery date + time fields; shown on review + carried into order notes. (2026-06-18) |
| 13 | Flat **$50 deposit** everywhere, not 50% | S | Build | **Done** | New `lib/pricing.ts` (`depositFor`); checkout + BookingFlow + all copy updated. (2026-06-18) |
| 14 | Service area = anywhere in the DMV; $2.00/mi applies **beyond 15 mi**; calculator must work for any ZIP | M | Watch | **Partial** | Added offline ZIP3-region fallback so any VA/MD/DC ZIP estimates; unknown ZIPs show "we'll confirm" not $0. **Exact any-address distance still needs the Google Maps key (ties to #1).** (2026-06-18) |
| 15 | Lock the admin portal (real auth) | M | Watch | **Done** | Real Supabase Auth login at `/admin/login` (`signInWithPassword`); `src/lib/auth.ts` **fails closed in production** (no demo bypass unless `ADMIN_DEMO=1`), grants access to `ADMIN_EMAIL` owner + a managed allow-list. Verified 2026-06-30: owner user `info@bouncefxpartyrentals.com` exists in Supabase Auth and can sign in. |
| 16 | Add Stripe for payments; set client as a developer | M | **Add-on** | **Done** | Stripe **live** (2026-06-30): live keys wired, hosted-checkout deposit/full/partial flow, live webhook endpoint `we_1To5Q20zzgisUQtAEOCS9OVt` → `/api/webhooks/stripe` (`checkout.session.completed`) fires booking-confirmation email. Catalog seeded via `npm run stripe:seed`; admin comp code `ADMINFX2026` = 100% off. Remaining user step: confirm live Stripe keys + `STRIPE_WEBHOOK_SECRET` are in Vercel prod env. |
| 17 | Photo cards dynamic — adjust to photos added, no white space | S–M | Build | **Done** | Gallery now uniform square auto-fill tiles — gap-free for any photo count. (2026-06-18) |
| 18 | "Build Your Party" form — update for ease of use + correct info | S–M | Build | **Done** | Occasion now drives the recommendation (seating/shade/inflatable sizing) + explainer; clearer labeling. (2026-06-18) |
| 19 | Admin can add more products, photos, adjust inventory, etc. | M–L | Watch | **Done** | Done 2026-06-22: (a) **inventory amounts** — every product now has a "Qty owned" field in admin Products; (b) **add/delete custom products** (name, category, price, qty, description, photos, availability) → show on Shop immediately; (c) **add/delete custom bundles** (name, price, compare-at, badge, what's-included lines, item picker, photos) → show on Bundles immediately. Stored in the content store (`customProducts`/`customBundles` + `quantity` override); catalog appends them everywhere. Verified e2e locally. Supabase now connected (#1 Done 2026-06-30) → admin edits **persist live** via the `site_content` row + `media` bucket. |
| 20 | "Will it fit" — let user choose units (sq ft, inches, ft, etc.) | S | Build | **Done** | Unit toggle (ft/in/yd/m) + conversions in SpaceChecker. (2026-06-18) |
| 21 | Some empty spaces — condense a bit | S | Build | **Done** | Standardized interior section padding to `py-16 md:py-20` (was `py-20 md:py-28` on home, `py-16 md:py-24` on subpages) so stacked sections no longer leave large empty bands. Home/services/contact/bundles/city/PageHeader. (2026-06-30) |

---

### Scope summary (Batch 1)

- **Build (in fixed price):** #1 ✅, #3 ⏳content, #4 ⏳content, #7 ✅, #8 ⏳content, #9 ✅, #10 ✅, #11 ✅, #12 ✅, #13 ✅, #17 ✅, #18 ✅, #20 ✅, #21 (optional polish)
- **Watch (track effort, confirm before expanding):** #2 ✅, #6 ✅, #14 ⏳Maps-key, #15 ✅, #19 ✅
- **Add-on (flag as separate scope / billing):** #5 (manual done; live pull = add-on), #16 ✅

_✅ = shipped & verified · ⏳ = waiting on client content/key · remaining code work: none blocking._

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

---

## Batch 3 — requested 2026-06-30

| # | Request | Size | Scope | Status | Notes |
|---|---------|------|-------|--------|-------|
| 29 | Require real delivery addresses (junk like "123 akjhjkda" was accepted) | S | Build | **Done** | Event address is now **geocoded** (OpenStreetMap Nominatim — free, no API key) to confirm it's a real, deliverable street address before the booking can proceed. `getDeliveryQuote` returns `valid` (true / false / null) + `resolvedAddress`; a real address also gets a fee estimated from its actual coordinates. Booking flow + Quick Checkout validate as you type (debounced), show "✓ Delivering to …" or a red "we couldn't find that address — call/text 571-264-9996" message, and gate submit. `/api/checkout` **hard-rejects** a confirmed-junk address server-side before Stripe. Fails open to a light format check only if the geocoder is unreachable, so a real customer is never blocked by an outage. (2026-06-30) |

### Scope summary (Batch 3)
- **Build (in fixed price):** #29
