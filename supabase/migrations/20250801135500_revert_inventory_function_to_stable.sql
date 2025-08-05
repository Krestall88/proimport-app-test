-- This migration reverts the inventory function to a known stable state.
-- It temporarily removes the logic for subtracting reserved_quantity, which was causing a 400 Bad Request error.
-- The goal is to restore functionality to the page first, and then diagnose the subtraction issue separately.

DROP FUNCTION IF EXISTS get_available_inventory_for_agent();

CREATE OR REPLACE FUNCTION get_available_inventory_for_agent()
RETURNS TABLE (
    product_id UUID,
    name TEXT,
    sku TEXT,
    available_quantity NUMERIC,
    expiry_date DATE,
    description TEXT,
    batch_number TEXT,
    unit TEXT,
    category TEXT,
    final_price NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id as product_id,
        p.title as name,
        p.nomenclature_code as sku,
        gri.quantity_received::NUMERIC as available_quantity, -- Reverted: just show received quantity
        gri.expiry_date,
        p.description,
        gri.batch_number,
        p.unit,
        NULL::text as category,
        p.price as final_price
    FROM
        goods_receipt_items gri
    JOIN
        products p ON gri.product_id = p.id
    WHERE
        gri.quantity_received > 0 -- Simplified WHERE clause
    ORDER BY
        p.title, gri.expiry_date ASC;
END;
$$;
