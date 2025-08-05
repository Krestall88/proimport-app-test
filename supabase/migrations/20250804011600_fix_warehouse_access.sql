-- Проверка и исправление RLS-политик для warehouse ролей
-- Проверим существующие политики

-- Сначала проверим, какие политики уже существуют
SELECT schemaname, tablename, policyname, cmd, roles, using, with_check 
FROM pg_policies 
WHERE tablename IN ('customer_orders', 'customer_order_items');

-- Если политики существуют, но не работают, проверим роли
-- Проверим, что роли warehouse_manager и warehouse_worker существуют
SELECT rolname FROM pg_roles WHERE rolname IN ('warehouse_manager', 'warehouse_worker');

-- Проверим, что пользователи имеют нужные роли
SELECT usename, useconfig FROM pg_user WHERE usename LIKE '%warehouse%';
