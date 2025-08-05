-- Add cascade deletion for customer orders and order items
-- This ensures that when a customer is deleted, all their orders and order items are automatically deleted

-- First, drop existing foreign key constraints that might prevent cascade deletion
ALTER TABLE customer_order_items 
DROP CONSTRAINT IF EXISTS customer_order_items_customer_order_id_fkey;

ALTER TABLE customer_orders 
DROP CONSTRAINT IF EXISTS customer_orders_customer_id_fkey;

-- Add cascade deletion for customer_orders -> customers relationship
ALTER TABLE customer_orders 
ADD CONSTRAINT customer_orders_customer_id_fkey 
FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;

-- Add cascade deletion for customer_order_items -> customer_orders relationship
ALTER TABLE customer_order_items 
ADD CONSTRAINT customer_order_items_customer_order_id_fkey 
FOREIGN KEY (customer_order_id) REFERENCES customer_orders(id) ON DELETE CASCADE;

-- Ensure agent_id references profiles with cascade
ALTER TABLE customer_orders 
DROP CONSTRAINT IF EXISTS customer_orders_agent_id_fkey;

ALTER TABLE customer_orders 
ADD CONSTRAINT customer_orders_agent_id_fkey 
FOREIGN KEY (agent_id) REFERENCES profiles(id) ON DELETE SET NULL;
