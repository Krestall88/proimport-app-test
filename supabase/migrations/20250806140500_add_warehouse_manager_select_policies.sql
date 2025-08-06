-- Добавление политик RLS SELECT для роли warehouse_manager на таблицы customer_orders и customer_order_items

-- Политика для customer_orders
CREATE POLICY "warehouse_manager_select_customer_orders" 
ON "public"."customer_orders" 
FOR SELECT 
TO warehouse_manager 
USING (true);

-- Политика для customer_order_items
CREATE POLICY "warehouse_manager_select_customer_order_items" 
ON "public"."customer_order_items" 
FOR SELECT 
TO warehouse_manager 
USING (true);

-- Включение RLS на таблицах, если ещё не включено
ALTER TABLE "public"."customer_orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."customer_order_items" ENABLE ROW LEVEL SECURITY;
