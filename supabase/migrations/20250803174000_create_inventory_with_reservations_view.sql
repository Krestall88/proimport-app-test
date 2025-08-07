-- Migration to create inventory view that accounts for customer order reservations
-- This view will show actual available quantities for all roles (agent, warehouse, manager)

CREATE OR REPLACE VIEW inventory_with_reservations AS
SELECT 
    gri.product_id,
    gri.batch_number,
    gri.expiry_date,
    gri.description,
    gri.characteristics,
    SUM(gri.quantity_received) as total_received,
    COALESCE(SUM(coi.quantity), 0) as total_reserved,
    SUM(gri.quantity_received) - COALESCE(SUM(coi.quantity), 0) as available_quantity,
    p.title as product_name,
    p.nomenclature_code as sku,
    p.unit,
    p.category,
    COALESCE(gri.final_price, p.selling_price, 0) as final_price,
    p.purchase_price
FROM goods_receipt_items gri
JOIN products p ON gri.product_id = p.id
LEFT JOIN customer_order_items coi ON gri.id = coi.goods_receipt_item_id
    AND coi.customer_order_id IN (
        SELECT id FROM customer_orders 
        WHERE status NOT IN ('cancelled', 'completed', 'delivered')
    )
GROUP BY 
    gri.product_id, 
    gri.batch_number, 
    gri.expiry_date, 
    gri.description,
    gri.characteristics,
    p.title, 
    p.nomenclature_code, 
    p.unit, 
    p.category, 
    gri.final_price, 
    p.selling_price,
    p.purchase_price;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customer_order_items_goods_receipt_item_id ON customer_order_items(goods_receipt_item_id);
CREATE INDEX IF NOT EXISTS idx_customer_order_items_order_id ON customer_order_items(customer_order_id);
CREATE INDEX IF NOT EXISTS idx_customer_orders_status ON customer_orders(status);
