-- Adds a reviews table (with per-criteria ratings and an optional photo) so
-- customers can leave detailed comments on products, plus a public storage
-- bucket for the uploaded review photos.
-- Run this once in the Supabase SQL editor. Independent of schema.sql and
-- add_more_products.sql -- safe to run any time after the initial schema.

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  product_id bigint not null references products(id) on delete cascade,
  author_name text not null,
  rating integer not null check (rating between 1 and 5),
  quality_rating integer not null check (quality_rating between 1 and 5),
  price_rating integer not null check (price_rating between 1 and 5),
  delivery_rating integer not null check (delivery_rating between 1 and 5),
  comment text not null,
  image_url text,
  created_at timestamptz not null default now()
);

alter table reviews enable row level security;

-- Anyone can read reviews and leave one (no customer accounts exist on this
-- site, matching the open checkout flow). No update/delete policy is defined,
-- so reviews are permanent once posted -- including for the admin.
create policy "public read reviews" on reviews
  for select using (true);
create policy "public insert reviews" on reviews
  for insert with check (true);

-- Storage bucket for review photos (public read, public upload).
insert into storage.buckets (id, name, public)
values ('review-photos', 'review-photos', true)
on conflict (id) do nothing;

create policy "public read review photos" on storage.objects
  for select using (bucket_id = 'review-photos');
create policy "public upload review photos" on storage.objects
  for insert with check (bucket_id = 'review-photos');
