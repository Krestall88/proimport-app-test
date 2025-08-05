-- Добавляем поле goods_receipt_item_id в таблицу customer_order_items

-- Добавляем столбец goods_receipt_item_id
ALTER TABLE public.customer_order_items
ADD COLUMN IF NOT EXISTS goods_receipt_item_id UUID REFERENCES goods_receipt_items(id);

-- Создаем индекс для улучшения производительности
CREATE INDEX IF NOT EXISTS idx_customer_order_items_goods_receipt_item_id
ON customer_order_items(goods_receipt_item_id);
