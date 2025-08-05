-- Ensure unique inventory records by product, batch, and expiry date
CREATE UNIQUE INDEX IF NOT EXISTS inventory_product_batch_expiry_unique
ON public.inventory (product_id, batch_number, expiry_date);
