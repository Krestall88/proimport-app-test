-- Миграция: добавление поля expected_delivery_date в customer_orders
-- Описание: Это поле хранит ожидаемую дату поставки по заказу (customer_orders), используется для планирования и отображения сроков исполнения заказов в менеджерских и складских интерфейсах.

ALTER TABLE public.customer_orders
ADD COLUMN expected_delivery_date date;

-- После применения этой миграции пересоздайте view manager_orders_view, чтобы добавить это поле в выборку.
