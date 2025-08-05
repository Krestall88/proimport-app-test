-- =============================================================================
-- Function: upsert_inventory_on_receipt
-- Description: Atomically updates the inventory when goods are received.
--              If a product does not exist in the inventory, it creates a new
--              record. Otherwise, it adds the received quantity to the existing stock.
-- Parameters:
--   p_product_id: The UUID of the product being received.
--   p_quantity_to_add: The number of units being added to the inventory.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.upsert_inventory_on_receipt(p_product_id uuid, p_quantity_to_add integer)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_product_sku text;
  v_product_name text;
BEGIN
  -- First, get the necessary product details (SKU and name) from the products table.
  SELECT sku, name INTO v_product_sku, v_product_name
  FROM public.products
  WHERE id = p_product_id;

  -- If no product is found, raise an exception as we cannot update inventory for a non-existent product.
  IF v_product_sku IS NULL THEN
    RAISE EXCEPTION 'Product with ID % not found. Cannot update inventory.', p_product_id;
  END IF;

  -- Now, attempt to insert a new inventory record. 
  -- If a record with the same product_id already exists (ON CONFLICT), update it instead.
  INSERT INTO public.inventory (product_id, sku, name, quantity, status)
  VALUES (p_product_id, v_product_sku, v_product_name, p_quantity_to_add, 'in_stock')
  ON CONFLICT (product_id) 
  DO UPDATE SET
    quantity = inventory.quantity + p_quantity_to_add,
    -- Update the status to 'in_stock' as new items have been added.
    status = 'in_stock';

END;
$$;
