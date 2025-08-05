-- RLS Policies for warehouse_manager role on customer orders and order items
-- These policies allow warehouse managers to view customer orders and order items

-- Enable RLS on customer_orders table
ALTER TABLE customer_orders ENABLE ROW LEVEL SECURITY;

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

-- Create policies for other roles (owner, agent) if they don't exist
-- SELECT policy for owner
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

-- SELECT policy for agent on their own orders
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

-- Similar policies for customer_order_items
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
