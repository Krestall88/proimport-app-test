-- Enable RLS and allow warehouse_manager to SELECT from customer_orders
ALTER TABLE customer_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Warehouse manager can view customer orders"
  ON customer_orders
  FOR SELECT
  TO warehouse_manager
  USING (true);
