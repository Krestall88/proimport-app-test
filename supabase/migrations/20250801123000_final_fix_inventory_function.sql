-- Final and definitive fix for the inventory function.
-- This version ensures that the returned 'available_quantity' type matches the type of the columns used in its calculation (INTEGER).
-- This should resolve the 400 Bad Request error by eliminating any possible type conflicts.

CREATE OR REPLACE FUNCTION get_available_inventory_for_agent()
RETURNS TABLE (
    product_id UUID,
    name TEXT,
    sku TEXT,
    available_quantity INTEGER, -- Changed from BIGINT to INTEGER to match source columns
    expiry_date TIMESTAMPTZ,
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
        (gri.quantity_received - COALESCE(gri.reserved_quantity, 0)) as available_quantity,
        gri.expiry_date,
        p.description,
        gri.batch_number,
        p.unit,
        NULL::text as category,
        gri.final_price
    FROM
        goods_receipt_items gri
    JOIN
        products p ON gri.product_id = p.id
    WHERE
        (gri.quantity_received - COALESCE(gri.reserved_quantity, 0)) > 0
    ORDER BY
        p.title, gri.expiry_date ASC;
END;
$$;
