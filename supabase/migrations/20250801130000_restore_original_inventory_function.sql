-- Restore the original version of the function to start debugging from a clean slate.
-- This undoes the type changes and allows for a fresh investigation of the 400 Bad Request error.

DROP FUNCTION IF EXISTS get_available_inventory_for_agent();

CREATE OR REPLACE FUNCTION get_available_inventory_for_agent()
RETURNS TABLE (
    product_id UUID,
    name TEXT,
    sku TEXT,
    available_quantity BIGINT,
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
