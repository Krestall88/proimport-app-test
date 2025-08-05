-- This script creates an RPC function to safely delete an inventory group.
-- It first unlinks the items from any customer orders, then deletes them.

CREATE OR REPLACE FUNCTION delete_inventory_group_and_unlink_orders(
  p_product_id UUID,
  p_batch_number TEXT,
  p_expiry_date DATE
)
RETURNS VOID AS $$
DECLARE
  item_ids UUID[];
BEGIN
  -- Step 1: Find all goods_receipt_items IDs that match the group criteria.
  SELECT array_agg(id) INTO item_ids
  FROM goods_receipt_items
  WHERE product_id = p_product_id
    AND (batch_number = p_batch_number OR (batch_number IS NULL AND p_batch_number IS NULL))
    AND (expiry_date = p_expiry_date OR (expiry_date IS NULL AND p_expiry_date IS NULL));

  -- Step 2: If any items were found, unlink them from customer_order_items.
  IF array_length(item_ids, 1) > 0 THEN
    UPDATE customer_order_items
    SET goods_receipt_item_id = NULL
    WHERE goods_receipt_item_id = ANY(item_ids);

    -- Step 3: Delete the actual goods_receipt_items records.
    DELETE FROM goods_receipt_items
    WHERE id = ANY(item_ids);
  END IF;

END;
$$ LANGUAGE plpgsql;
