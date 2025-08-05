-- Исправленная функция резервирования для актуальной структуры goods_receipt_items
CREATE OR REPLACE FUNCTION public.reserve_inventory_for_order()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  rows_affected INTEGER;
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.goods_receipt_items
    SET
      reserved_quantity = COALESCE(reserved_quantity, 0) + NEW.quantity
    WHERE
      id = NEW.goods_receipt_item_id
      AND (quantity_received - COALESCE(reserved_quantity, 0)) >= NEW.quantity;

    GET DIAGNOSTICS rows_affected = ROW_COUNT;

    IF rows_affected = 0 THEN
      RAISE EXCEPTION 'Не удалось зарезервировать товар. Недостаточно остатков на складе для партии (ID: %).', NEW.goods_receipt_item_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
