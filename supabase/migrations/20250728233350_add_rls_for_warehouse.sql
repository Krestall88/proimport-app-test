-- Enable RLS for customer_orders and customer_order_items if not enabled
ALTER TABLE public.customer_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_order_items ENABLE ROW LEVEL SECURITY;

-- Drop existing select policies to avoid conflicts
DROP POLICY IF EXISTS "Allow read access to all users" ON public.customer_orders;
DROP POLICY IF EXISTS "Allow read access to all users" ON public.customer_order_items;

-- Create SELECT policy on customer_orders for all authenticated users
CREATE POLICY "Allow read access to all users"
ON public.customer_orders
FOR SELECT
TO authenticated
USING (true);

-- Create SELECT policy on customer_order_items for all authenticated users
CREATE POLICY "Allow read access to all users"
ON public.customer_order_items
FOR SELECT
TO authenticated
USING (true);

-- Create UPDATE policy on customer_orders for warehouse staff
CREATE POLICY "Allow warehouse staff to update order status"
ON public.customer_orders
FOR UPDATE
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('warehouse_worker', 'warehouse_manager'))
WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('warehouse_worker', 'warehouse_manager'));

-- Grant usage on schema and necessary privileges to authenticated role
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, UPDATE ON TABLE public.customer_orders TO authenticated;
GRANT SELECT ON TABLE public.customer_order_items TO authenticated;
