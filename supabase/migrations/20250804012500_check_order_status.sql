-- Проверим статус заказа и детали
SELECT 
    id,
    status,
    created_at,
    customer_id,
    CASE 
        WHEN status IN ('new', 'picking', 'ready_for_shipment') THEN 'VISIBLE'
        ELSE 'HIDDEN'
    END as visibility
FROM customer_orders
ORDER BY created_at DESC;
