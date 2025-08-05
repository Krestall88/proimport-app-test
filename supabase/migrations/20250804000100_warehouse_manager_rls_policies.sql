-- Migration: RLS policies for warehouse_manager role on customer_orders and customer_order_items
-- This allows warehouse managers to view customer orders and order items on warehouse pages

-- Enable RLS on customer_orders table
ALTER TABLE customer_orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for warehouse_manager on customer_orders
CREATE POLICY "warehouse_manager_can_view_customer_orders"
ON customer_orders
FOR SELECT
TO warehouse_manager
USING (true);

-- Enable RLS on customer_order_items table
ALTER TABLE customer_order_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for warehouse_manager on customer_order_items
CREATE POLICY "warehouse_manager_can_view_customer_order_items"
ON customer_order_items
FOR SELECT
TO warehouse_manager
USING (true);

-- Also add policies for owner role to maintain consistency
CREATE POLICY "owner_can_view_customer_orders"
ON customer_orders
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'owner'
  )
);

CREATE POLICY "owner_can_view_customer_order_items"
ON customer_order_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'owner'
  )
);

-- Add comments for documentation
COMMENT ON POLICY "warehouse_manager_can_view_customer_orders" ON customer_orders IS 'Allows warehouse_manager role to view all customer orders';
COMMENT ON POLICY "warehouse_manager_can_view_customer_order_items" ON customer_order_items IS 'Allows warehouse_manager role to view all customer order items';
COMMENT ON POLICY "owner_can_view_customer_orders" ON customer_orders IS 'Allows owner role to view all customer orders';
COMMENT ON POLICY "owner_can_view_customer_order_items" ON customer_order_items IS 'Allows owner role to view all customer order items';
