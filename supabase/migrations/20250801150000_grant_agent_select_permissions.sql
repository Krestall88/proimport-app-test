-- This migration grants explicit SELECT permissions to the 'agent' role on the tables
-- required by the get_available_inventory_for_agent() function.
-- This is to ensure that agents can view inventory data when creating customer orders.

-- 1. Grant explicit SELECT access on `products` for the 'agent' role.
CREATE POLICY "Allow agent to read all products"
ON public.products
FOR SELECT
TO authenticated
USING ((get_my_claim('role'::text)) = 'agent'::text);

-- 2. Grant explicit SELECT access on `goods_receipt_items` for the 'agent' role.
CREATE POLICY "Allow agent to read all goods receipt items"
ON public.goods_receipt_items
FOR SELECT
TO authenticated
USING ((get_my_claim('role'::text)) = 'agent'::text);
