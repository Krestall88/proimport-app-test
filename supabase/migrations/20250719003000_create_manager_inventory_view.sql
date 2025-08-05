-- 20250719003000_create_manager_inventory_view.sql
-- Создаёт представление manager_inventory_view с поддержкой партий, срока годности и характеристик

DROP VIEW IF EXISTS manager_inventory_view;

create or replace view manager_inventory_view as
select
    concat(gri.product_id, '-', gri.batch_number, '-', coalesce(gri.expiry_date::text, '')) as id,
    gri.product_id,
    p.title as product_title,
    p.nomenclature_code as sku,
    sum(gri.quantity_received) as quantity,
    p.purchase_price,
    p.selling_price as final_price,
    gri.expiry_date,
    p.description as description,
    gri.batch_number
from goods_receipt_items gri
join products p on p.id = gri.product_id
where gri.quantity_received > 0
-- Можно добавить фильтр по статусу товара, если потребуется
group by gri.product_id, gri.batch_number, gri.expiry_date, p.title, p.nomenclature_code, p.purchase_price, p.selling_price, p.description;
