-- Add RLS policies for warehouse_manager role on customer_orders and customer_order_items tables
-- These policies allow warehouse managers to view customer orders and order items

-- Enable RLS on customer_orders table if not already enabled
ALTER TABLE customer_orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for warehouse_manager to SELECT from customer_orders
CREATE POLICY "warehouse_manager_select_customer_orders" ON customer_orders
    FOR SELECT
    TO warehouse_manager, owner
    USING (true);

-- Enable RLS on customer_order_items table if not already enabled
ALTER TABLE customer_order_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for warehouse_manager to SELECT from customer_order_items
CREATE POLICY "warehouse_manager_select_customer_order_items" ON customer_order_items
    FOR SELECT
    TO warehouse_manager, owner
    USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customer_orders_status ON customer_orders(status);
CREATE INDEX IF NOT EXISTS idx_customer_order_items_order_id ON customer_order_items(order_id);
