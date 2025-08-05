-- View for manager: all orders with item details, prices, supplier, for filtering by supplier and date
CREATE OR REPLACE VIEW manager_customer_orders_view AS
SELECT
  co.id AS order_id,
  co.created_at,
  co.status,
  c.name AS customer_name,
  coi.id AS order_item_id,
  p.title AS product_title,
  coi.quantity,
  coi.price_per_unit AS final_price,
  p.purchase_price,
  s.name AS supplier_name,
  (coi.quantity * coi.price_per_unit) AS item_total,
  (coi.quantity * p.purchase_price) AS item_purchase_total,
  p.id as product_id,
  s.id as supplier_id
FROM customer_orders co
JOIN customers c ON c.id = co.customer_id
JOIN customer_order_items coi ON coi.customer_order_id = co.id
JOIN products p ON p.id = coi.product_id
LEFT JOIN suppliers s ON s.id = p.supplier_id
-- фильтрация по supplier и дате делается на уровне запроса к view
ORDER BY co.created_at DESC, co.id, coi.id;
