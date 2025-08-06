-- Enable RLS and allow warehouse_manager to SELECT from customer_order_items
ALTER TABLE customer_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Warehouse manager can view customer order items"
  ON customer_order_items
  FOR SELECT
  TO warehouse_manager
  USING (true);
