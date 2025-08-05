-- This migration corrects the previous one by replacing the call to the non-existent
-- 'get_my_claim' function with the standard and reliable method of checking the user's
-- role via the 'profiles' table.

-- First, drop the faulty policies to ensure a clean state.
DROP POLICY IF EXISTS "Allow agent to read all products" ON public.products;
DROP POLICY IF EXISTS "Allow agent to read all goods receipt items" ON public.goods_receipt_items;

-- 1. Grant explicit SELECT access on `products` for the 'agent' role.
CREATE POLICY "Allow agent to read all products"
ON public.products
FOR SELECT
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'agent'::text);

-- 2. Grant explicit SELECT access on `goods_receipt_items` for the 'agent' role.
CREATE POLICY "Allow agent to read all goods receipt items"
ON public.goods_receipt_items
FOR SELECT
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'agent'::text);
