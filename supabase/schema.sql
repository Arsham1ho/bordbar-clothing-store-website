-- Bordbar store schema: products, orders, order_items + RLS policies + seed data.
-- Run this once in the Supabase SQL editor (Project -> SQL Editor -> New query).

create table if not exists products (
  id bigint generated always as identity primary key,
  name text not null,
  name_en text not null default '',
  price bigint not null,
  original_price bigint,
  category text not null,
  sizes text[] not null default '{}',
  colors text[] not null default '{}',
  images text[] not null default '{}',
  rating numeric(2,1) not null default 0,
  reviews integer not null default 0,
  in_stock boolean not null default true,
  is_new boolean not null default false,
  description text not null default '',
  material text not null default '',
  care text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  customer_name text not null,
  phone text not null,
  address text not null,
  postal_code text not null default '',
  payment_method text not null default 'online',
  status text not null default 'pending'
    check (status in ('pending', 'gathering', 'packaging', 'shipped', 'delivered', 'cancelled')),
  total bigint not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references orders(id) on delete cascade,
  product_id bigint references products(id) on delete set null,
  product_name text not null,
  size text not null,
  color text not null,
  qty integer not null,
  price bigint not null
);

create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists orders_set_updated_at on orders;
create trigger orders_set_updated_at
  before update on orders
  for each row execute function set_updated_at();

-- Row Level Security ---------------------------------------------------

alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Products: anyone can read the catalog; only a signed-in admin can write.
-- (Public sign-up is left disabled in Auth settings, so "authenticated" only
-- ever means the one admin account created manually in the dashboard.)
create policy "public read products" on products
  for select using (true);
create policy "admin insert products" on products
  for insert with check (auth.role() = 'authenticated');
create policy "admin update products" on products
  for update using (auth.role() = 'authenticated');
create policy "admin delete products" on products
  for delete using (auth.role() = 'authenticated');

-- Orders: checkout (anonymous) can create an order and look it up by its
-- tracking code; only the admin can change its status.
create policy "public insert orders" on orders
  for insert with check (true);
create policy "public read orders" on orders
  for select using (true);
create policy "admin update orders" on orders
  for update using (auth.role() = 'authenticated');

-- Order items: created alongside the order at checkout, read back for
-- tracking / the admin order list. Never updated directly.
create policy "public insert order_items" on order_items
  for insert with check (true);
create policy "public read order_items" on order_items
  for select using (true);

-- Seed data: the 8 products the storefront previously hardcoded ---------

insert into products
  (name, name_en, price, original_price, category, sizes, colors, images, rating, reviews, in_stock, is_new, description, material, care)
