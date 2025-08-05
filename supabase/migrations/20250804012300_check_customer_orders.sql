-- Проверка наличия заказов клиентов в базе данных
-- Это поможет определить, почему заказы не отображаются

-- Проверим все заказы
SELECT 
    id, 
    status, 
    created_at, 
    customer_id,
    COUNT(*) OVER() as total_count
FROM customer_orders 
ORDER BY created_at DESC 
LIMIT 10;

-- Проверим заказы с нужными статусами
SELECT 
    status,
    COUNT(*) as count
FROM customer_orders 
WHERE status IN ('new', 'picking', 'ready_for_shipment')
GROUP BY status;

-- Проверим связанные данные
SELECT COUNT(*) as total_orders FROM customer_orders;
SELECT COUNT(*) as orders_with_items FROM customer_orders co 
WHERE EXISTS (
    SELECT 1 FROM customer_order_items coi 
    WHERE coi.customer_order_id = co.id
);

-- Проверим customer_order_items
SELECT COUNT(*) as total_items FROM customer_order_items;
