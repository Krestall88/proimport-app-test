-- Миграция для исправления отображения цены в заказах с корректными именами колонок

-- Удаляем старое представление для заказов агента
DROP VIEW IF EXISTS manager_customer_orders_view;

-- Создаем новое представление для заказов агента
CREATE VIEW manager_customer_orders_view AS
SELECT 
    co.id AS order_id,
    co.created_at,
    co.status,
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
    -- Используем цену из goods_receipt_items, если она есть и больше 0, иначе из products
    COALESCE(NULLIF(gri.final_price, 0), p.selling_price, 0) AS final_price,
    -- Рассчитываем общую сумму позиции
    COALESCE(NULLIF(gri.final_price, 0), p.selling_price, 0) * coi.quantity AS item_total
FROM customer_orders co
JOIN customers c ON co.customer_id = c.id
JOIN customer_order_items coi ON co.id = coi.customer_order_id
JOIN products p ON coi.product_id = p.id
LEFT JOIN goods_receipt_items gri ON coi.goods_receipt_item_id = gri.id
ORDER BY co.created_at DESC, co.id, coi.id;

-- Удаляем старое представление для инвентаря
DROP VIEW IF EXISTS batch_inventory_view;

-- Создаем новое представление для инвентаря
CREATE VIEW batch_inventory_view AS
SELECT 
    gri.id,
    p.id AS product_id,
    p.title AS product_title,
    p.description,
    p.nomenclature_code AS sku,
    p.category,
    gri.batch_number,
    gri.expiry_date,
    gri.characteristics,
    SUM(gri.quantity_received) AS quantity,
    p.unit,
    -- Используем цену из goods_receipt_items, если она есть и больше 0, иначе из products
    COALESCE(NULLIF(gri.final_price, 0), p.purchase_price, 0) AS purchase_price,
    COALESCE(NULLIF(gri.final_price, 0), p.selling_price, 0) AS final_price
FROM goods_receipt_items gri
JOIN products p ON gri.product_id = p.id
WHERE gri.quantity_received > 0
GROUP BY 
    gri.id, p.id, p.title, p.description, p.nomenclature_code, 
    p.category, gri.batch_number, gri.expiry_date, gri.characteristics, 
    p.unit, gri.final_price, p.purchase_price, p.selling_price
ORDER BY p.title, gri.expiry_date;
