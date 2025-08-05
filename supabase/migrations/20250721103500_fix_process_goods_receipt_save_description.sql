-- Исправление: сохранять description в goods_receipt_items и inventory при приёмке
-- Доработанная функция process_goods_receipt

-- Добавление колонки description в inventory
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS description TEXT;

-- Удаление старой функции (если существует)
DROP FUNCTION IF EXISTS public.process_goods_receipt(JSONB, BOOLEAN);

-- Создание новой функции
CREATE OR REPLACE FUNCTION public.process_goods_receipt(p_receipt_data JSONB, p_is_draft BOOLEAN)
RETURNS SETOF UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_receipt_id UUID;
  v_status TEXT;
  v_user_id UUID;
  item RECORD;
  v_inventory_id UUID;
BEGIN
  -- Получаем ID текущего авторизованного пользователя
  v_user_id := auth.uid();

  -- Проверяем, что пользователь авторизован
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Пользователь не авторизован';
  END IF;

  -- Определяем статус на основе флага черновика
  v_status := CASE WHEN p_is_draft THEN 'draft'::TEXT ELSE 'completed'::TEXT END;
  
  -- Создаем или обновляем запись о приходе товара
  INSERT INTO public.goods_receipts (
    id,
    purchase_order_id,
    receipt_date,
    status,
    created_by,
    created_at,
    updated_at
  ) VALUES (
    COALESCE((p_receipt_data->>'id')::UUID, gen_random_uuid()),
    (p_receipt_data->>'purchase_order_id')::UUID,
    (p_receipt_data->>'receipt_date')::TIMESTAMP WITH TIME ZONE,
    v_status,
    v_user_id,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    updated_at = NOW()
  RETURNING id INTO v_receipt_id;
  
  -- Удаляем старые позиции приходного ордера, если они есть
  DELETE FROM public.goods_receipt_items WHERE goods_receipt_id = v_receipt_id;
  
  -- Добавляем новые позиции из массива 'items'
  FOR item IN SELECT * FROM jsonb_to_recordset(p_receipt_data->'items') AS x(
    product_id UUID, 
    quantity_received NUMERIC,
    batch_number TEXT,
    expiry_date TEXT,
    description TEXT,
    comment TEXT
  )
  LOOP
    INSERT INTO public.goods_receipt_items (
      goods_receipt_id,
      product_id,
      quantity_received,
      batch_number,
      expiry_date,
      description,
      notes,
      created_at,
      updated_at
    ) VALUES (
      v_receipt_id,
      item.product_id,
      item.quantity_received,
      NULLIF(item.batch_number, ''),
      NULLIF(item.expiry_date, '')::DATE,
      item.description,
      item.comment,
      NOW(),
      NOW()
    );
    
    -- Если это не черновик, обновляем складские остатки
    IF NOT p_is_draft THEN
      -- Обновляем или создаем запись в инвентаре
      INSERT INTO public.inventory (product_id, quantity, description, created_at, updated_at)
      VALUES (item.product_id, item.quantity_received, item.description, NOW(), NOW())
      ON CONFLICT (product_id) DO UPDATE
      SET quantity = inventory.quantity + item.quantity_received,
          description = EXCLUDED.description,
          updated_at = NOW();
    END IF;
  END LOOP;
  
  -- Если это не черновик, обновляем статус заказа на закупку
  IF NOT p_is_draft THEN
    UPDATE public.purchase_orders
    SET 
      status = 'received',
      updated_at = NOW()
    WHERE id = (p_receipt_data->>'purchase_order_id')::UUID;
  END IF;
  
  -- Возвращаем ID созданного/обновленного приходного ордера
  RETURN QUERY SELECT v_receipt_id;
END;
$$;