-- Ensure unique inventory records by product and batch
CREATE UNIQUE INDEX IF NOT EXISTS inventory_product_batch_unique
ON public.inventory (product_id, batch_number);
