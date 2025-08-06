-- 2025-08-06 09:22:00
-- Добавляет статус 'shipped' в warehouse_orders_view для отображения отгруженных заказов на складе

CREATE OR REPLACE VIEW public.warehouse_orders_view AS
SELECT
    co.id as order_id,
    co.created_at,
    co.status,
    c.name as customer_name,
    coi.id as order_item_id,
    p.title as product_name,
    p.nomenclature_code as sku,
    p.description as description,
    p.category as category,
    coi.quantity,
    p.unit,
    gri.batch_number,
    gri.expiry_date
FROM
    customer_order_items coi
JOIN
    customer_orders co ON coi.customer_order_id = co.id
JOIN
    products p ON coi.product_id = p.id
JOIN
    customers c ON co.customer_id = c.id
LEFT JOIN
    goods_receipt_items gri ON coi.goods_receipt_item_id = gri.id
WHERE
    co.status IN ('new', 'picking', 'ready_for_shipment', 'shipped');
