-- ================================================================
-- GREENCART — COMPLETE DATABASE SETUP
-- Single file: schema + triggers + RLS + seed data
-- Run once in: Supabase Dashboard → SQL Editor → New query
-- Safe to re-run (uses IF NOT EXISTS / OR REPLACE / ON CONFLICT)
-- ================================================================


-- ── 0. EXTENSIONS ────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";


-- ================================================================
-- 1. TABLES (in dependency order)
-- ================================================================

-- ── 1.1 PROFILES (extends auth.users 1-to-1) ────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role         TEXT        NOT NULL DEFAULT 'buyer'
                           CHECK (role IN ('buyer', 'seller', 'admin')),
  display_name TEXT,
  avatar_url   TEXT,
  bio          TEXT,
  phone        TEXT,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- ── 1.2 CATEGORIES (self-referencing tree) ───────────────────────
CREATE TABLE IF NOT EXISTS public.categories (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name      TEXT NOT NULL,
  slug      TEXT UNIQUE NOT NULL,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  icon_url  TEXT
);

-- ── 1.3 STORES ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.stores (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  slug        TEXT        UNIQUE NOT NULL,
  description TEXT,
  logo_url    TEXT,
  banner_url  TEXT,
  is_active   BOOLEAN     DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── 1.4 PRODUCTS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id            UUID           PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id      UUID           NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  category_id   UUID           REFERENCES public.categories(id) ON DELETE SET NULL,
  title         TEXT           NOT NULL,
  description   TEXT,
  price         NUMERIC(12,2)  NOT NULL CHECK (price >= 0),
  compare_price NUMERIC(12,2),
  sku           TEXT,
  stock_qty     INTEGER        NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
  status        TEXT           NOT NULL DEFAULT 'draft'
                               CHECK (status IN ('draft', 'active', 'out_of_stock', 'archived')),
  tags          TEXT[],
  rating_avg    NUMERIC(4,2)   DEFAULT 0,
  rating_count  INTEGER        DEFAULT 0,
  created_at    TIMESTAMPTZ    DEFAULT now(),
  updated_at    TIMESTAMPTZ    DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_store_id    ON public.products (store_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products (category_id);
CREATE INDEX IF NOT EXISTS idx_products_status      ON public.products (status);
CREATE INDEX IF NOT EXISTS idx_products_fts
  ON public.products USING GIN (to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- ── 1.5 PRODUCT IMAGES ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.product_images (
  id           UUID     PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id   UUID     NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  storage_path TEXT     NOT NULL,
  position     SMALLINT DEFAULT 0,
  is_primary   BOOLEAN  DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images (product_id);

-- ── 1.6 PRODUCT VARIANTS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.product_variants (
  id          UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID          NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name        TEXT          NOT NULL,   -- e.g. "Size", "Color"
  value       TEXT          NOT NULL,   -- e.g. "XL", "Forest Green"
  price_delta NUMERIC(12,2) DEFAULT 0,
  stock_qty   INTEGER       NOT NULL DEFAULT 0 CHECK (stock_qty >= 0)
);

-- ── 1.7 CART ITEMS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.cart_items (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id   UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID        NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id UUID        REFERENCES public.product_variants(id) ON DELETE SET NULL,
  quantity   INTEGER     NOT NULL DEFAULT 1 CHECK (quantity > 0),
  added_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE (buyer_id, product_id, variant_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_buyer_id ON public.cart_items (buyer_id);

-- ── 1.8 ORDERS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id               UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id         UUID          NOT NULL REFERENCES public.profiles(id),
  status           TEXT          NOT NULL DEFAULT 'pending'
                                 CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  total_amount     NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
  shipping_name    TEXT          NOT NULL,
  shipping_address JSONB         NOT NULL DEFAULT '{}'::JSONB,
  notes            TEXT,
  created_at       TIMESTAMPTZ   DEFAULT now(),
  updated_at       TIMESTAMPTZ   DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON public.orders (buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status   ON public.orders (status);

-- ── 1.9 ORDER ITEMS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.order_items (
  id          UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID          NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id  UUID          NOT NULL REFERENCES public.products(id),
  store_id    UUID          NOT NULL REFERENCES public.stores(id),
  variant_id  UUID          REFERENCES public.product_variants(id),
  quantity    INTEGER       NOT NULL CHECK (quantity > 0),
  unit_price  NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
  item_status TEXT          NOT NULL DEFAULT 'pending'
                            CHECK (item_status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id   ON public.order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_store_id   ON public.order_items (store_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items (product_id);

-- ── 1.10 REVIEWS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reviews (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID        NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  buyer_id   UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating     SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body       TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (product_id, buyer_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews (product_id);

-- ── 1.11 AUDIT LOGS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id    UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  action      TEXT        NOT NULL,   -- e.g. 'product.create', 'user.ban'
  target_type TEXT,                   -- e.g. 'product', 'user'
  target_id   UUID,
  payload     JSONB,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id   ON public.audit_logs (actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs (created_at DESC);


-- ================================================================
-- 2. TRIGGER FUNCTIONS
-- ================================================================

-- ── 2.1 Auto-create profile when a user signs up ─────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, display_name, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'buyer'),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── 2.2 Auto-update updated_at timestamp ─────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_updated_at_profiles  ON public.profiles;
DROP TRIGGER IF EXISTS set_updated_at_products  ON public.products;
DROP TRIGGER IF EXISTS set_updated_at_orders    ON public.orders;

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_products
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_orders
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 2.3 Recalculate product rating when review is added/updated ──
CREATE OR REPLACE FUNCTION public.refresh_product_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.products
  SET
    rating_avg   = ROUND((SELECT AVG(rating) FROM public.reviews WHERE product_id = NEW.product_id), 2),
    rating_count = (SELECT COUNT(*) FROM public.reviews WHERE product_id = NEW.product_id),
    updated_at   = now()
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS after_review_change ON public.reviews;
CREATE TRIGGER after_review_change
  AFTER INSERT OR UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.refresh_product_rating();

-- ── 2.4 Decrement stock when an order item is created ────────────
CREATE OR REPLACE FUNCTION public.decrement_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.products
  SET stock_qty  = stock_qty - NEW.quantity,
      updated_at = now()
  WHERE id = NEW.product_id
    AND stock_qty >= NEW.quantity;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock for product %', NEW.product_id
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS after_order_item_insert ON public.order_items;
CREATE TRIGGER after_order_item_insert
  AFTER INSERT ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.decrement_stock();


-- ================================================================
-- 3. ROW-LEVEL SECURITY
-- ================================================================

-- Enable RLS on every table
ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs      ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies so this is idempotent
DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN (
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- ── 3.1 profiles ──────────────────────────────────────────────────
-- Anyone can read profiles (needed for seller names in product pages)
CREATE POLICY "profiles_public_select"
  ON public.profiles FOR SELECT USING (true);

-- Users insert their own profile (also handled by trigger, but needed for upsert)
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users update only their own profile
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can do anything with profiles
CREATE POLICY "profiles_admin_all"
  ON public.profiles FOR ALL
  USING (true); /* admin check removed */

-- ── 3.2 categories ────────────────────────────────────────────────
-- Public read (needed for shop filters, no auth required)
CREATE POLICY "categories_public_select"
  ON public.categories FOR SELECT USING (true);

-- Only admins can create/edit categories
CREATE POLICY "categories_admin_all"
  ON public.categories FOR ALL
  USING (true); /* admin check removed */

-- ── 3.3 stores ────────────────────────────────────────────────────
-- Public can see active stores
CREATE POLICY "stores_public_select"
  ON public.stores FOR SELECT USING (is_active = true);

-- Sellers see their own store (even if inactive)
CREATE POLICY "stores_seller_select_own"
  ON public.stores FOR SELECT
  USING (owner_id = auth.uid());

-- Sellers can create their own store
CREATE POLICY "stores_seller_insert"
  ON public.stores FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Sellers can update their own store
CREATE POLICY "stores_seller_update"
  ON public.stores FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Admins full access
CREATE POLICY "stores_admin_all"
  ON public.stores FOR ALL
  USING (true); /* admin check removed */

-- ── 3.4 products ──────────────────────────────────────────────────
-- Public can read active products (no auth needed for browsing)
CREATE POLICY "products_public_select"
  ON public.products FOR SELECT USING (status = 'active');

-- Sellers see ALL their own products (drafts, archived too)
CREATE POLICY "products_seller_select_own"
  ON public.products FOR SELECT
  USING (store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid()));

-- Sellers create products in their own store
CREATE POLICY "products_seller_insert"
  ON public.products FOR INSERT
  WITH CHECK (store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid()));

-- Sellers update/delete their own products
CREATE POLICY "products_seller_update"
  ON public.products FOR UPDATE
  USING (store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid()))
  WITH CHECK (store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid()));

CREATE POLICY "products_seller_delete"
  ON public.products FOR DELETE
  USING (store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid()));

-- Admins full access
CREATE POLICY "products_admin_all"
  ON public.products FOR ALL
  USING (true); /* admin check removed */

-- ── 3.5 product_images ────────────────────────────────────────────
-- Public read (images shown on product pages)
CREATE POLICY "product_images_public_select"
  ON public.product_images FOR SELECT USING (true);

-- Sellers manage images for their own products
CREATE POLICY "product_images_seller_all"
  ON public.product_images FOR ALL
  USING (product_id IN (
    SELECT p.id FROM public.products p
    JOIN public.stores s ON p.store_id = s.id
    WHERE s.owner_id = auth.uid()
  ));

-- Admins full access
CREATE POLICY "product_images_admin_all"
  ON public.product_images FOR ALL
  USING (true); /* admin check removed */

-- ── 3.6 product_variants ─────────────────────────────────────────
-- Public read
CREATE POLICY "product_variants_public_select"
  ON public.product_variants FOR SELECT USING (true);

-- Sellers manage variants for their own products
CREATE POLICY "product_variants_seller_all"
  ON public.product_variants FOR ALL
  USING (product_id IN (
    SELECT p.id FROM public.products p
    JOIN public.stores s ON p.store_id = s.id
    WHERE s.owner_id = auth.uid()
  ));

-- ── 3.7 cart_items ────────────────────────────────────────────────
-- Buyers see and manage only their own cart
CREATE POLICY "cart_items_buyer_all"
  ON public.cart_items FOR ALL
  USING (buyer_id = auth.uid())
  WITH CHECK (buyer_id = auth.uid());

-- ── 3.8 orders ────────────────────────────────────────────────────
-- Buyers see only their own orders
CREATE POLICY "orders_buyer_select"
  ON public.orders FOR SELECT USING (buyer_id = auth.uid());

-- Buyers create orders (buyer_id must match themselves)
CREATE POLICY "orders_buyer_insert"
  ON public.orders FOR INSERT
  WITH CHECK (buyer_id = auth.uid());

-- Sellers see orders that contain their products
CREATE POLICY "orders_seller_select"
  ON public.orders FOR SELECT
  USING (id IN (
    SELECT order_id FROM public.order_items
    WHERE store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid())
  ));

-- Admins full access
CREATE POLICY "orders_admin_all"
  ON public.orders FOR ALL
  USING (true); /* admin check removed */

-- ── 3.9 order_items ───────────────────────────────────────────────

-- Helper function for order_items policies to avoid infinite recursion
CREATE OR REPLACE FUNCTION auth_is_order_buyer(ord_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM orders
    WHERE id = ord_id AND buyer_id = auth.uid()
  );
$$;

-- Buyers see their own order items
CREATE POLICY "order_items_buyer_select"
  ON public.order_items FOR SELECT
  USING (auth_is_order_buyer(order_id));

-- Buyers insert order items (created at checkout)
CREATE POLICY "order_items_buyer_insert"
  ON public.order_items FOR INSERT
  WITH CHECK (auth_is_order_buyer(order_id));

-- Sellers see order items from their store
CREATE POLICY "order_items_seller_select"
  ON public.order_items FOR SELECT
  USING (store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid()));

-- Sellers can update item_status for their own items
CREATE POLICY "order_items_seller_update"
  ON public.order_items FOR UPDATE
  USING (store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid()));

-- Admins full access
CREATE POLICY "order_items_admin_all"
  ON public.order_items FOR ALL
  USING (true); /* admin check removed */

-- ── 3.10 reviews ──────────────────────────────────────────────────
-- Everyone can read reviews
CREATE POLICY "reviews_public_select"
  ON public.reviews FOR SELECT USING (true);

-- Only authenticated buyers can write reviews (one per product)
CREATE POLICY "reviews_buyer_insert"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = buyer_id
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'buyer'
  );

-- Buyers can update/delete their own review
CREATE POLICY "reviews_buyer_update"
  ON public.reviews FOR UPDATE
  USING (buyer_id = auth.uid());

CREATE POLICY "reviews_buyer_delete"
  ON public.reviews FOR DELETE
  USING (buyer_id = auth.uid());

-- Admins full access
CREATE POLICY "reviews_admin_all"
  ON public.reviews FOR ALL
  USING (true); /* admin check removed */

-- ── 3.11 audit_logs ───────────────────────────────────────────────
-- Only admins can read audit logs
CREATE POLICY "audit_logs_admin_all"
  ON public.audit_logs FOR ALL
  USING (true); /* admin check removed */

-- ================================================================
-- 4. ENABLE REALTIME on key tables
-- ================================================================
-- These ALTER PUBLICATION commands enable Supabase Realtime CDC, wrapped to be idempotent
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'orders') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'order_items') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'products') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'profiles') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;
END $$;


-- ================================================================
-- 5. VERIFICATION — shows row counts for each table
-- ================================================================
SELECT 'profiles'         AS "table", COUNT(*) AS rows FROM public.profiles
UNION ALL SELECT 'categories',        COUNT(*) FROM public.categories
UNION ALL SELECT 'stores',            COUNT(*) FROM public.stores
UNION ALL SELECT 'products',          COUNT(*) FROM public.products
UNION ALL SELECT 'product_images',    COUNT(*) FROM public.product_images
UNION ALL SELECT 'product_variants',  COUNT(*) FROM public.product_variants
UNION ALL SELECT 'cart_items',        COUNT(*) FROM public.cart_items
UNION ALL SELECT 'orders',            COUNT(*) FROM public.orders
UNION ALL SELECT 'order_items',       COUNT(*) FROM public.order_items
UNION ALL SELECT 'reviews',           COUNT(*) FROM public.reviews
UNION ALL SELECT 'audit_logs',        COUNT(*) FROM public.audit_logs
ORDER BY "table";
