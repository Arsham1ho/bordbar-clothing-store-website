-- Product images were hotlinked from images.unsplash.com, which is blocked
-- or unreliable on Iranian ISPs without a VPN (confirmed: the same page
-- loads fine over VPN, but images fail to load without one). All images
-- are now bundled locally under public/images and served from the same
-- origin as the rest of the site, so this no longer depends on Unsplash
-- being reachable at all.
--
-- This also fixes two things that were already fixed in code but never
-- applied to the live database: product 6's broken photo (from the
-- original "product image not loading" report), and products 2/3's
-- mismatched photos (a men's suit and an off-shoulder dress that showed
-- up instead of the actual coat/suit-set products).
--
-- Run this once in the Supabase SQL editor after deploying the code that
-- adds the public/images files.

update products set images = array['/images/1539109136881-3be0616acf4b.jpg','/images/1515886657613-9f3515b0c78f.jpg'] where id = 1; -- پیراهن ابریشم کلاسیک
update products set images = array['/images/1539533018447-63fcce2678e3.jpg','/images/1618244972963-dbee1a7edc95.jpg'] where id = 2; -- مانتو کشمیر ممتاز
update products set images = array['/images/1573496359142-b8d87734a5a2.jpg','/images/1573497019940-1c28c88b4f3e.jpg'] where id = 3; -- ست کت و شلوار رسمی
update products set images = array['/images/1485968579580-b6d095142e6e.jpg','/images/1534528741775-53994a69daeb.jpg'] where id = 4; -- بلوز لینن تابستانی
update products set images = array['/images/1506629082955-511b1aa562c8.jpg','/images/1509631179647-0177331693ae.jpg'] where id = 5; -- شلوار پارچه‌ای گشاد
update products set images = array['/images/1515372039744-b8f02a3ae446.jpg','/images/1509631179647-0177331693ae.jpg'] where id = 6; -- ست دو تکه آستین‌دار
update products set images = array['/images/1566174053879-31528523f8ae.jpg','/images/1617922001439-4a2e6562f328.jpg'] where id = 7; -- پیراهن مجلسی طلایی
update products set images = array['/images/1525507119028-ed4c629a60a3.jpg','/images/1490481651871-ab68de25d43d.jpg'] where id = 8; -- مانتو کتان بهاره
update products set images = array['/images/1595777457583-95e059d581b8.jpg','/images/1612336307429-8a898d10e223.jpg'] where id = 9; -- پیراهن مجلسی قرمز
update products set images = array['/images/1596783074918-c84cb06531ca.jpg','/images/1499939667766-4afceb292d05.jpg'] where id = 10; -- پیراهن گلدار ساحلی
update products set images = array['/images/1591369822096-ffd140ec948f.jpg','/images/1496747611176-843222e1e57c.jpg'] where id = 11; -- پیراهن جین کژوال
update products set images = array['/images/1483985988355-763728e1935b.jpg','/images/1485462537746-965f33f7f6a7.jpg'] where id = 12; -- پالتو پشمی بلند زرشکی
update products set images = array['/images/1591047139829-d91aecb6caea.jpg','/images/1618244972963-dbee1a7edc95.jpg'] where id = 13; -- کاپشن بمبر شتری
update products set images = array['/images/1608234808654-2a8875faa7fd.jpg','/images/1490114538077-0a7f8cb49891.jpg'] where id = 14; -- کت شلوار پشمی طرح‌دار
update products set images = array['/images/1434389677669-e08b4cac3105.jpg','/images/1509319117193-57bab727e09d.jpg'] where id = 15; -- پانچو بافت کرم
update products set images = array['/images/1617019114583-affb34d1b3cd.jpg','/images/1509319117193-57bab727e09d.jpg'] where id = 16; -- تونیک لینن سفید
update products set images = array['/images/1594633312681-425c7b97ccd1.jpg'] where id = 17; -- شلوار جاگر صورتی
update products set images = array['/images/1552902865-b72c031ac5ea.jpg','/images/1548883354-7622d03aca27.jpg'] where id = 18; -- شلوار کارگو مشکی
update products set images = array['/images/1618932260643-eee4a2f652a6.jpg'] where id = 19; -- رومپر تابستانی زیتونی
update products set images = array['/images/1495385794356-15371f348c31.jpg'] where id = 20; -- جامپ‌سوت ساتن سبزآبی
