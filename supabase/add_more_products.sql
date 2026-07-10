-- Adds 12 more products across every category (some categories only had 1 item).
-- Run this once in the Supabase SQL editor. Safe to run independently of schema.sql
-- since it only inserts new rows and doesn't touch the existing table/policies.

insert into products
  (name, name_en, price, original_price, category, sizes, colors, images, rating, reviews, in_stock, is_new, description, material, care)
values
  ('پیراهن مجلسی قرمز', 'Red Evening Gown', 7200000, 8300000, 'پیراهن',
   array['XS','S','M','L'], array['قرمز','شرابی'],
   array['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=750&fit=crop&auto=format','https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=600&h=750&fit=crop&auto=format'],
   4.7, 38, true, true,
   'پیراهن مجلسی بلند با پارچه ابریشمی و طراحی دراماتیک، مناسب برای مهمانی‌های شب و مراسم ویژه.',
   'ابریشم مصنوعی درجه یک', 'خشکشویی تخصصی توصیه می‌شود.'),

  ('پیراهن گلدار ساحلی', 'Floral Beach Maxi Dress', 1890000, 2200000, 'پیراهن',
   array['XS','S','M','L'], array['صورتی','کرم'],
   array['https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=600&h=750&fit=crop&auto=format','https://images.unsplash.com/photo-1499939667766-4afceb292d05?w=600&h=750&fit=crop&auto=format'],
   4.5, 92, true, false,
   'پیراهن بلند گلدار با پارچه سبک و جاری، انتخابی ایده‌آل برای گردش‌های تابستانی و مسافرت.',
   'ویسکوز', 'شستشو با آب سرد و دست.'),

  ('پیراهن جین کژوال', 'Casual Denim Shirt Dress', 1650000, null, 'پیراهن',
   array['S','M','L'], array['آبی'],
   array['https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=600&h=750&fit=crop&auto=format','https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&h=750&fit=crop&auto=format'],
   4.4, 61, true, false,
   'پیراهن جین کژوال با بریدگی جلو باز و طراحی راحت، مناسب برای استفاده روزمره.',
   '100% جین کتان', 'قابل شستشو در ماشین.'),

  ('پالتو پشمی بلند زرشکی', 'Long Burgundy Wool Coat', 6400000, 7500000, 'مانتو',
   array['S','M','L','XL'], array['زرشکی','صورتی'],
   array['https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=750&fit=crop&auto=format','https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=600&h=750&fit=crop&auto=format'],
   4.8, 54, true, true,
   'پالتوی پشمی بلند با برش کلاسیک و یقه پهن، گرم‌کننده و مناسب فصل سرد با ظاهری شیک.',
   '80% پشم، 20% پلی‌استر', 'خشکشویی توصیه می‌شود.'),

  ('کاپشن بمبر شتری', 'Camel Bomber Jacket', 2300000, null, 'مانتو',
   array['S','M','L'], array['شتری'],
   array['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=750&fit=crop&auto=format','https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?w=600&h=750&fit=crop&auto=format'],
   4.3, 47, true, false,
   'کاپشن بمبر سبک با پارچه ضدآب، مناسب برای اواسط فصل و استایل‌های کژوال روزانه.',
   'پلی‌استر', 'شستشو با دمای پایین.'),

  ('کت شلوار پشمی طرح‌دار', 'Plaid Blazer Suit', 6900000, 7800000, 'کت و شلوار',
   array['S','M','L','XL'], array['طوسی'],
   array['https://images.unsplash.com/photo-1608234808654-2a8875faa7fd?w=600&h=750&fit=crop&auto=format','https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=600&h=750&fit=crop&auto=format'],
   4.6, 29, true, true,
   'ست کت و شلوار پشمی طرح‌دار با برش دو دکمه، انتخابی حرفه‌ای برای محیط کار و جلسات رسمی.',
   '70% پشم، 30% پلی‌استر', 'خشکشویی ضروری است.'),

  ('پانچو بافت کرم', 'Cream Knit Poncho', 1250000, null, 'بلوز',
   array['S','M','L'], array['کرم'],
   array['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&h=750&fit=crop&auto=format','https://images.unsplash.com/photo-1509319117193-57bab727e09d?w=600&h=750&fit=crop&auto=format'],
   4.2, 33, true, false,
   'پانچوی بافتنی با حاشیه ریش‌ریش، گرم و راحت برای روزهای پاییزی.',
   'آکریلیک', 'شستشوی دستی توصیه می‌شود.'),

  ('تونیک لینن سفید', 'White Linen Tunic', 1540000, null, 'بلوز',
   array['S','M','L','XL'], array['سفید'],
   array['https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?w=600&h=750&fit=crop&auto=format','https://images.unsplash.com/photo-1509319117193-57bab727e09d?w=600&h=750&fit=crop&auto=format'],
   4.5, 71, true, false,
   'تونیک لینن سبک و بلند با کمربند، مناسب برای هوای گرم و استایل‌های خلاقانه.',
   '100% لینن', 'قابل شستشو در ماشین با آب ولرم.'),

  ('شلوار جاگر صورتی', 'Pink Jogger Pants', 1320000, null, 'شلوار',
   array['S','M','L'], array['صورتی'],
   array['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=750&fit=crop&auto=format'],
   4.4, 58, true, false,
   'شلوار جاگر ساتن با کمر کش و جیب‌های کاربردی، ترکیبی از راحتی و شیک‌پوشی.',
   'ساتن پلی‌استر', 'شستشو با آب سرد.'),

  ('شلوار کارگو مشکی', 'Black Cargo Pants', 1780000, null, 'شلوار',
   array['S','M','L','XL'], array['مشکی','سبز ارتشی'],
   array['https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&h=750&fit=crop&auto=format','https://images.unsplash.com/photo-1548883354-7622d03aca27?w=600&h=750&fit=crop&auto=format'],
   4.3, 44, true, false,
   'شلوار کارگو با جیب‌های متعدد و طراحی یوتیلیتی، مناسب برای استایل‌های خیابانی و کژوال.',
   'کتان سنگین', 'قابل شستشو در ماشین.'),

  ('رومپر تابستانی زیتونی', 'Olive Summer Romper', 1980000, null, 'ست',
   array['XS','S','M'], array['زیتونی'],
   array['https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?w=600&h=750&fit=crop&auto=format'],
   4.6, 27, true, true,
   'رومپر یک‌تکه با کمربند و جیب‌های جلو، انتخابی راحت و شیک برای فصل گرما.',
   'ویسکوز', 'شستشوی دستی.'),

  ('جامپ‌سوت ساتن سبزآبی', 'Teal Satin Jumpsuit', 3450000, 3900000, 'ست',
   array['S','M','L'], array['سبزآبی'],
   array['https://images.unsplash.com/photo-1495385794356-15371f348c31?w=600&h=750&fit=crop&auto=format'],
   4.7, 35, true, true,
   'جامپ‌سوت ساتن با یقه هالتر و کمربند، طراحی خاص برای مهمانی‌های شب.',
   'ساتن', 'خشکشویی توصیه می‌شود.');
