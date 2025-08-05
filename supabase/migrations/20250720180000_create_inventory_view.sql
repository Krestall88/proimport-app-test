-- Агрегирующее представление для остатков склада (batch inventory)
-- Группировка по product_id, batch_number, expiry_date, description
CREATE OR REPLACE VIEW batch_inventory_view AS
SELECT
  gri.product_id,
  gri.batch_number,
  gri.expiry_date,
  p.description as description,
  SUM(gri.quantity_received) AS quantity,
  p.title AS name,
  p.nomenclature_code AS sku,
  p.unit,
  p.category
FROM goods_receipt_items gri
JOIN products p ON gri.product_id = p.id
GROUP BY gri.product_id, gri.batch_number, gri.expiry_date, p.description, p.title, p.nomenclature_code, p.unit, p.category;

-- Для поддержки масштабируемости и быстрого доступа можно позже сделать materialized view + refresh по расписанию.
