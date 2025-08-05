-- This migration fixes the root cause of the inventory access issue for the 'owner' role.
-- It creates explicit, non-conflicting SELECT policies for the 'owner' on both
-- `products` and `goods_receipt_items` tables.
-- This ensures that when a function is called by the 'owner', it has unambiguous
-- read access to all necessary data, resolving the 400 Bad Request error without
-- resorting to `SECURITY DEFINER`.

-- 1. Grant explicit SELECT access on `products` for the 'owner' role.
CREATE POLICY "Allow owner to read all products"
ON public.products
FOR SELECT
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'owner');

-- 2. Grant explicit SELECT access on `goods_receipt_items` for the 'owner' role.
CREATE POLICY "Allow owner to read all goods receipt items"
ON public.goods_receipt_items
FOR SELECT
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'owner');
