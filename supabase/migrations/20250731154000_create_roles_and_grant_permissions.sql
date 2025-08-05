-- Создаём роли, только если они ещё не существуют.
DO $$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'agent') THEN
      CREATE ROLE agent;
   END IF;
END$$;

DO $$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'warehouse_worker') THEN
      CREATE ROLE warehouse_worker;
   END IF;
END$$;

-- Даём права на чтение для роли 'agent'
GRANT SELECT ON TABLE public.customers TO agent;
GRANT SELECT ON TABLE public.products TO agent;
GRANT SELECT ON TABLE public.goods_receipt_items TO agent;
GRANT USAGE, SELECT ON SEQUENCE customer_order_items_id_seq TO agent;
GRANT USAGE, SELECT ON SEQUENCE customer_orders_id_seq TO agent;


-- Даём права на чтение для роли 'warehouse_worker'
GRANT SELECT ON TABLE public.customers TO warehouse_worker;
GRANT SELECT ON TABLE public.products TO warehouse_worker;
GRANT SELECT ON TABLE public.goods_receipt_items TO warehouse_worker;

-- Политики RLS
-- Удаляем старые, если они существуют, чтобы избежать конфликтов
DROP POLICY IF EXISTS "Allow agent to read their own order items" ON public.customer_order_items;
DROP POLICY IF EXISTS "Allow warehouse_worker to read relevant order items" ON public.customer_order_items;

-- Создаём новые политики
CREATE POLICY "Allow agent to read their own order items" 
ON public.customer_order_items FOR SELECT 
TO agent 
USING (
  customer_order_id IN (SELECT id FROM customer_orders WHERE agent_id = auth.uid())
);

CREATE POLICY "Allow warehouse_worker to read relevant order items" 
ON public.customer_order_items FOR SELECT 
TO warehouse_worker 
USING (
  customer_order_id IN (SELECT id FROM customer_orders WHERE status IN ('new', 'picking', 'ready_for_shipment'))
);
