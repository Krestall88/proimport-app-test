-- Corrected RLS Policies for warehouse_manager role on customer orders and order items
-- This script checks for existing policies and only creates new ones if they don't exist

-- Enable RLS on customer_orders table (if not already enabled)
ALTER TABLE customer_orders ENABLE ROW LEVEL SECURITY;

-- Enable RLS on customer_order_items table (if not already enabled)
ALTER TABLE customer_order_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS warehouse_manager_select_customer_orders ON customer_orders;
DROP POLICY IF EXISTS warehouse_manager_select_customer_order_items ON customer_order_items;
DROP POLICY IF EXISTS owner_select_customer_orders ON customer_orders;
DROP POLICY IF EXISTS agent_select_customer_orders ON customer_orders;
DROP POLICY IF EXISTS owner_select_customer_order_items ON customer_order_items;
DROP POLICY IF EXISTS agent_select_customer_order_items ON customer_order_items;

-- Create SELECT policy for warehouse_manager on customer_orders
CREATE POLICY "warehouse_manager_select_customer_orders"
ON customer_orders FOR SELECT
TO warehouse_manager
USING (true);

-- Create SELECT policy for warehouse_manager on customer_order_items
CREATE POLICY "warehouse_manager_select_customer_order_items"
ON customer_order_items FOR SELECT
TO warehouse_manager
USING (true);

-- Create policies for owner role
CREATE POLICY "owner_select_customer_orders"
ON customer_orders FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'owner'
  )
);

-- Create policies for agent role
CREATE POLICY "agent_select_customer_orders"
ON customer_orders FOR SELECT
TO authenticated
USING (
  agent_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'owner'
  )
);

-- Create policies for customer_order_items
CREATE POLICY "owner_select_customer_order_items"
ON customer_order_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'owner'
  )
);

CREATE POLICY "agent_select_customer_order_items"
ON customer_order_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM customer_orders 
    WHERE customer_orders.id = customer_order_items.customer_order_id
    AND (customer_orders.agent_id = auth.uid() OR
         EXISTS (
           SELECT 1 FROM profiles 
           WHERE profiles.id = auth.uid() 
           AND profiles.role = 'owner'
         ))
  )
);
