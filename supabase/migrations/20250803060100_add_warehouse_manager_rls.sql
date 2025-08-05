-- Add RLS policies for warehouse_manager role on customer_orders and customer_order_items

-- Enable RLS on customer_orders if not already enabled
ALTER TABLE public.customer_orders ENABLE ROW LEVEL SECURITY;

-- Policy for warehouse_manager on customer_orders - SELECT access
DROP POLICY IF EXISTS "Allow warehouse_manager read on customer_orders" ON public.customer_orders;

CREATE POLICY "Allow warehouse_manager read on customer_orders"
ON public.customer_orders
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'warehouse_manager'
  )
);

-- Enable RLS on customer_order_items if not already enabled
ALTER TABLE public.customer_order_items ENABLE ROW LEVEL SECURITY;

-- Policy for warehouse_manager on customer_order_items - SELECT access
DROP POLICY IF EXISTS "Allow warehouse_manager read on customer_order_items" ON public.customer_order_items;

CREATE POLICY "Allow warehouse_manager read on customer_order_items"
ON public.customer_order_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'warehouse_manager'
  )
);
