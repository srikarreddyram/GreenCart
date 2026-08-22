-- Fix Infinite Recursion in Order Policies

-- 1. Create a helper function to bypass RLS for checking the buyer of an order
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

-- 2. Drop the existing order_items policies that caused the circular dependency
DROP POLICY IF EXISTS "order_items_buyer_select" ON public.order_items;
DROP POLICY IF EXISTS "order_items_buyer_insert" ON public.order_items;

-- 3. Recreate them using the secure helper function
CREATE POLICY "order_items_buyer_select"
  ON public.order_items FOR SELECT
  USING (auth_is_order_buyer(order_id));

CREATE POLICY "order_items_buyer_insert"
  ON public.order_items FOR INSERT
  WITH CHECK (auth_is_order_buyer(order_id));
