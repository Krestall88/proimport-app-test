-- Добавление RLS-политик для warehouse_manager роли
-- на таблицы customer_orders и customer_order_items

-- Политики для таблицы customer_orders
CREATE POLICY "warehouse_manager_select_customer_orders"
ON customer_orders
FOR SELECT
TO warehouse_manager
USING (true);

-- Политики для таблицы customer_order_items
CREATE POLICY "warehouse_manager_select_customer_order_items"
ON customer_order_items
FOR SELECT
TO warehouse_manager
USING (true);

-- Аналогичные политики для warehouse_worker роли
CREATE POLICY "warehouse_worker_select_customer_orders"
ON customer_orders
FOR SELECT
TO warehouse_worker
USING (true);

CREATE POLICY "warehouse_worker_select_customer_order_items"
ON customer_order_items
FOR SELECT
TO warehouse_worker
USING (true);
