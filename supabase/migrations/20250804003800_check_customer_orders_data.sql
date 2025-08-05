-- Check customer orders data and statuses
-- Verify if there are orders with required statuses for warehouse display

-- Check total orders by status
SELECT 
    status,
    COUNT(*) as order_count,
    MIN(created_at) as earliest_order,
    MAX(created_at) as latest_order
FROM customer_orders
GROUP BY status
ORDER BY order_count DESC;

-- Check orders with statuses required for warehouse display
SELECT 
    id,
    status,
    created_at,
    customer_id
FROM customer_orders
WHERE status IN ('new', 'picking', 'ready_for_shipment')
ORDER BY created_at DESC
LIMIT 10;

-- Check if customer_order_items exist for these orders
SELECT 
    co.id as order_id,
    co.status,
    co.created_at,
    COUNT(coi.id) as item_count
FROM customer_orders co
LEFT JOIN customer_order_items coi ON co.id = coi.order_id
WHERE co.status IN ('new', 'picking', 'ready_for_shipment')
GROUP BY co.id, co.status, co.created_at
ORDER BY co.created_at DESC
LIMIT 10;

-- Check for any errors in data integrity
SELECT 
    'customer_orders with null customer_id' as issue_type,
    COUNT(*) as count
FROM customer_orders
WHERE customer_id IS NULL

UNION ALL

SELECT 
    'customer_order_items with null order_id' as issue_type,
    COUNT(*) as count
FROM customer_order_items
WHERE order_id IS NULL

UNION ALL

SELECT 
    'customer_orders without items' as issue_type,
    COUNT(*) as count
FROM customer_orders co
WHERE NOT EXISTS (
    SELECT 1 FROM customer_order_items coi WHERE coi.order_id = co.id
);
