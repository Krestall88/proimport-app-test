-- Corrected cleanup script for existing customers and orders
-- This script only uses tables that actually exist in the database
-- WARNING: This will permanently delete all customer data!

-- First, check what tables exist
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%customer%';

-- Delete in correct order to respect foreign key constraints

-- 1. First, delete all customer order items (these reference customer_orders)
DELETE FROM customer_order_items WHERE customer_order_id IN (
    SELECT id FROM customer_orders WHERE customer_id IN (SELECT id FROM customers)
);

-- 2. Delete all customer orders (these reference customers)
DELETE FROM customer_orders WHERE customer_id IN (SELECT id FROM customers);

-- 3. Check if customer_wishlist exists and delete if it does
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_name = 'customer_wishlist'
    ) THEN
        DELETE FROM customer_wishlist WHERE customer_id IN (SELECT id FROM customers);
    END IF;
END $$;

-- 4. Finally, delete all customers
DELETE FROM customers;

-- Verify cleanup
SELECT 'Customers remaining: ' || (SELECT COUNT(*) FROM customers) as cleanup_status;
SELECT 'Orders remaining: ' || (SELECT COUNT(*) FROM customer_orders) as orders_status;
SELECT 'Order items remaining: ' || (SELECT COUNT(*) FROM customer_order_items) as items_status;
