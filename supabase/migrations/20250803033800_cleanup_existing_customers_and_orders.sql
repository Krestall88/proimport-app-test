-- Cleanup script for existing customers and their orders
-- This script will delete all existing customers and their related data
-- WARNING: This will permanently delete all customer data!

-- Delete in correct order to respect foreign key constraints

-- 1. First, delete all customer order items
DELETE FROM customer_order_items WHERE customer_order_id IN (
    SELECT id FROM customer_orders WHERE customer_id IN (SELECT id FROM customers)
);

-- 2. Delete all customer orders
DELETE FROM customer_orders WHERE customer_id IN (SELECT id FROM customers);

-- 3. Delete customer wishlist items (if exists)
DELETE FROM customer_wishlist_items WHERE customer_id IN (SELECT id FROM customers);

-- 4. Delete customer wishlist (if exists)
DELETE FROM customer_wishlist WHERE customer_id IN (SELECT id FROM customers);

-- 5. Finally, delete all customers
DELETE FROM customers;

-- Reset sequences if needed (optional)
-- SELECT setval('customers_id_seq', 1, false);
-- SELECT setval('customer_orders_id_seq', 1, false);
-- SELECT setval('customer_order_items_id_seq', 1, false);

-- Verify cleanup
SELECT 'Customers deleted: ' || (SELECT COUNT(*) FROM customers) as cleanup_status;
SELECT 'Orders deleted: ' || (SELECT COUNT(*) FROM customer_orders) as orders_status;
SELECT 'Order items deleted: ' || (SELECT COUNT(*) FROM customer_order_items) as items_status;
