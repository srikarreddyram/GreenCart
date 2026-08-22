# Marketplace Platform — Architecture Document
**Version 1.0 | March 2026 | Confidential**

| Frontend | Styling | Backend | Database |
|----------|---------|---------|----------|
| React 18 + Vite 6 | Tailwind CSS v4 | Supabase | PostgreSQL 15 |

---

## Table of Contents
1. [System Overview](#1-system-overview)
2. [Frontend Architecture](#2-frontend-architecture)
3. [Database Schema](#3-database-schema)
4. [Row-Level Security (RLS) Policies](#4-row-level-security-rls-policies)
5. [Supabase Storage](#5-supabase-storage)
6. [Supabase Realtime](#6-supabase-realtime)
7. [Authentication Flow](#7-authentication-flow)
8. [Environment Configuration & Deployment](#8-environment-configuration--deployment)
9. [Performance Strategy](#9-performance-strategy)
10. [Security Checklist](#10-security-checklist)
11. [Key Dependencies Reference](#11-key-dependencies-reference)

---

## 1. System Overview

The marketplace platform follows a client-server architecture where a React single-page application (SPA) communicates directly with Supabase via its JavaScript SDK. Supabase acts as the sole backend layer, providing PostgreSQL for persistence, PostgREST auto-generated REST APIs, GoTrue for authentication, Realtime via Postgres CDC, and an S3-compatible storage layer.

> **Architecture Pattern:** Single-Page Application (SPA) + Backend-as-a-Service (BaaS). The frontend owns all UI logic and state; Supabase owns all data, auth, real-time, and file storage. There is no custom API server in v1.0 — business logic lives in Postgres functions and Row-Level Security policies.

### 1.1 High-Level Component Diagram

| Layer | Technology | Responsibility |
|-------|-----------|---------------|
| Browser / Client | React 18 SPA (Vite build) | Renders UI, manages local state, calls Supabase SDK |
| Supabase Auth | GoTrue service | JWT issuance, session refresh, OAuth providers, email verification |
| Supabase DB | PostgreSQL 15 + PostgREST | Stores all app data; RLS policies enforce access control |
| Supabase Storage | S3-compatible object store | Product images, avatars, store banners; served via CDN |
| Supabase Realtime | Phoenix Channels + Postgres CDC | Streams DB change events (orders, status) to subscribed clients |

### 1.2 Request Flow

Every client action follows one of these three patterns:

- **Read:** React component → `supabase.from('table').select()` → PostgREST → PostgreSQL → JSON response
- **Write:** React component → `supabase.from('table').insert/update/delete()` → PostgREST → PostgreSQL (RLS check) → response
- **Realtime:** `supabase.channel('orders').on('postgres_changes')` → Phoenix Channel subscription → CDC event pushed to client
- **Storage:** `supabase.storage.from('bucket').upload(file)` → GoTrue validates JWT → S3 write → CDN-served URL returned

---

## 2. Frontend Architecture

### 2.1 Project Structure

```
src/
├── main.tsx                     # Vite entry — mounts <App /> and imports global CSS
├── app/
│   ├── App.tsx                  # RouterProvider
│   ├── Root.tsx                 # Providers, Suspense boundary, Toaster
│   ├── routes.ts                # Route definitions (all pages lazy-loaded)
│   ├── components/
│   │   ├── ui/                  # Radix + shadcn base primitives
│   │   ├── AuthGuard.tsx        # Route-level auth + role gate
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── PageLoader.tsx       # Shared full-page loading state
│   │   └── figma/               # ImageWithFallback
│   └── pages/
│       ├── *.tsx                # Buyer + public pages (Login, Shop, Checkout, …)
│       ├── seller/              # Onboarding, Dashboard, Products, Orders, Store
│       └── admin/               # Users, Listings, Analytics, Categories
├── contexts/
│   ├── AuthContext.tsx          # Supabase session, profile and role
│   └── CartContext.tsx          # Cart items + actions, persisted to localStorage
├── hooks/
│   ├── useProducts.ts           # Product queries + CRUD helpers
│   ├── useOrders.ts             # Buyer orders, realtime subscription, placeOrder()
│   ├── useSellerData.ts         # Seller KPIs, order queue, store settings
│   ├── useAdminData.ts          # Platform-wide GMV, signups, category mix
│   └── useWishlist.ts           # Shared wishlist store, persisted to localStorage
├── lib/
│   ├── supabase.ts              # createClient() singleton
│   ├── storage.ts               # Storage bucket helpers + CDN URL builder
│   └── currency.ts              # INR price formatting
├── types/
│   └── database.types.ts        # Mirrors the schema in §3.2
├── styles/
│   ├── index.css                # Entry — imports the three files below
│   ├── fonts.css
│   ├── tailwind.css             # Tailwind v4 directives
│   └── theme.css                # CSS variables
└── vite-env.d.ts                # import.meta.env typings
```

### 2.2 Routing Strategy

React Router v7 manages all navigation. Every page is code-split with `lazy()`, so
`Root.tsx` wraps the `<Outlet />` in a `<Suspense>` boundary. `AuthGuard` redirects
unauthenticated users to `/` (the login page) and unauthorised roles to `/forbidden`.

| Route | Access | Description |
|-------|--------|------------|
| `/` | Public | Login page |
| `/signup` | Public | Role-selection sign-up flow |
| `/forbidden` | Public | Shown when a role lacks access to a route |
| `/home` | Auth | Marketplace homepage with featured products |
| `/shop` | Auth | Catalogue with filter sidebar |
| `/product/:id` | Auth | Product detail page |
| `/checkout` | Auth | Cart review, shipping form, order placement |
| `/payment` | Auth | Payment method selection and confirmation |
| `/orders` | Auth | Buyer order history |
| `/dashboard` | Auth | Buyer dashboard — impact stats and recent orders |
| `/wishlist` | Auth | Saved products |
| `/about` | Auth | About page |
| `/seller/*` | Auth: seller, admin | Onboarding, dashboard, products, orders, store settings |
| `/admin/*` | Auth: admin | Users, listings, analytics, categories |
| `*` | — | 404 page |

### 2.3 State Management

No global state library is used. State is distributed across:

- **Supabase SDK:** server state (products, orders, profiles) — fetched and cached in custom hooks
- **React useState / useReducer:** local UI state (modals, form values, filters)
- **React Context:** `AuthContext` (current user + role), `CartContext` (cart items + actions)
- **Module-level store:** `useWishlist` shares one wishlist across every component that reads it
- **localStorage:** cart and wishlist survive reloads (`greencart_cart`, `greencart_wishlist`)

### 2.4 Supabase Client Setup

```ts
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: { eventsPerSecond: 10 },
    },
  }
)
```

### 2.5 Key Component Patterns

#### Product Image Upload *(planned — not yet implemented)*

Sellers currently supply an image URL; direct uploads to Supabase Storage are the
intended replacement. `src/lib/storage.ts` already provides the bucket helpers,
CDN URL builders and `validateImageFile()` this pattern would use.

```ts
// src/hooks/useUpload.ts
export function useUpload(bucket: string) {
  const uploadFile = async (file: File, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true, contentType: file.type })
    if (error) throw error
    return supabase.storage.from(bucket).getPublicUrl(data.path).data.publicUrl
  }
  return { uploadFile }
}
```

#### Real-time Order Subscription

```ts
// src/hooks/useOrders.ts
export function useOrderRealtime(orderId: string, onUpdate: (order: Order) => void) {
  useEffect(() => {
    const channel = supabase
      .channel(`order:${orderId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`,
      }, (payload) => onUpdate(payload.new as Order))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [orderId])
}
```

---

## 3. Database Schema

All tables live in the `public` schema. Row-Level Security is enabled on every table. Supabase Auth users are extended via a `profiles` table that stores role and additional metadata.

### 3.1 Entity Relationship Overview

| Table | Cardinality | Description |
|-------|------------|------------|
| `profiles` | 1 : 1 → `auth.users` | Extends Supabase auth with role, avatar, bio |
| `stores` | N : 1 → `profiles` (seller) | A seller owns one store |
| `categories` | self-ref | `parent_id` allows nested category tree |
| `products` | N : 1 → `stores` | Each product belongs to one seller's store |
| `product_images` | N : 1 → `products` | Up to 8 images per product |
| `product_variants` | N : 1 → `products` | Size/colour variants with own stock |
| `cart_items` | N : 1 → `profiles` (buyer) | Persistent cart linked to user |
| `orders` | N : 1 → `profiles` (buyer) | One order per checkout |
| `order_items` | N : 1 → `orders` + `products` | Line items per order |
| `reviews` | N : 1 → `products` + `profiles` | Rating + review text from verified buyers |
| `audit_logs` | N : 1 → `profiles` (admin) | Records all admin actions |

### 3.2 Full Schema SQL

```sql
-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists pg_trgm;

-- ─────────────────────────────────────────────
-- PROFILES (extends auth.users)
-- ─────────────────────────────────────────────
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  role         text not null check (role in ('buyer','seller','admin')) default 'buyer',
  display_name text,
  avatar_url   text,
  bio          text,
  phone        text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ─────────────────────────────────────────────
-- STORES
-- ─────────────────────────────────────────────
create table public.stores (
  id          uuid primary key default uuid_generate_v4(),
  owner_id    uuid not null references public.profiles(id) on delete cascade,
  name        text not null,
  slug        text unique not null,
  description text,
  logo_url    text,
  banner_url  text,
  is_active   boolean default true,
  created_at  timestamptz default now()
);

-- ─────────────────────────────────────────────
-- CATEGORIES
-- ─────────────────────────────────────────────
create table public.categories (
  id        uuid primary key default uuid_generate_v4(),
  name      text not null,
  slug      text unique not null,
  parent_id uuid references public.categories(id),
  icon_url  text
);

-- ─────────────────────────────────────────────
-- PRODUCTS
-- ─────────────────────────────────────────────
create table public.products (
  id            uuid primary key default uuid_generate_v4(),
  store_id      uuid not null references public.stores(id) on delete cascade,
  category_id   uuid references public.categories(id),
  title         text not null,
  description   text,
  price         numeric(12,2) not null check (price >= 0),
  compare_price numeric(12,2),
  sku           text,
  stock_qty     integer not null default 0,
  status        text not null default 'draft'
                check (status in ('draft','active','out_of_stock','archived')),
  tags          text[],
  rating_avg    numeric(3,2) default 0,
  rating_count  integer default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index on public.products
  using gin(to_tsvector('english', title || ' ' || coalesce(description,'')));
create index on public.products(store_id);
create index on public.products(category_id);
create index on public.products(status);

-- ─────────────────────────────────────────────
-- PRODUCT IMAGES
-- ─────────────────────────────────────────────
create table public.product_images (
  id           uuid primary key default uuid_generate_v4(),
  product_id   uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  position     smallint default 0,
  is_primary   boolean default false
);

-- ─────────────────────────────────────────────
-- PRODUCT VARIANTS
-- ─────────────────────────────────────────────
create table public.product_variants (
  id          uuid primary key default uuid_generate_v4(),
  product_id  uuid not null references public.products(id) on delete cascade,
  name        text not null,
  value       text not null,
  price_delta numeric(12,2) default 0,
  stock_qty   integer not null default 0
);

-- ─────────────────────────────────────────────
-- CART ITEMS
-- ─────────────────────────────────────────────
create table public.cart_items (
  id         uuid primary key default uuid_generate_v4(),
  buyer_id   uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id),
  quantity   integer not null default 1 check (quantity > 0),
  added_at   timestamptz default now(),
  unique (buyer_id, product_id, variant_id)
);

-- ─────────────────────────────────────────────
-- ORDERS
-- ─────────────────────────────────────────────
create table public.orders (
  id               uuid primary key default uuid_generate_v4(),
  buyer_id         uuid not null references public.profiles(id),
  status           text not null default 'pending'
                   check (status in ('pending','confirmed','shipped','delivered','cancelled')),
  total_amount     numeric(12,2) not null,
  shipping_name    text not null,
  shipping_address jsonb not null,
  notes            text,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create index on public.orders(buyer_id);
create index on public.orders(status);

-- ─────────────────────────────────────────────
-- ORDER ITEMS
-- ─────────────────────────────────────────────
create table public.order_items (
  id          uuid primary key default uuid_generate_v4(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  product_id  uuid not null references public.products(id),
  store_id    uuid not null references public.stores(id),
  variant_id  uuid references public.product_variants(id),
  quantity    integer not null,
  unit_price  numeric(12,2) not null,
  item_status text not null default 'pending'
              check (item_status in ('pending','confirmed','shipped','delivered','cancelled'))
);

-- ─────────────────────────────────────────────
-- REVIEWS
-- ─────────────────────────────────────────────
create table public.reviews (
  id         uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  buyer_id   uuid not null references public.profiles(id),
  rating     smallint not null check (rating between 1 and 5),
  body       text,
  created_at timestamptz default now(),
  unique (product_id, buyer_id)
);

-- ─────────────────────────────────────────────
-- AUDIT LOGS
-- ─────────────────────────────────────────────
create table public.audit_logs (
  id          uuid primary key default uuid_generate_v4(),
  actor_id    uuid references public.profiles(id),
  action      text not null,
  target_type text,
  target_id   uuid,
  payload     jsonb,
  created_at  timestamptz default now()
);
```

### 3.3 Auto-Trigger Functions

```sql
-- ─────────────────────────────────────────────
-- Auto-create profile on auth.users insert
-- ─────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    new.raw_user_meta_data->>'display_name',
    coalesce(new.raw_user_meta_data->>'role', 'buyer')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────
-- Update product rating_avg when a review is inserted/updated
-- ─────────────────────────────────────────────
create or replace function public.refresh_product_rating()
returns trigger language plpgsql as $$
begin
  update public.products
  set
    rating_avg   = (select avg(rating) from public.reviews where product_id = new.product_id),
    rating_count = (select count(*)    from public.reviews where product_id = new.product_id)
  where id = new.product_id;
  return new;
end;
$$;

create trigger after_review_change
  after insert or update on public.reviews
  for each row execute procedure public.refresh_product_rating();

-- ─────────────────────────────────────────────
-- Decrement stock on order_item creation
-- ─────────────────────────────────────────────
create or replace function public.decrement_stock()
returns trigger language plpgsql as $$
begin
  update public.products
  set stock_qty = stock_qty - new.quantity
  where id = new.product_id and stock_qty >= new.quantity;

  if not found then
    raise exception 'Insufficient stock for product %', new.product_id;
  end if;
  return new;
end;
$$;

create trigger after_order_item_insert
  after insert on public.order_items
  for each row execute procedure public.decrement_stock();
```

---

## 4. Row-Level Security (RLS) Policies

> **Security Principle:** Every table has RLS enabled. The default is DENY ALL. Explicit policies grant the minimum required access per role. The Supabase anon key is safe to expose in the frontend because RLS enforces data boundaries.

### 4.1 profiles

```sql
alter table public.profiles enable row level security;

-- Anyone can read public profile info
create policy "Profiles are publicly readable"
  on public.profiles for select using (true);

-- Users can only update their own profile
create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id);
```

### 4.2 products

```sql
alter table public.products enable row level security;

-- Public can read active products
create policy "Active products are public"
  on public.products for select
  using (status = 'active');

-- Sellers can read all their own products (incl. drafts)
create policy "Sellers read own products"
  on public.products for select
  using (store_id in (select id from stores where owner_id = auth.uid()));

-- Sellers can insert/update/delete their own products
create policy "Sellers manage own products"
  on public.products for all
  using (store_id in (select id from stores where owner_id = auth.uid()));

-- Admins have full access
create policy "Admins full access products"
  on public.products for all
  using ((select role from profiles where id = auth.uid()) = 'admin');
```

### 4.3 orders & order_items

```sql
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Buyers see their own orders
create policy "Buyers see own orders"
  on public.orders for select
  using (buyer_id = auth.uid());

-- Buyers create orders
create policy "Buyers create orders"
  on public.orders for insert
  with check (buyer_id = auth.uid());

-- Sellers see order_items for their store
create policy "Sellers see own order items"
  on public.order_items for select
  using (store_id in (select id from stores where owner_id = auth.uid()));

-- Sellers update item_status for their items
create policy "Sellers update own order items"
  on public.order_items for update
  using (store_id in (select id from stores where owner_id = auth.uid()));
```

### 4.4 cart_items

```sql
alter table public.cart_items enable row level security;

create policy "Buyers manage own cart"
  on public.cart_items for all
  using (buyer_id = auth.uid())
  with check (buyer_id = auth.uid());
```

---

## 5. Supabase Storage

### 5.1 Bucket Configuration

| Bucket | Access | Description + Path Convention |
|--------|--------|-------------------------------|
| `product-images` | Public | Product photos uploaded by sellers. Path: `{store_id}/{product_id}/{filename}` |
| `store-assets` | Public | Store logos and banners. Path: `{store_id}/logo` \| `{store_id}/banner` |
| `avatars` | Public | User profile avatars. Path: `{user_id}/{filename}` |
| `private-docs` | Private | Reserved for future invoices or private documents |

### 5.2 Storage RLS Policies

```sql
-- product-images: sellers can upload to their own store's folder
create policy "Sellers upload product images"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] in (
      select id::text from stores where owner_id = auth.uid()
    )
  );

-- avatars: users can upload their own avatar
create policy "Users upload own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Public read on product-images, store-assets, avatars
create policy "Public read on public buckets"
  on storage.objects for select
  using (bucket_id in ('product-images', 'store-assets', 'avatars'));
```

### 5.3 Image CDN Transform URLs

Supabase Storage serves images via a CDN with on-the-fly transforms. Use these patterns to optimise image delivery:

```ts
// src/lib/storage.ts
export function productImageUrl(path: string, width = 800, quality = 80) {
  return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/render/image/public/product-images/${path}?width=${width}&quality=${quality}&format=webp`
}

// Usage in ProductCard
// <img src={productImageUrl(image.storage_path, 400, 75)} loading="lazy" />
```

---

## 6. Supabase Realtime

Supabase Realtime uses Postgres Change Data Capture (CDC) to stream table mutations to subscribed clients via Phoenix Channels (WebSocket). The marketplace uses two primary channel types.

### 6.1 Realtime Channels

| Channel Name | DB Event | Subscriber | Purpose |
|-------------|---------|-----------|---------|
| `order:{orderId}` | `orders UPDATE` | Buyer | Live order status timeline on `/orders/:id` page |
| `seller-orders:{storeId}` | `order_items INSERT` | Seller | New order badge + audio notification in seller dashboard |
| `admin-activity` | `profiles INSERT`, `products INSERT` | Admin | Live feed of new users and new listings in admin panel |

### 6.2 Realtime Setup — Seller Order Alerts

```ts
// src/hooks/useSellerOrderAlerts.ts
export function useSellerOrderAlerts(storeId: string) {
  const [newOrders, setNewOrders] = useState<OrderItem[]>([])

  useEffect(() => {
    if (!storeId) return
    const channel = supabase
      .channel(`seller-orders:${storeId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'order_items',
        filter: `store_id=eq.${storeId}`,
      }, (payload) => {
        setNewOrders(prev => [payload.new as OrderItem, ...prev])
        // Trigger browser notification if permission granted
        new Notification('New order received!')
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [storeId])

  return { newOrders, clearAlerts: () => setNewOrders([]) }
}
```

### 6.3 Realtime Best Practices

- Always unsubscribe in the `useEffect` cleanup to prevent memory leaks and duplicate channels
- Use filter parameters (`store_id=eq.X`) to scope subscriptions — never subscribe to a full table
- On Supabase free tier: max 200 concurrent realtime connections; upgrade to Pro before launch
- Implement exponential backoff for channel reconnections using the status callback
- Use `.subscribe((status) => ...)` to monitor connection health and show UI indicators

---

## 7. Authentication Flow

### 7.1 Sign-Up Flow

| Step | Actor | System | Action |
|------|-------|--------|--------|
| 1 | User fills sign-up form | Browser | Selects role (buyer/seller) + email + password |
| 2 | `supabase.auth.signUp()` | Supabase Auth | Creates `auth.users` record; sends verification email |
| 3 | Trigger fires | Postgres | `handle_new_user()` inserts row into `public.profiles` with chosen role |
| 4 | Email verified | Supabase Auth | User clicks email link; session created; JWT issued |
| 5 | Redirect to onboarding | React Router | Seller → Store setup; Buyer → Homepage |

### 7.2 Session Management

- Sessions are persisted in `localStorage` (Supabase default) — survives page refresh
- JWT is automatically refreshed before expiry via Supabase auto-refresh
- `AuthProvider` subscribes to `supabase.auth.onAuthStateChange` for reactive session updates; components read it via `useAuthContext()`
- Role is read from `profiles.role` — not the JWT — to ensure up-to-date access control

### 7.3 Role-Based Access Control

`AuthContext` owns the session and profile; `AuthGuard` consumes it to gate routes.

```ts
// src/contexts/AuthContext.tsx (abridged)
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        if (session) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          setProfile(data)
        } else {
          setProfile(null)
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  // …exposed through AuthContext.Provider as
  // { user, session, profile, role, isAuthenticated, isLoading, signIn, signUp, signOut, updateProfile }
}
```

---

## 8. Environment Configuration & Deployment

### 8.1 Environment Variables

```bash
# .env.local — never commit to git
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: custom SMTP for auth emails
# Configured in Supabase dashboard > Auth > SMTP
```

### 8.2 Supabase Project Setup Checklist

- [ ] Create new Supabase project at supabase.com/dashboard
- [ ] Run schema SQL (Section 3.2) in the SQL editor
- [ ] Run trigger functions (Section 3.3)
- [ ] Enable RLS and apply all policies (Section 4)
- [ ] Create storage buckets: `product-images`, `store-assets`, `avatars` (Section 5.1)
- [ ] Apply storage policies (Section 5.2)
- [ ] Enable Realtime for tables: `orders`, `order_items`, `profiles`, `products`
- [ ] Configure Auth: enable email confirmations, set site URL to production domain
- [ ] Generate TypeScript types:
  ```bash
  npx supabase gen types typescript --project-id your-ref > src/types/database.types.ts
  ```

### 8.3 Frontend Deployment (Vercel)

```json
// vercel.json
{
  "buildCommand": "vite build",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "env": {
    "VITE_SUPABASE_URL": "@supabase_url",
    "VITE_SUPABASE_ANON_KEY": "@supabase_anon_key"
  }
}
```

### 8.4 Supabase CLI Workflow

```bash
# Install CLI
npm install -g supabase

# Link to project
supabase login
supabase link --project-ref your-project-ref

# Pull remote schema to local
supabase db pull

# Generate TypeScript types
supabase gen types typescript --linked > src/types/database.types.ts

# Push local migrations to remote
supabase db push
```

---

## 9. Performance Strategy

### 9.1 Frontend

- Route-based code splitting with `React.lazy()` + `Suspense` — each route is a separate chunk
- Product images: lazy loading (`loading="lazy"`), WebP format via Supabase CDN transforms
- Debounce search input (300ms) before firing Supabase queries to reduce DB load
- Paginate product listings: 20 items per page using Supabase `.range(from, to)`
- Memo heavy components (`ProductGrid`, `OrderTable`) with `React.memo`

### 9.2 Database

- GIN full-text search index on `products.title + description` for fast `ilike` queries
- Composite indexes on `(store_id, status)` for seller product queries
- Composite indexes on `(buyer_id)` for order history queries
- Use Supabase's built-in PgBouncer connection pooling in production mode
- Avoid N+1: use Supabase nested select syntax to join related tables in a single query

### 9.3 Caching

- Supabase CDN caches Storage objects globally — no additional CDN config needed for images
- For category tree (rarely changes): cache in React Context, refresh on app load
- Add `Cache-Control` headers on Supabase Edge Functions if used for computed data

---

## 10. Security Checklist

| Check | Action | Priority |
|-------|--------|---------|
| RLS on all tables | Enable RLS and add explicit policies before any production traffic | Critical |
| Anon key exposure | `VITE_SUPABASE_ANON_KEY` is safe to expose — it is limited by RLS | Safe by design |
| Service role key | **NEVER** expose service role key in frontend code — server only | Critical |
| Input validation | Validate all form inputs client-side (React Hook Form) + DB constraints | High |
| Image type check | Validate MIME type before upload; Supabase Storage checks extension | High |
| File size limit | Enforce 5 MB max in upload hook before sending to Supabase | High |
| CORS | Supabase auto-configures CORS for the site URL set in dashboard | Auto |
| SQL injection | PostgREST uses parameterised queries — SQL injection not possible via SDK | Auto |
| XSS | React escapes JSX by default; avoid `dangerouslySetInnerHTML` | Developer |
| Auth email link expiry | Set short expiry (1 hour) for magic links in Supabase Auth settings | High |
| RLS audit | Run automated RLS test suite before each production deploy | High |

---

## 11. Key Dependencies Reference

| Package | Purpose | Install |
|---------|---------|---------|
| `@supabase/supabase-js` | Supabase client SDK — DB, Auth, Storage, Realtime | `npm install @supabase/supabase-js` |
| `react-router` | v7 — file-based + code-split routing | Included in package.json |
| `@radix-ui/react-*` | Accessible UI primitives (dialogs, dropdowns, etc.) | Included in package.json |
| `@mui/material` | MUI components for seller/admin dashboards | Included in package.json |
| `recharts` | Revenue and analytics charts in dashboards | Included in package.json |
| `react-hook-form` | Form validation (checkout, product form, auth) | Included in package.json |
| `motion` | Micro-animations for cart, toasts, page transitions | Included in package.json |
| `sonner` | Toast notifications for order confirmations, alerts | Included in package.json |
| `react-dnd` | Drag-and-drop product image reordering | Included in package.json |
| `lucide-react` | Icon set throughout the UI | Included in package.json |
| `date-fns` | Order date formatting and relative time | Included in package.json |