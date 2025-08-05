-- supabase/migrations/YYYYMMDDHHMMSS_create_analytics_functions.sql

-- Удаляем старые версии функций, если они существуют, чтобы избежать конфликтов
DROP FUNCTION IF EXISTS get_sales_chart_data();
DROP FUNCTION IF EXISTS get_analytics_kpis();
DROP FUNCTION IF EXISTS get_top_products();
DROP FUNCTION IF EXISTS get_top_customers();

-- Функция для данных графика продаж (выручка по месяцам)
create or replace function get_sales_chart_data()
returns table (month text, total_revenue numeric)
language sql
as $$
  select
    to_char(co.created_at, 'YYYY-MM') as month,
    sum(coi.quantity * coi.price_per_unit) as total_revenue
  from customer_orders as co
  join customer_order_items as coi on co.id = coi.customer_order_id
  where co.status = 'shipped' -- Учитываем только отгруженные заказы
  group by month
  order by month;
$$;

-- Заглушка для KPI
create or replace function get_analytics_kpis()
returns table (total_revenue numeric, avg_order_value numeric, total_orders bigint, warehouse_value numeric)
language sql
as $$
  select
    coalesce(sum(coi.quantity * coi.price_per_unit), 0) as total_revenue,
    coalesce(avg(order_totals.order_total), 0) as avg_order_value,
    count(distinct co.id) as total_orders,
    (select coalesce(sum(bi.quantity * bi.price), 0) from batch_inventory_view bi) as warehouse_value
  from customer_orders co
  left join customer_order_items coi on co.id = coi.customer_order_id
  left join (
    select co.id, sum(coi.quantity * coi.price_per_unit) as order_total
    from customer_orders co
    left join customer_order_items coi on co.id = coi.customer_order_id
    where co.status = 'shipped'
    group by co.id
  ) as order_totals on co.id = order_totals.id
  where co.status = 'shipped';
$$;

-- Заглушка для топ-продуктов
create or replace function get_top_products()
returns table (product_id uuid, product_title text, total_sold numeric)
language sql
as $$
  select
    coi.product_id,
    p.name as product_title,
    sum(coi.quantity) as total_sold
  from customer_orders co
  join customer_order_items coi on co.id = coi.customer_order_id
  join products p on p.id = coi.product_id
  where co.status = 'shipped'
  group by coi.product_id, p.name
  order by total_sold desc
  limit 5;
$$;

-- Заглушка для топ-клиентов
create or replace function get_top_customers()
returns table (customer_id uuid, customer_name text, total_spent numeric)
language sql
as $$
  select
    co.customer_id,
    c.name as customer_name,
    sum(coi.quantity * coi.price_per_unit) as total_spent
  from customer_orders co
  join customer_order_items coi on co.id = coi.customer_order_id
  join customers c on c.id = co.customer_id
  where co.status = 'shipped'
  group by co.customer_id, c.name
  order by total_spent desc
  limit 5;
$$;
