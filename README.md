# GreenCart

An eco-friendly marketplace built with React, TypeScript, Vite and Supabase. Buyers
browse certified sustainable products and track the carbon impact of their orders;
sellers manage a storefront, catalogue and order queue; admins moderate listings,
users and categories.

## Stack

| Layer | Choice |
|-------|--------|
| UI | React 18, TypeScript, Tailwind CSS v4, Radix / shadcn primitives |
| Routing | React Router v7 (data router, all pages code-split) |
| Backend | Supabase — Postgres, Auth, Storage, Realtime |
| Build | Vite 6 |

## Getting started

```bash
pnpm install
cp .env.example .env.local   # then fill in your Supabase project details
pnpm dev
```

The app runs at http://localhost:5173.

### Environment variables

Both are read from `.env.local` and are required:

| Variable | Where to find it |
|----------|------------------|
| `VITE_SUPABASE_URL` | Supabase dashboard → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase dashboard → Settings → API → `anon` public key |

`.env.local` is gitignored — never commit real credentials.

## Database setup

Run these against your Supabase project, in order:

1. `supabase_structure.sql` — tables, indexes, triggers and RLS policies
2. `db_fix.sql` — replaces the recursive order policies with a `SECURITY DEFINER` helper
3. `supabase_seller_seeding.sql` and `supabase_product_seeding.sql` — optional demo data

`scripts/seed.mjs` is an alternative to the seeding SQL: it creates demo seller accounts
through the Auth API and then their stores and products.

```bash
VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... node scripts/seed.mjs
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start the Vite dev server |
| `pnpm typecheck` | Run TypeScript with no emit |
| `pnpm build` | Typecheck, then build to `dist/` |
| `pnpm preview` | Serve the production build locally |

## Scripts directory

`scripts/` holds one-off Node utilities used during development (seeding, auth and
query smoke checks). They read `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from
the environment.

## Roles

Role lives on `profiles.role` and is read from the database rather than the JWT, so
access changes take effect without re-issuing a token.

| Role | Can reach |
|------|-----------|
| `buyer` | Marketplace, cart, checkout, orders, wishlist, dashboard |
| `seller` | Everything above, plus `/seller/*` |
| `admin` | Everything, plus `/admin/*` |

`AuthGuard` sends unauthenticated visitors to `/` and wrong-role visitors to `/forbidden`.

## Project documentation

- [`PRD.md`](PRD.md) — product requirements, personas, scope
- [`Architecture.md`](Architecture.md) — system design, schema, RLS, storage, realtime
- [`src/imports/greencart-ui-prototype.md`](src/imports/greencart-ui-prototype.md) — the original UI design brief and colour palette
