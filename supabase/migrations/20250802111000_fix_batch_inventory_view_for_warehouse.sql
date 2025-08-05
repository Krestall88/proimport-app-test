-- This migration fixes the batch_inventory_view to match BatchInventoryItem type
-- and ensure product names are properly displayed on warehouse inventory page

DROP VIEW IF EXISTS batch_inventory_view;

CREATE VIEW batch_inventory_view AS
SELECT 
    gri.product_id,
    gri.batch_number,
    gri.expiry_date,
    gri.description,
    SUM(gri.quantity_received) AS quantity,
    p.title AS name,
    p.nomenclature_code AS sku,
    p.unit,
    p.category,
    COALESCE(gri.final_price, p.selling_price, 0) AS price
FROM goods_receipt_items gri
JOIN products p ON gri.product_id = p.id
GROUP BY 
    gri.product_id, gri.batch_number, gri.expiry_date, gri.description, 
    p.title, p.nomenclature_code, p.unit, p.category, gri.final_price, p.selling_price;
