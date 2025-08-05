CREATE OR REPLACE FUNCTION get_available_batches_for_product(p_product_id UUID, p_required_qty INT)
RETURNS TABLE (
    batch_id UUID,
    available_qty BIGINT
)
AS $$
BEGIN
    RETURN QUERY
    WITH reserved_stock AS (
        -- Считаем, сколько товара по каждой партии зарезервировано в заказах
        SELECT
            coi.goods_receipt_item_id,
            SUM(coi.quantity) as reserved_quantity
        FROM customer_order_items coi
        JOIN customer_orders co ON coi.customer_order_id = co.id
        WHERE coi.goods_receipt_item_id IS NOT NULL
          AND co.status IN ('new', 'picking', 'ready_for_shipment')
        GROUP BY coi.goods_receipt_item_id
    )
    SELECT
        gri.id as batch_id,
        (gri.quantity_available - COALESCE(rs.reserved_quantity, 0)) as available_qty
    FROM goods_receipt_items gri
    LEFT JOIN reserved_stock rs ON gri.id = rs.goods_receipt_item_id
    WHERE gri.product_id = p_product_id
      AND (gri.quantity_available - COALESCE(rs.reserved_quantity, 0)) >= p_required_qty -- Фильтруем партии, где достаточно товара
    ORDER BY gri.created_at ASC; -- FIFO
END;
$$ LANGUAGE plpgsql;
