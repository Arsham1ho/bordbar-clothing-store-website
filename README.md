# Bordbar Clothing Store

Storefront and admin panel for the Bordbar clothing store — a React single-page
app built with Vite and backed by Supabase.

## Stack

- **React 18** + **TypeScript**, bundled by **Vite**
- **Supabase** (`@supabase/supabase-js`) for the database, auth and storage
- **lucide-react** for icons
- Deployed to **Vercel**

## Features

- Product catalogue with category browsing and featured products
- Cart and checkout, including a fixed add-to-cart bar and bottom sheets on mobile
- Customer accounts and login
- Product reviews
- An admin panel under `/admin` (see `src/admin/`)
- All images and fonts are **self-hosted** from `public/` rather than pulled from
  a CDN, so the site loads inside Iran without a VPN

## Getting started

```bash
pnpm install
pnpm dev      # vite --host 0.0.0.0
```

Then build and preview a production bundle with:

```bash
pnpm build
pnpm preview
```

## Configuration

Copy `.env.example` to `.env` and fill in your Supabase project URL and anon key.

## Database

SQL for the Supabase project lives in `supabase/`:

| File | Purpose |
| --- | --- |
| `schema.sql` | Base tables |
| `add_customer_auth.sql` | Customer authentication |
| `add_reviews_table.sql` | Product reviews |
| `add_mock_reviews.sql` | Sample review data |
| `add_more_products.sql` | Sample product data |
| `migrate_images_to_self_hosted.sql` | Repoints product images at self-hosted assets |

Apply them in that order against a fresh project.

## Deployment

`vercel.json` contains a rewrite so that client-side routes such as `/admin`
resolve to `index.html` instead of returning a 404.
