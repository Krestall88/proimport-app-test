-- Recreate the function to solve the "cannot change return type" error.
-- This is necessary because the signature of the function (the return types) is changing.
-- This script first DROPS the old function and then CREATES the new version with the correct INTEGER type for available_quantity.

DROP FUNCTION IF EXISTS get_available_inventory_for_agent();

CREATE OR REPLACE FUNCTION get_available_inventory_for_agent()
RETURNS TABLE (
    product_id UUID,
    name TEXT,
    sku TEXT,
    available_quantity INTEGER, -- Correct type to match source columns
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
