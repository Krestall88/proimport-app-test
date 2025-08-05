-- Исправление RLS-политик для warehouse ролей
-- Это даст доступ к заказам клиентов для кладовщика

-- Убедимся, что RLS включен для обеих таблиц
ALTER TABLE customer_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_order_items ENABLE ROW LEVEL SECURITY;

-- Создаем или обновляем политики для warehouse_manager
DROP POLICY IF EXISTS warehouse_manager_select_customer_orders ON customer_orders;
CREATE POLICY warehouse_manager_select_customer_orders
ON customer_orders
FOR SELECT
TO warehouse_manager
USING (true);

DROP POLICY IF EXISTS warehouse_manager_select_customer_order_items ON customer_order_items;
CREATE POLICY warehouse_manager_select_customer_order_items
ON customer_order_items
FOR SELECT
TO warehouse_manager
USING (true);

-- Создаем или обновляем политики для warehouse_worker
DROP POLICY IF EXISTS warehouse_worker_select_customer_orders ON customer_orders;
CREATE POLICY warehouse_worker_select_customer_orders
ON customer_orders
FOR SELECT
TO warehouse_worker
USING (true);

DROP POLICY IF EXISTS warehouse_worker_select_customer_order_items ON customer_order_items;
CREATE POLICY warehouse_worker_select_customer_order_items
ON customer_order_items
FOR SELECT
TO warehouse_worker
USING (true);

-- Проверим, есть ли заказы в базе данных
SELECT 
    'customer_orders' as table_name,
    COUNT(*) as total_records
FROM customer_orders
UNION ALL
SELECT 
    'customer_order_items' as table_name,
    COUNT(*) as total_records
FROM customer_order_items;
