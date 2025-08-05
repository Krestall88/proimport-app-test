-- Даём права на чтение для роли 'agent'
GRANT SELECT ON TABLE public.customers TO agent;
GRANT SELECT ON TABLE public.products TO agent;
GRANT SELECT ON TABLE public.goods_receipt_items TO agent;

-- Даём права на чтение для роли 'warehouse_worker'
-- (на случай, если у них тоже не хватает прав на странице заказов кладовщика)
GRANT SELECT ON TABLE public.customers TO warehouse_worker;
GRANT SELECT ON TABLE public.products TO warehouse_worker;
GRANT SELECT ON TABLE public.goods_receipt_items TO warehouse_worker;

-- Политики RLS для customer_orders и customer_order_items уже должны быть, 
-- но убедимся, что они позволяют чтение связанным ролям.
-- Эта политика позволит агентам видеть свои заказы и связанные с ними позиции.
CREATE POLICY "Allow agent to read their own order items" 
ON public.customer_order_items FOR SELECT 
TO agent 
USING (
  customer_order_id IN (SELECT id FROM customer_orders WHERE agent_id = auth.uid())
);

-- Эта политика позволит кладовщикам видеть все позиции заказов, которые находятся в работе.
CREATE POLICY "Allow warehouse_worker to read relevant order items" 
ON public.customer_order_items FOR SELECT 
TO warehouse_worker 
USING (
  customer_order_id IN (SELECT id FROM customer_orders WHERE status IN ('new', 'picking', 'ready_for_shipment'))
);
