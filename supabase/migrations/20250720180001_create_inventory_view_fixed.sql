-- Агрегирующее представление для остатков склада (batch inventory)
-- description берём из products, так как в goods_receipt_items его нет
DROP VIEW IF EXISTS batch_inventory_view;

CREATE OR REPLACE VIEW batch_inventory_view AS
SELECT
  gri.product_id,
  gri.batch_number,
  gri.expiry_date,
  SUM(gri.quantity_received) AS quantity,
  p.title AS name,
  p.nomenclature_code AS sku,
  p.unit,
  p.category,
  p.description
FROM goods_receipt_items gri
JOIN products p ON gri.product_id = p.id
GROUP BY gri.product_id, gri.batch_number, gri.expiry_date, p.title, p.nomenclature_code, p.unit, p.category, p.description;
