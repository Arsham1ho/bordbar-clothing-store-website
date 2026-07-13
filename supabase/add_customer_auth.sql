-- Adds customer accounts (phone + OTP) with order history, and fixes a real
-- security gap found while building this: the admin panel only checked for
-- "any logged-in session", and the products/orders write policies checked
-- "authenticated" rather than "is actually the admin". Both would let any
-- customer who signs up reach admin powers once public accounts exist.
--
-- Run this once in the Supabase SQL editor, AFTER enabling Phone auth +
-- an SMS provider in Dashboard -> Authentication -> Providers.

-- ─── profiles ────────────────────────────────────────────────────────────

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text,
  full_name text,
  address text,
  postal_code text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "own profile read" on profiles
  for select using (auth.uid() = id);
create policy "own profile update" on profiles
  for update using (auth.uid() = id);

-- Auto-create a profile row for every new signup (customers only -- the
-- existing admin account already exists and is promoted manually below).
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, phone)
  values (new.id, new.phone);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Security-definer helper so RLS policies can check role without a
-- recursive RLS lookup against profiles itself.
create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

-- ─── orders: link to an account, and lock down who can read what ─────────

alter table orders add column if not exists user_id uuid references auth.users(id);

drop policy if exists "public read orders" on orders;
create policy "owner or admin read orders" on orders
  for select using (auth.uid() = user_id or is_admin());

drop policy if exists "public read order_items" on order_items;
create policy "owner or admin read order_items" on order_items
  for select using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
        and (orders.user_id = auth.uid() or is_admin())
    )
  );

-- Guest order lookup by tracking code (security definer so it can read
-- past the now-restricted SELECT policy above, but it only ever returns
-- the single order matching the exact code -- no enumeration possible).
create or replace function get_order_by_code(p_code text)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_order jsonb;
begin
  select to_jsonb(o) || jsonb_build_object(
    'order_items', coalesce((select jsonb_agg(to_jsonb(i)) from order_items i where i.order_id = o.id), '[]'::jsonb)
  )
  into v_order
  from orders o
  where o.code = p_code;

  return v_order;
end;
$$;

-- ─── Replace "authenticated = admin" assumption with a real role check ───

drop policy if exists "admin insert products" on products;
create policy "admin insert products" on products
  for insert with check (is_admin());
drop policy if exists "admin update products" on products;
create policy "admin update products" on products
  for update using (is_admin());
drop policy if exists "admin delete products" on products;
create policy "admin delete products" on products
  for delete using (is_admin());

drop policy if exists "admin update orders" on orders;
create policy "admin update orders" on orders
  for update using (is_admin());

-- ─── Manual step: promote your existing admin account ────────────────────
-- The trigger above only fires for NEW signups going forward. Run this
-- once, replacing the email with the admin account you created earlier:
--
-- update profiles set role = 'admin'
-- where id = (select id from auth.users where email = 'your-admin-email@example.com');
