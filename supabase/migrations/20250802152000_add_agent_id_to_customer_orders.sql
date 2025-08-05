-- Добавляем поле agent_id в таблицу customer_orders
ALTER TABLE public.customer_orders ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Добавляем комментарий к полю для документации
COMMENT ON COLUMN public.customer_orders.agent_id IS 'ID агента, ответственного за заказ';

-- Обновляем существующие записи, устанавливая agent_id в NULL (или можно установить значение по умолчанию)
UPDATE public.customer_orders SET agent_id = NULL WHERE agent_id IS NULL;
