-- 1. Enable RLS on the tables if not already enabled
ALTER TABLE public.customer_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_order_items ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies for warehouse if they exist (for idempotency)
DROP POLICY IF EXISTS "Allow warehouse read access on customer_orders" ON public.customer_orders;
DROP POLICY IF EXISTS "Allow warehouse read access on customer_order_items" ON public.customer_order_items;

-- 3. Create SELECT policy for warehouse roles on customer_orders
CREATE POLICY "Allow warehouse read access on customer_orders"
ON public.customer_orders
FOR SELECT
TO authenticated
USING (
  (get_my_claim('role'::text)) = '"owner"'::jsonb OR
  (get_my_claim('role'::text)) = '"warehouse_manager"'::jsonb OR
  (get_my_claim('role'::text)) = '"warehouse_worker"'::jsonb
);

-- 4. Create SELECT policy for warehouse roles on customer_order_items
CREATE POLICY "Allow warehouse read access on customer_order_items"
ON public.customer_order_items
FOR SELECT
TO authenticated
USING (
  (get_my_claim('role'::text)) = '"owner"'::jsonb OR
  (get_my_claim('role'::text)) = '"warehouse_manager"'::jsonb OR
  (get_my_claim('role'::text)) = '"warehouse_worker"'::jsonb
);
