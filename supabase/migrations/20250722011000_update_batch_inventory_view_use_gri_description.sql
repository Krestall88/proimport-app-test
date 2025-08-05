-- Обновить view: брать описание партии из goods_receipt_items.description
DROP VIEW IF EXISTS batch_inventory_view;

CREATE OR REPLACE VIEW batch_inventory_view AS
SELECT
  gri.product_id,
  gri.batch_number,
  gri.expiry_date,
  gri.description,
  SUM(gri.quantity_received) AS quantity,
  p.title AS name,
  p.nomenclature_code AS sku,
  p.unit,
  p.category
FROM goods_receipt_items gri
JOIN products p ON gri.product_id = p.id
GROUP BY gri.product_id, gri.batch_number, gri.expiry_date, gri.description, p.title, p.nomenclature_code, p.unit, p.category;
