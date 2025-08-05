-- Добавление supplier_id в таблицу products для поддержки фильтрации по поставщику и внешнего ключа
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS supplier_id uuid REFERENCES public.suppliers(id) ON DELETE SET NULL;

-- (Опционально) Индекс для ускорения поиска по supplier_id
CREATE INDEX IF NOT EXISTS idx_products_supplier_id ON public.products(supplier_id);

-- Комментарий для документации
COMMENT ON COLUMN public.products.supplier_id IS 'ID поставщика, внешний ключ на suppliers(id), используется для фильтрации и аналитики';
