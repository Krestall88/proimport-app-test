-- Миграция для добавления поля purchase_price в представление manager_customer_orders_view

-- Удаляем старое представление для заказов агента
DROP VIEW IF EXISTS manager_customer_orders_view;

-- Создаем новое представление для заказов агента
CREATE VIEW manager_customer_orders_view AS
SELECT 
    co.id AS order_id,
    co.created_at,
    co.status,
    co.agent_id,
    c.name AS customer_name,
    coi.id AS order_item_id,
    p.title AS product_title,
    p.description,
    p.nomenclature_code AS sku,
    p.category,
    gri.batch_number,
    gri.expiry_date,
    coi.quantity,
    p.unit,
    -- Закупочная цена из goods_receipt_items или products
    COALESCE(gri.purchase_price, p.purchase_price, 0) AS purchase_price,
    -- Финальная цена (продажи) из goods_receipt_items или products
    COALESCE(NULLIF(gri.final_price, 0), p.selling_price, 0) AS final_price,
    -- Рассчитываем общую сумму позиции по финальной цене
    COALESCE(NULLIF(gri.final_price, 0), p.selling_price, 0) * coi.quantity AS item_total
FROM customer_orders co
JOIN customers c ON co.customer_id = c.id
JOIN customer_order_items coi ON co.id = coi.customer_order_id
JOIN products p ON coi.product_id = p.id
LEFT JOIN goods_receipt_items gri ON coi.goods_receipt_item_id = gri.id
ORDER BY co.created_at DESC, co.id, coi.id;
