-- Ensure unique inventory records by product for ON CONFLICT (product_id)
CREATE UNIQUE INDEX IF NOT EXISTS inventory_product_id_unique
ON public.inventory (product_id);
