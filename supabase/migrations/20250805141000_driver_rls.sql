-- Включить RLS для customer_orders, если ещё не включено
ALTER TABLE customer_orders ENABLE ROW LEVEL SECURITY;

-- Политика: Водитель видит только заказы со статусом 'ready_for_shipment'
CREATE POLICY "Driver can view ready_for_shipment orders" ON customer_orders
  FOR SELECT
  USING (
    auth.role() = 'driver' AND status = 'ready_for_shipment'
  );

-- Политика: Водитель может обновлять только статус заказа на 'shipped'
CREATE POLICY "Driver can mark order as shipped" ON customer_orders
  FOR UPDATE
  USING (
    auth.role() = 'driver' AND status = 'ready_for_shipment'
  )
  WITH CHECK (
    auth.role() = 'driver' AND status = 'shipped'
  );

-- (Опционально) Запретить INSERT/DELETE для водителя
-- Можно не создавать политики на insert/delete для роли driver, если не требуется
