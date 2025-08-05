-- Добавить поле description для хранения уникального описания партии при приёмке
ALTER TABLE public.goods_receipt_items
ADD COLUMN IF NOT EXISTS description TEXT;
