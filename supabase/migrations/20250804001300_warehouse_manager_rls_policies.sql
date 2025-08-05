-- RLS Policies for warehouse_manager role on customer_orders and customer_order_items
-- Created to fix missing data display on warehouse/customer-orders page
-- Updated to use IF NOT EXISTS to avoid conflicts

-- Enable RLS on tables if not already enabled
ALTER TABLE customer_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policy for warehouse_manager role on customer_orders table
CREATE POLICY IF NOT EXISTS "warehouse_manager_select_customer_orders"
ON customer_orders
FOR SELECT
TO warehouse_manager
USING (true);

-- RLS Policy for warehouse_manager role on customer_order_items table
CREATE POLICY IF NOT EXISTS "warehouse_manager_select_customer_order_items"
ON customer_order_items
FOR SELECT
TO warehouse_manager
USING (true);

-- RLS Policy for owner role on customer_orders table (for consistency)
CREATE POLICY IF NOT EXISTS "owner_select_customer_orders"
ON customer_orders
FOR SELECT
TO owner
USING (true);

-- RLS Policy for owner role on customer_order_items table (for consistency)
CREATE POLICY IF NOT EXISTS "owner_select_customer_order_items"
ON customer_order_items
FOR SELECT
TO owner
USING (true);

-- RLS Policy for agent role on customer_orders table (for completeness)
CREATE POLICY IF NOT EXISTS "agent_select_customer_orders"
ON customer_orders
FOR SELECT
TO agent
USING (true);

-- RLS Policy for agent role on customer_order_items table (for completeness)
CREATE POLICY IF NOT EXISTS "agent_select_customer_order_items"
ON customer_order_items
FOR SELECT
TO agent
USING (true);
