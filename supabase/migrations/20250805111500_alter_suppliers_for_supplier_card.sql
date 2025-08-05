-- Добавление недостающих полей в таблицу suppliers для идентичности карточке клиента
ALTER TABLE public.suppliers
ADD COLUMN IF NOT EXISTS tin text,
ADD COLUMN IF NOT EXISTS kpp text,
ADD COLUMN IF NOT EXISTS delivery_address text,
ADD COLUMN IF NOT EXISTS payment_terms text,
ADD COLUMN IF NOT EXISTS comments text,
ADD COLUMN IF NOT EXISTS contacts jsonb; -- унификация с customers

-- Примечание: поле contacts дублирует contact, если нужно, можно позже удалить старое поле contact
