-- Drop trigger if it exists to ensure a clean slate
DROP TRIGGER IF EXISTS on_new_order_item_reserve_inventory ON public.customer_order_items;

-- Create the trigger to call the reservation function after a new order item is inserted
CREATE TRIGGER on_new_order_item_reserve_inventory
  AFTER INSERT
  ON public.customer_order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.reserve_inventory_for_order();
