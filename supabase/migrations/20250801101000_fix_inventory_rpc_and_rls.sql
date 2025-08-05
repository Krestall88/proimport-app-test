-- 1. Fix the RPC function to remove dependency on the non-existent 'categories' table.
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
    category TEXT, -- Will return NULL
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
        NULL::text as category, -- Return NULL for category
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

-- 2. Apply correct RLS policies for the agent role.

-- Enable RLS for tables if not already enabled
ALTER TABLE public.goods_receipt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for agent to avoid conflicts
DROP POLICY IF EXISTS "Allow agent to read goods_receipt_items" ON public.goods_receipt_items;
DROP POLICY IF EXISTS "Allow agent to read products" ON public.products;

-- Create policies to allow agents to read inventory-related tables
CREATE POLICY "Allow agent to read goods_receipt_items"
ON public.goods_receipt_items
FOR SELECT
TO agent
USING (true);

CREATE POLICY "Allow agent to read products"
ON public.products
FOR SELECT
TO agent
USING (true);
