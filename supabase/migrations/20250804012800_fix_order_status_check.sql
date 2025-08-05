-- Проверим статус заказа и исправим фильтрацию
-- Проверим точный статус заказа

SELECT 
    id,
    status,
    created_at,
    customer_id
FROM customer_orders
WHERE status NOT IN ('new', 'picking', 'ready_for_shipment')
ORDER BY created_at DESC;

-- Проверим все возможные статусы
SELECT DISTINCT status, COUNT(*) as count
FROM customer_orders
GROUP BY status
ORDER BY count DESC;