values
  ('پیراهن ابریشم کلاسیک', 'Classic Silk Dress', 2850000, 3400000, 'پیراهن',
   array['XS','S','M','L','XL'], array['سرمه‌ای','کرم','مشکی'],
   array['https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&h=750&fit=crop&auto=format','https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=750&fit=crop&auto=format'],
   4.8, 124, true, false,
   'پیراهن ابریشمی زنانه با طراحی کلاسیک و شیک، مناسب برای مجالس رسمی و نیمه‌رسمی. این پیراهن با پارچه ابریشم طبیعی درجه یک دوخته شده و بریدگی‌های ظریف آن به زیبایی اندام می‌افزاید.',
   '100% ابریشم طبیعی', 'خشکشویی توصیه می‌شود. اتو با دمای پایین.'),

  ('مانتو کشمیر ممتاز', 'Premium Cashmere Coat', 5200000, null, 'مانتو',
   array['S','M','L'], array['سرمه‌ای','خاکستری'],
   array['https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600&h=750&fit=crop&auto=format','https://images.unsplash.com/photo-1548549557-dbe9946621da?w=600&h=750&fit=crop&auto=format'],
   4.9, 89, true, false,
   'مانتو کشمیری زنانه با کیفیت استثنایی، گرم‌کننده و در عین حال ظریف. طراحی مینیمال و خطوط تمیز این مانتو آن را برای استفاده روزانه و رسمی مناسب می‌سازد.',
   '90% کشمیر، 10% ابریشم', 'شستشوی دستی با آب سرد. پهن کردن برای خشک شدن.'),

  ('ست کت و شلوار رسمی', 'Formal Suit Set', 7900000, 9200000, 'کت و شلوار',
   array['S','M','L','XL'], array['سرمه‌ای','مشکی','زغالی'],
   array['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=750&fit=crop&auto=format','https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=600&h=750&fit=crop&auto=format'],
   4.7, 56, true, false,
   'ست کت و شلوار رسمی زنانه با پارچه ترکیبی پشمی درجه یک. این ست با طراحی ایتالیایی برای مدیران و بانوان حرفه‌ای مناسب است.',
   '70% پشم، 30% پلی‌استر', 'خشکشویی ضروری است.'),

  ('بلوز لینن تابستانی', 'Summer Linen Blouse', 1450000, null, 'بلوز',
   array['XS','S','M','L'], array['سفید','آبی روشن','بژ'],
   array['https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=600&h=750&fit=crop&auto=format','https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=750&fit=crop&auto=format'],
   4.5, 203, true, false,
   'بلوز لینن سبک و تنفس‌پذیر برای فصل گرما. جنس طبیعی لینن باعث می‌شود در هوای گرم احساس راحتی کنید.',
   '100% لینن طبیعی', 'قابل شستشو در ماشین با آب ولرم.'),

  ('شلوار پارچه‌ای گشاد', 'Wide-leg Trousers', 2100000, 2600000, 'شلوار',
   array['S','M','L','XL'], array['مشکی','کرم','سرمه‌ای'],
   array['https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&h=750&fit=crop&auto=format','https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=750&fit=crop&auto=format'],
   4.6, 178, true, false,
   'شلوار پارچه‌ای گشاد با طراحی مدرن و راحت. این شلوار هم برای محیط اداری و هم برای گردش مناسب است.',
   '65% ویسکوز، 35% پلی‌استر', 'قابل شستشو در ماشین.'),

  ('ست دو تکه آستین‌دار', 'Two-piece Sleeve Set', 3600000, null, 'ست',
   array['S','M','L'], array['سرمه‌ای','بورگاندی'],
   array['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=750&fit=crop&auto=format','https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=750&fit=crop&auto=format'],
   4.8, 67, false, false,
   'ست دو تکه زنانه شامل تاپ و شلوار با طراحی هماهنگ. مناسب برای اوقات فراغت و گردش.',
   '95% کتان، 5% اسپاندکس', 'شستشو با آب سرد.'),

  ('پیراهن مجلسی طلایی', 'Gold Evening Dress', 8500000, 10000000, 'پیراهن',
   array['XS','S','M','L'], array['طلایی','نقره‌ای'],
   array['https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&h=750&fit=crop&auto=format','https://images.unsplash.com/photo-1617922001439-4a2e6562f328?w=600&h=750&fit=crop&auto=format'],
   4.9, 45, true, false,
   'پیراهن مجلسی لوکس با پارچه مزون‌دوزی شده و جزئیات دوخت ظریف. مناسب برای مراسم عروسی و مهمانی‌های رسمی.',
   'ساتن + دانتل فرانسوی', 'خشکشویی تخصصی الزامی.'),

  ('مانتو کتان بهاره', 'Spring Cotton Coat', 2950000, null, 'مانتو',
   array['S','M','L','XL'], array['سفید','آبی','سبز سیج'],
   array['https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=600&h=750&fit=crop&auto=format','https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=750&fit=crop&auto=format'],
   4.4, 132, true, false,
   'مانتو بهاره سبک از جنس کتان درجه یک با کیفیت برتر. طراحی ساده و شیک مناسب استفاده روزانه.',
   '100% کتان', 'شستشو با آب ولرم.');
