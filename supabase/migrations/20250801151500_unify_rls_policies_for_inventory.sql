-- This migration performs a full cleanup of all old, conflicting, and redundant RLS policies
-- on the `products` and `goods_receipt_items` tables. It replaces them with a single,
-- clean, and non-conflicting set of policies for clarity and correctness.

-- STEP 1: Full cleanup of old policies from the products table
DROP POLICY IF EXISTS "Allow agent to read all products" ON public.products;
DROP POLICY IF EXISTS "Allow agent to read products" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated read access on products" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated read on products" ON public.products;
DROP POLICY IF EXISTS "Allow owner to read all products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can view products" ON public.products;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
DROP POLICY IF EXISTS "Owners can manage products" ON public.products;

-- STEP 2: Full cleanup of old policies from the goods_receipt_items table
DROP POLICY IF EXISTS "Allow agent to read all goods receipt items" ON public.goods_receipt_items;
DROP POLICY IF EXISTS "Allow agent to read goods_receipt_items" ON public.goods_receipt_items;
DROP POLICY IF EXISTS "Allow all on goods_receipt_items" ON public.goods_receipt_items;
DROP POLICY IF EXISTS "Allow authenticated insert on goods_receipt_items" ON public.goods_receipt_items;
DROP POLICY IF EXISTS "Allow authenticated read access on goods_receipt_items" ON public.goods_receipt_items;
DROP POLICY IF EXISTS "Allow owner to read all goods receipt items" ON public.goods_receipt_items;
DROP POLICY IF EXISTS "Users who can see GR can see its items" ON public.goods_receipt_items;
DROP POLICY IF EXISTS "Warehouse managers can manage GR items" ON public.goods_receipt_items;

-- STEP 3: Creation of unified, clean policies
-- For the products table
CREATE POLICY "Allow read access to owner and agent" 
ON public.products FOR SELECT
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('owner', 'agent'));

CREATE POLICY "Allow full access for owners"
ON public.products FOR ALL
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'owner')
WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'owner');

-- For the goods_receipt_items table
CREATE POLICY "Allow read access to owner and agent"
ON public.goods_receipt_items FOR SELECT
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('owner', 'agent'));

CREATE POLICY "Allow full access for owners"
ON public.goods_receipt_items FOR ALL
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'owner')
WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'owner');
