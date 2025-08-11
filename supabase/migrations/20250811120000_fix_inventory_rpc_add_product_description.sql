-- Updates get_inventory_with_reservations to include description from the products table
-- and renames sku to nomenclature_code for consistency.

CREATE OR REPLACE FUNCTION get_inventory_with_reservations()
RETURNS TABLE (
    product_id UUID,
    batch_number TEXT,
    expiry_date DATE,
    characteristics JSONB,
    total_received BIGINT,
    total_reserved BIGINT,
    available_quantity BIGINT,
    product_name TEXT,
    nomenclature_code TEXT, -- Renamed from sku
    description TEXT, -- Added from products table
    unit TEXT,
    category TEXT,
    final_price NUMERIC,
    purchase_price NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        gri.product_id,
        gri.batch_number,
        gri.expiry_date,
        gri.characteristics,
        SUM(gri.quantity_received)::BIGINT as total_received,
        COALESCE(SUM(coi.quantity), 0)::BIGINT as total_reserved,
        (SUM(gri.quantity_received) - COALESCE(SUM(coi.quantity), 0))::BIGINT as available_quantity,
        p.title as product_name,
        p.nomenclature_code, -- No longer aliased as sku
        p.description, -- Added from products table
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
        gri.characteristics,
        p.title, 
        p.nomenclature_code, 
        p.description, -- Added to GROUP BY
        p.unit, 
        p.category, 
        gri.final_price, 
        p.selling_price,
        p.purchase_price
    HAVING (SUM(gri.quantity_received) - COALESCE(SUM(coi.quantity), 0)) > 0
    ORDER BY gri.product_id, gri.batch_number, gri.expiry_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
