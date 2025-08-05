-- Сначала удалим старые, некорректные политики, если они успели создаться
DROP POLICY IF EXISTS "Allow agent to read their own orders" ON public.customer_orders;
DROP POLICY IF EXISTS "Allow agent to read their own order items" ON public.customer_order_items;

-- Политика для таблицы customer_orders: агент видит только свои заказы.
CREATE POLICY "Allow agent to read their own orders"
ON public.customer_orders
FOR SELECT
TO authenticated
USING (
  (auth.jwt() ->> 'role') = 'agent' AND
  (agent_id = auth.uid())
);

-- Политика для таблицы customer_order_items: агент видит позиции только в своих заказах.
CREATE POLICY "Allow agent to read their own order items"
ON public.customer_order_items
FOR SELECT
TO authenticated
USING (
  (auth.jwt() ->> 'role') = 'agent' AND
  (EXISTS (
    SELECT 1 FROM customer_orders co
    WHERE co.id = customer_order_items.customer_order_id AND co.agent_id = auth.uid()
  ))
);
