-- Расширенный view для заказов клиентов с деталями по каждой позиции и характеристиками партии
DROP VIEW IF EXISTS manager_customer_orders_view;

CREATE OR REPLACE VIEW manager_customer_orders_view AS
SELECT
  co.id AS order_id,
  co.created_at,
  co.status,
  co.shipped_at, -- если такого поля нет, замените на delivery.delivered_at или аналог
  c.name AS customer_name,
  coi.id AS order_item_id,
  p.title AS product_title,
  p.description,
  p.nomenclature_code AS sku,
  p.category,
  p.unit,
  gri.batch_number,
  gri.expiry_date,
  gri.description AS batch_description,
  coi.quantity,
  coi.price_per_unit AS final_price,
  p.purchase_price,
  (coi.quantity * coi.price_per_unit) AS item_total
FROM customer_orders co
JOIN customers c ON c.id = co.customer_id
JOIN customer_order_items coi ON coi.customer_order_id = co.id
JOIN products p ON p.id = coi.product_id
LEFT JOIN goods_receipt_items gri ON gri.product_id = p.id AND gri.customer_order_item_id = coi.id
-- Для shipped_at: если нет такого поля в customer_orders, используйте deliveries.delivered_at через LEFT JOIN deliveries ON deliveries.order_id = co.id
ORDER BY co.created_at DESC, co.id, coi.id;
