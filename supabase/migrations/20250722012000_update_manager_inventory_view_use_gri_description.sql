-- Обновить view: брать описание партии из goods_receipt_items.description
DROP VIEW IF EXISTS manager_inventory_view;

CREATE OR REPLACE VIEW manager_inventory_view AS
SELECT
  concat(gri.product_id, '-', gri.batch_number, '-', coalesce(gri.expiry_date::text, '')) as id,
  gri.product_id,
  p.title as product_title,
  p.nomenclature_code as sku,
  sum(gri.quantity_received) as quantity,
  p.purchase_price,
  p.selling_price as final_price,
  gri.expiry_date,
  gri.description,
  gri.batch_number
FROM goods_receipt_items gri
JOIN products p ON p.id = gri.product_id
WHERE gri.quantity_received > 0
GROUP BY gri.product_id, gri.batch_number, gri.expiry_date, gri.description, p.title, p.nomenclature_code, p.purchase_price, p.selling_price;
