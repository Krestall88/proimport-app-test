-- Отладка заказов клиентов для warehouse
-- Проверим наличие заказов с нужными статусами

-- Проверим все заказы и их статусы
SELECT id, status, created_at, customer_id 
FROM customer_orders 
ORDER BY created_at DESC 
LIMIT 10;

-- Проверим заказы только с нужными статусами
SELECT id, status, created_at, customer_id 
FROM customer_orders 
WHERE status IN ('new', 'picking', 'ready_for_shipment')
ORDER BY created_at ASC;

-- Проверим связанные таблицы
SELECT COUNT(*) as total_orders FROM customer_orders;
SELECT COUNT(*) as orders_with_status FROM customer_orders WHERE status IN ('new', 'picking', 'ready_for_shipment');

-- Проверим customer_order_items
SELECT COUNT(*) as total_items FROM customer_order_items;
SELECT coi.*, p.title, p.nomenclature_code 
FROM customer_order_items coi 
JOIN products p ON coi.product_id = p.id 
LIMIT 5;
