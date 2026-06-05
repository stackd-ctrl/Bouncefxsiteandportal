-- ============================================================
--  Bounce FX Party Rentals — Supabase schema
--  Run this in the Supabase SQL editor (or via the CLI) once.
-- ============================================================

create extension if not exists "pgcrypto";

-- ─────────────── PRODUCTS ───────────────
create table if not exists public.products (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  description   text default '',
  price_per_day numeric(10,2) not null default 0,
  category      text not null check (category in ('inflatable','table','chair','tent','bundle')),
  image_url     text default '',
  is_available  boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ─────────────── BUNDLES ───────────────
create table if not exists public.bundles (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  description      text default '',
  product_ids      text[] not null default '{}',
  bundle_price     numeric(10,2) not null default 0,
  individual_value numeric(10,2) not null default 0,
  tier             text check (tier in ('bronze','silver','gold')),
  highlights       text[] default '{}',
  created_at       timestamptz not null default now()
);

-- ─────────────── BOOKINGS ───────────────
create table if not exists public.bookings (
  id                       uuid primary key default gen_random_uuid(),
  product_ids              text[] not null default '{}',
  event_date               date not null,
  customer_name            text not null,
  customer_email           text not null,
  customer_phone           text default '',
  event_address            text default '',
  event_type               text default 'Other',
  special_requests         text,
  total_amount             numeric(10,2) not null default 0,
  deposit_amount           numeric(10,2) not null default 0,
  delivery_fee             numeric(10,2) not null default 0,
  stripe_payment_intent_id text,
  status                   text not null default 'pending'
                             check (status in ('pending','confirmed','completed','cancelled')),
  created_at               timestamptz not null default now()
);

create index if not exists bookings_event_date_idx on public.bookings (event_date);
create index if not exists bookings_status_idx on public.bookings (status);

-- ============================================================
--  Row Level Security
-- ============================================================
alter table public.products enable row level security;
alter table public.bundles  enable row level security;
alter table public.bookings enable row level security;

-- Public can read the catalog (anon key).
drop policy if exists "public read products" on public.products;
create policy "public read products" on public.products
  for select using (true);

drop policy if exists "public read bundles" on public.bundles;
create policy "public read bundles" on public.bundles
  for select using (true);

-- Bookings hold customer PII. They are read/written exclusively by the server
-- using the SUPABASE_SERVICE_ROLE_KEY (which bypasses RLS) — see
-- src/lib/bookings.ts and the admin/webhook routes. We therefore grant NO
-- anon/authenticated policies on bookings: with RLS enabled and no policy, the
-- public anon/authenticated keys can neither read nor write rows. This avoids
-- exposing every customer's name/email/phone/address to any signed-in user.
drop policy if exists "authenticated read bookings" on public.bookings;
drop policy if exists "authenticated update bookings" on public.bookings;
-- (If you ever need client-side access, add an admin_users table and scope
--  policies with auth.uid()/email instead of a blanket `using (true)`.)

-- ============================================================
--  Admin content store (powers the mini admin portal / CMS)
-- ============================================================
create table if not exists public.site_content (
  id   text primary key default 'singleton',
  data jsonb not null default '{}'::jsonb
);

alter table public.site_content enable row level security;

-- Anyone can read content (it's public site copy/media).
drop policy if exists "public read site_content" on public.site_content;
create policy "public read site_content" on public.site_content
  for select using (true);
-- Writes happen via the service role key (admin portal) which bypasses RLS.

-- ── Storage bucket for admin-uploaded media (logos, hero, product, gallery) ──
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Public read of the media bucket.
drop policy if exists "public read media" on storage.objects;
create policy "public read media" on storage.objects
  for select using (bucket_id = 'media');
-- Uploads use the service role key (admin portal), which bypasses RLS.
