-- Добавляем RLS-политики для роли warehouse_manager на таблицы customer_orders и customer_order_items

-- Создаем роль warehouse_manager, если она не существует
DO $$
BEGIN
  CREATE ROLE warehouse_manager;
EXCEPTION WHEN DUPLICATE_OBJECT THEN
  RAISE NOTICE 'Role warehouse_manager already exists';
END
$$;

-- Включаем RLS на таблицах, если еще не включено
ALTER TABLE public.customer_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_order_items ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики, если они существуют
DROP POLICY IF EXISTS "Allow warehouse_manager to read customer_orders" ON public.customer_orders;
DROP POLICY IF EXISTS "Allow warehouse_manager to read customer_order_items" ON public.customer_order_items;

-- Создаем политику SELECT для warehouse_manager на customer_orders
CREATE POLICY "Allow warehouse_manager to read customer_orders"
ON public.customer_orders
FOR SELECT
TO authenticated
USING (
  (auth.jwt()->>'role' = 'warehouse_manager')
);

-- Создаем политику SELECT для warehouse_manager на customer_order_items
CREATE POLICY "Allow warehouse_manager to read customer_order_items"
ON public.customer_order_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM customer_orders co
    WHERE co.id = customer_order_items.customer_order_id
      AND (auth.jwt()->>'role' = 'warehouse_manager')
  )
);

-- Проверяем, что политики работают корректно
-- SELECT * FROM customer_orders LIMIT 5;
-- SELECT * FROM customer_order_items LIMIT 5;
