-- This migration fixes the get_available_inventory_for_agent function to ensure final_price is never NULL.
-- If gri.final_price is NULL, it will default to 0.

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
        CAST((gri.quantity_received - COALESCE(gri.reserved_quantity, 0)) AS BIGINT) as available_quantity,
        CAST(gri.expiry_date AS TIMESTAMPTZ) as expiry_date,
        p.description,
        gri.batch_number,
        p.unit,
        NULL::text as category,
        COALESCE(gri.final_price, 0) as final_price
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
