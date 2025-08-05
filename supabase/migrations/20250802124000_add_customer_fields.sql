-- Добавляем новые поля в таблицу customers если они еще не существуют
ALTER TABLE customers ADD COLUMN IF NOT EXISTS tin TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS kpp TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS delivery_address TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS payment_terms TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS comments TEXT;

-- Добавляем комментарии к полям для документации
COMMENT ON COLUMN customers.tin IS 'ИНН клиента';
COMMENT ON COLUMN customers.kpp IS 'КПП клиента';
COMMENT ON COLUMN customers.delivery_address IS 'Адрес доставки';
COMMENT ON COLUMN customers.payment_terms IS 'Условия оплаты';
COMMENT ON COLUMN customers.comments IS 'Комментарии';
