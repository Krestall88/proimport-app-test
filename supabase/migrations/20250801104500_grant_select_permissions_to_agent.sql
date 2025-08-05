-- Grant basic SELECT permissions for the agent role on necessary tables.
-- This is a fundamental step required before RLS policies can even be evaluated for the role.

GRANT SELECT ON TABLE public.products TO agent;
GRANT SELECT ON TABLE public.goods_receipt_items TO agent;

-- Re-apply RLS policies to ensure they are correctly configured after granting permissions.

DROP POLICY IF EXISTS "Allow agent to read products" ON public.products;
CREATE POLICY "Allow agent to read products"
ON public.products
FOR SELECT
TO agent
USING (true);

DROP POLICY IF EXISTS "Allow agent to read goods_receipt_items" ON public.goods_receipt_items;
CREATE POLICY "Allow agent to read goods_receipt_items"
ON public.goods_receipt_items
FOR SELECT
TO agent
USING (true);
