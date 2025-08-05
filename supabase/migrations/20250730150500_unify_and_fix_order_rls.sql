-- Unify and Fix RLS Policies for customer_orders and customer_order_items

-- 1. Enable RLS on the tables if not already enabled
ALTER TABLE public.customer_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_order_items ENABLE ROW LEVEL SECURITY;

-- 2. Drop all old policies to start fresh
DROP POLICY IF EXISTS "Allow agent to read their own orders" ON public.customer_orders;
DROP POLICY IF EXISTS "Allow agent to read their own order items" ON public.customer_order_items;
DROP POLICY IF EXISTS "Allow warehouse read access on customer_orders" ON public.customer_orders;
DROP POLICY IF EXISTS "Allow warehouse read access on customer_order_items" ON public.customer_order_items;
DROP POLICY IF EXISTS "Allow owner/manager full access" ON public.customer_orders;
DROP POLICY IF EXISTS "Allow owner/manager full access to items" ON public.customer_order_items;


-- 3. Create a new, unified SELECT policy for all roles
CREATE POLICY "Allow read access based on role" ON public.customer_orders
FOR SELECT
TO authenticated
USING (
  -- Owners and warehouse staff can see all orders
  (auth.jwt()->>'role' = 'owner') OR
  (auth.jwt()->>'role' = 'warehouse_manager') OR
  (auth.jwt()->>'role' = 'warehouse_worker') OR
  -- Agents can see only their own orders
  (auth.jwt()->>'role' = 'agent' AND agent_id = auth.uid())
);

CREATE POLICY "Allow read access to items based on role" ON public.customer_order_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM customer_orders co
    WHERE co.id = customer_order_items.customer_order_id
      AND (
        -- Owners and warehouse staff can see items in any order
        (auth.jwt()->>'role' = 'owner') OR
        (auth.jwt()->>'role' = 'warehouse_manager') OR
        (auth.jwt()->>'role' = 'warehouse_worker') OR
        -- Agents can see items only in their own orders
        (auth.jwt()->>'role' = 'agent' AND co.agent_id = auth.uid())
      )
  )
);

-- 4. Re-affirm INSERT policies
DROP POLICY IF EXISTS "Allow authenticated users to create orders" ON public.customer_orders;
CREATE POLICY "Allow authenticated users to create orders"
ON public.customer_orders
FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to create order items" ON public.customer_order_items;
CREATE POLICY "Allow authenticated users to create order items"
ON public.customer_order_items
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Исправленная функция резервирования для актуальной структуры goods_receipt_items
CREATE OR REPLACE FUNCTION public.reserve_inventory_for_order()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  rows_affected INTEGER;
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.goods_receipt_items
    SET
      reserved_quantity = COALESCE(reserved_quantity, 0) + NEW.quantity
    WHERE
      id = NEW.goods_receipt_item_id
      AND (quantity_received - COALESCE(reserved_quantity, 0)) >= NEW.quantity;

    GET DIAGNOSTICS rows_affected = ROW_COUNT;

    IF rows_affected = 0 THEN
      RAISE EXCEPTION 'Не удалось зарезервировать товар. Недостаточно остатков на складе для партии (ID: %).', NEW.goods_receipt_item_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- 5. Add SELECT policies for related tables to allow all roles to see product and batch info

-- Enable RLS on products and goods_receipt_items if not already enabled
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goods_receipt_items ENABLE ROW LEVEL SECURITY;

-- Allow any authenticated user to read product information
DROP POLICY IF EXISTS "Allow authenticated read access on products" ON public.products;
CREATE POLICY "Allow authenticated read access on products"
ON public.products
FOR SELECT
TO authenticated
USING (true);

-- Allow any authenticated user to read goods receipt information
DROP POLICY IF EXISTS "Allow authenticated read access on goods_receipt_items" ON public.goods_receipt_items;
CREATE POLICY "Allow authenticated read access on goods_receipt_items"
ON public.goods_receipt_items
FOR SELECT
TO authenticated
USING (true);
