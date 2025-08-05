-- Добавляем поле email в таблицу customers если оно еще не существует
ALTER TABLE customers ADD COLUMN IF NOT EXISTS email TEXT;

-- Добавляем комментарий к полю для документации
COMMENT ON COLUMN customers.email IS 'Email клиента';

-- Проверяем, что поле добавлено корректно
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'email';
