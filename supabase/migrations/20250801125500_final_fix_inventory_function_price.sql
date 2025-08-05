-- Final and correct version of the inventory function.
-- This version fixes the root cause of the 400 Bad Request error:
-- 1. Removed the non-existent `final_price` column from `goods_receipt_items`.
-- 2. The price is now correctly sourced from `p.price` in the `products` table.
-- 3. All return types (`NUMERIC` for quantity, `DATE` for expiry) now match the database schema.

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
    final_price NUMERIC -- Renamed from price to final_price for consistency in the client
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
        p.price as final_price -- Correctly sourcing the price from the products table
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
