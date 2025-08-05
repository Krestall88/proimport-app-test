-- Verify and fix warehouse_manager RLS access issues
-- Check if warehouse_manager has proper SELECT access

-- Check existing policies for warehouse_manager specifically
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('customer_orders', 'customer_order_items')
    AND 'warehouse_manager' = ANY(roles)
ORDER BY tablename, policyname;

-- Check if warehouse_manager role exists and has proper permissions
SELECT 
    rolname,
    rolsuper,
    rolcreaterole,
    rolcreatedb
FROM pg_roles 
WHERE rolname = 'warehouse_manager';

-- Test warehouse_manager access by checking if they can see orders
-- This simulates what warehouse_manager would see
SELECT 
    'Testing warehouse_manager access to customer_orders' as test_description,
    COUNT(*) as total_orders
FROM customer_orders
WHERE status IN ('new', 'picking', 'ready_for_shipment');

-- Test warehouse_manager access to customer_order_items
SELECT 
    'Testing warehouse_manager access to customer_order_items' as test_description,
    COUNT(*) as total_items
FROM customer_order_items coi
JOIN customer_orders co ON coi.order_id = co.id
WHERE co.status IN ('new', 'picking', 'ready_for_shipment');

-- Check if there are any orders with the required statuses
SELECT 
    status,
    COUNT(*) as count
FROM customer_orders
GROUP BY status
ORDER BY count DESC;
