# 🎈 Bounce FX Party Rentals

A modern, mobile-first website rebuild for **Bounce FX Party Rentals** — a party
equipment & inflatable rental company serving Fredericksburg, VA and the DMV.

> _Party vibes made easy._ Browse rentals, check live availability, calculate
> delivery, and book online with a simple Stripe deposit.

Built with **Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase ·
Stripe · Resend · Vercel**.

---

## ✨ Features

- **Bold, playful brand design** — neo-brutalist party aesthetic with chunky
  cards, hard shadows, confetti, and the Fredoka display font.
- **Full rental catalog** with category filters (inflatables, tables, chairs,
  tents, bundles).
- **Availability calendar** — pick a date and instantly see what's free.
- **3-step booking flow** — choose items & date → details → deposit checkout.
- **Delivery rate calculator** — free within 15 mi of 22401, $2/mile beyond
  (Google Distance Matrix API with an offline ZIP fallback).
- **Stripe deposit payments** (50%) with a webhook that confirms the booking and
  emails the customer via Resend.
- **Bundle packages** — Bronze / Silver / Gold tiers.
- **Admin dashboard** — bookings, revenue, upcoming schedule, status updates;
  protected by Supabase auth (owner email only).

### 🟢 Works with zero setup

The site is built to **render fully in local dev with no API keys**. Without
Supabase/Stripe configured it falls back to a static catalog, an interactive
calendar, and a demo checkout + sample admin data — so you can preview the whole
design immediately. Add credentials to go live.

---

## 🚀 Getting started

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

---

## 🔧 Configuration

Copy `.env.example` → `.env.local` and fill in what you need:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase client |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side writes (bookings) & seeding |
| `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe payments |
| `STRIPE_WEBHOOK_SECRET` | Verify Stripe webhooks |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | Confirmation & contact emails |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` / `GOOGLE_MAPS_API_KEY` | Delivery distance |
| `NEXT_PUBLIC_SITE_URL` | Absolute URLs for Stripe redirects |
| `ADMIN_EMAIL` | Email allowed into `/admin` |

### Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Run `supabase/schema.sql` in the SQL editor.
3. Add the URL + keys to `.env.local`.
4. Seed the catalog:

   ```bash
   npm run seed
   ```

5. Create the owner account (Authentication → Users → _Add user_) using the
   email you set in `ADMIN_EMAIL`, then log in at `/admin/login`.

### Stripe

1. Add your secret + publishable keys.
2. Create a webhook endpoint pointing at `/api/webhooks/stripe` for the
   `checkout.session.completed` event, and copy the signing secret into
   `STRIPE_WEBHOOK_SECRET`.
3. Local testing:

   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

### Google Maps (delivery)

Enable the **Distance Matrix API** and add the key. Without it, the calculator
uses a built-in ZIP-code distance estimate for the DMV region.

---

## 🗂 Project structure

```
src/
  app/
    page.tsx                  Home
    shop/                     Catalog + category filter
    availability/             Calendar availability explorer
    book/                     3-step booking flow + confirmation
    bundles/                  Bundle packages
    services/  about/  contact/
    admin/                    Owner dashboard + login
    api/
      checkout/               Create Stripe deposit session
      webhooks/stripe/        Confirm booking + email
      availability/           Booked items for a date
      delivery/               Delivery quote
      contact/                Contact form → email
      admin/booking-status/   Update booking status
  components/                 Navbar, Footer, ProductCard, BookingFlow, …
  lib/                        types, data, supabase, stripe, delivery, email
supabase/
  schema.sql                  Tables + RLS
  seed.ts                     Catalog seeder (npm run seed)
```

---

## 📦 Deployment (Vercel)

1. Push to GitHub and import the repo in Vercel.
2. Add every variable from `.env.example` in the Vercel project settings.
3. Set `NEXT_PUBLIC_SITE_URL` to your production domain.
4. Add the Stripe webhook for the deployed URL.
5. Deploy — `vercel.json` is already configured.

---

## 🎨 Brand

- **Name:** Bounce FX Party Rentals
- **Tagline:** Make Your Event Memorable · _Party vibes made easy_
- **Area:** Fredericksburg, VA & the DMV
- **Email:** Info@bouncefxpartyrentals.com
- **Instagram:** [@bouncefxpartyrentals](https://instagram.com/bouncefxpartyrentals)
- **Facebook:** [facebook.com/share/1B5t1NjTLc](https://facebook.com/share/1B5t1NjTLc)

> 🖼 Product images currently use Unsplash placeholders. Swap `image_url` values
> in `src/lib/data.ts` (and re-seed) with the real product photos when ready.

---

Built by **Hicks Virtual Solutions LLC**.
