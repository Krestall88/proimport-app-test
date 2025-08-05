-- SQL-скрипт для проверки всех связей клиента
-- Используйте этот скрипт для ручной проверки перед удалением клиента

-- Замените YOUR_CLIENT_ID на ID клиента, которого хотите проверить
-- Пример: SELECT * FROM check_client_orders('123e4567-e89b-12d3-a456-426614174000');

-- Создаем функцию для проверки всех связей клиента
CREATE OR REPLACE FUNCTION check_client_relations(client_id UUID)
RETURNS TABLE (
    relation_type TEXT,
    table_name TEXT,
    count_records BIGINT,
    details JSONB
) AS $$
BEGIN
    -- Проверяем customer_orders
    RETURN QUERY
    SELECT 'orders'::TEXT, 'customer_orders'::TEXT, COUNT(*), jsonb_build_object('ids', jsonb_agg(id))
    FROM customer_orders 
    WHERE customer_id = client_id;

    -- Проверяем customer_wishlist
    RETURN QUERY
    SELECT 'wishlist'::TEXT, 'customer_wishlist'::TEXT, COUNT(*), jsonb_build_object('ids', jsonb_agg(id))
    FROM customer_wishlist 
    WHERE customer_id = client_id;

    -- Проверяем invoices (если таблица существует)
    RETURN QUERY
    SELECT 'invoices'::TEXT, 'invoices'::TEXT, COUNT(*), jsonb_build_object('ids', jsonb_agg(id))
    FROM invoices 
    WHERE customer_id = client_id;

    -- Проверяем delivery_notes (если таблица существует)
    RETURN QUERY
    SELECT 'delivery_notes'::TEXT, 'delivery_notes'::TEXT, COUNT(*), jsonb_build_object('ids', jsonb_agg(id))
    FROM delivery_notes 
    WHERE customer_id = client_id;

    -- Проверяем связанные customer_order_items через customer_orders
    RETURN QUERY
    SELECT 'order_items'::TEXT, 'customer_order_items'::TEXT, COUNT(*), jsonb_build_object('order_ids', jsonb_agg(DISTINCT co.id))
    FROM customer_order_items coi
    JOIN customer_orders co ON coi.customer_order_id = co.id
    WHERE co.customer_id = client_id;
END;
$$ LANGUAGE plpgsql;

-- Использование функции:
-- SELECT * FROM check_client_relations('YOUR_CLIENT_ID');

-- Альтернативный простой запрос для ручной проверки:
SELECT 
    'customer_orders' as table_name,
    COUNT(*) as record_count
FROM customer_orders 
WHERE customer_id = 'YOUR_CLIENT_ID'

UNION ALL

SELECT 
    'customer_wishlist' as table_name,
    COUNT(*) as record_count
FROM customer_wishlist 
WHERE customer_id = 'YOUR_CLIENT_ID'

UNION ALL

SELECT 
    'customer_order_items_via_orders' as table_name,
    COUNT(*) as record_count
FROM customer_order_items coi
JOIN customer_orders co ON coi.customer_order_id = co.id
WHERE co.customer_id = 'YOUR_CLIENT_ID';

-- Проверка конкретного клиента:
-- SELECT * FROM check_client_relations('ваш_клиент_id');
