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
| 1 | Stand up backend: Supabase, Resend, update domains in Vercel | L | **Add-on** | Backlog | Foundational infra. Enables persistence, emails, live admin saves. Biggest-ticket item. |
| 2 | Documents page — agreements, privacy, terms | M | Watch | Backlog | New page + legal copy (client to supply text). Mostly content + routing. |
| 3 | Add measurements & specs to products | S | Build | Backlog | Data/content per product; surface on product cards/pages. |
| 4 | Add more blog articles | S–M | Build | Backlog | Content volume depends on # of articles client supplies. |
| 5 | Google reviews live + link out to leave a review | M | **Add-on** | Backlog | Google Places API integration (key, billing, caching). Review-link button is XS; live pull is the cost. |
| 6 | Calendar links + booking notifications | M | Watch | Backlog | ICS/Google Cal links (S) + notification emails on booking (needs Resend → ties to #1). |
| 7 | "Follow the fun" scrolling feature is broken | S | Build | Backlog | Bug fix (Instagram/marquee strip). |
| 8 | Bounce house has dual slides, basketball hoops, climbing walls, wet or dry | XS | Build | Backlog | Product description/spec copy (overlaps #3). |
| 9 | Add military discount to home page | XS | Build | Backlog | Copy/badge on home (already on contact page). |
| 10 | Keep bundle names; info & pricing are wrong | S | Build | Backlog | Correct bundle contents + prices (client to confirm correct numbers). |
| 11 | Swap phone numbers — the …9996 number should be first | XS | Build | Backlog | Settings → phones order. |
| 12 | Add date & time of delivery to the booking form | S | Build | Backlog | New fields on booking form + carry through to order/notification. |
| 13 | Flat **$50 deposit** everywhere, not 50% | S | Build | Backlog | Changes deposit logic (Stripe amount calc, copy in How-it-works/FAQ/bundles). |
| 14 | Service area = anywhere in the DMV; $2.00/mi applies **beyond 15 mi**; calculator must work for any ZIP | M | Watch | Backlog | Needs reliable geocoding for arbitrary ZIPs (Distance Matrix already in stack). Verify edge cases + copy. |
| 15 | Lock the admin portal (real auth) | M | Watch | Backlog | Proper auth gate; ties to #1 (Supabase). More portal feature detail coming from client. |
| 16 | Add Stripe for payments; set client as a developer | M | **Add-on** | Backlog | Live Stripe account + keys + checkout wiring; add client to Stripe team. |
| 17 | Photo cards dynamic — adjust to photos added, no white space | S–M | Build | Backlog | Masonry/auto-fit gallery layout. |
| 18 | "Build Your Party" form — update for ease of use + correct info | S–M | Build | Backlog | UX pass + correct recommendations/pricing. |
| 19 | Admin can add more products, photos, etc. | M–L | Watch | Backlog | Full CRUD (create new items, not just edit overrides). Depends on #1 for persistence. |
| 20 | "Will it fit" — let user choose units (sq ft, inches, ft, etc.) | S | Build | Backlog | Unit toggle + conversions in SpaceChecker. |
| 21 | Some empty spaces — condense a bit | S | Build | Backlog | Spacing/layout polish across pages. |

---

### Scope summary (Batch 1)

- **Build (in fixed price):** #3, #4, #7, #8, #9, #10, #11, #12, #13, #17, #18, #20, #21
- **Watch (track effort, confirm before expanding):** #2, #6, #14, #15, #19
- **Add-on (flag as separate scope / billing):** #1, #5, #16

**Dependencies worth noting:** #1 (Supabase/Resend) unblocks #6 (notifications), #15 (auth), and #19 (admin CRUD). Recommend sequencing #1 first if those proceed. #16 (Stripe) and #13 (deposit) should ship together.

> Keep adding new client requests below with the date received. Re-tally the
> scope summary whenever a new batch lands so total fixed-price exposure stays visible.
