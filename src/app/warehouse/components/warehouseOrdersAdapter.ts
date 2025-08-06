import type { WarehouseOrderItem } from '@/lib/types';

export function mapCustomerOrdersToWarehouseOrders(rawOrders: any[]): WarehouseOrderItem[] {
  // Если массив уже плоский (warehouse_orders_view), просто возвращаем его как есть
  if (rawOrders.length > 0 && rawOrders[0].order_item_id) {
    return rawOrders.map((item: any) => ({
      order_id: item.order_id,
      created_at: item.created_at,
      shipped_at: null,
      status: item.status,
      customer_name: item.customer_name,
      customer: null,
      order_item_id: item.order_item_id,
      product_title: item.product_name,
      description: item.description,
      sku: item.sku,
      category: item.category,
      expiry_date: item.expiry_date,
      batch_number: item.batch_number,
      quantity: item.quantity,
      unit: item.unit || '-',
    }));
  }
  // Старый режим: вложенные order_items (на всякий случай)
  const rows: WarehouseOrderItem[] = [];
  for (const order of rawOrders) {
    const { id: order_id, created_at, status, customer_name, customer, order_items } = order;
    if (Array.isArray(order_items)) {
      for (const item of order_items) {
        rows.push({
          order_id,
          created_at,
          shipped_at: item.shipped_at || null,
          status,
          customer_name,
          customer,
          order_item_id: item.id,
          product_title: item.product?.title || '-',
          description: item.product?.description || '-',
          sku: item.product?.nomenclature_code || '-',
          category: item.product?.category || '-',
          expiry_date: item.expiry_date || null,
          batch_number: item.batch_number || null,
          quantity: item.quantity,
          unit: item.product?.unit || '-',
        });
      }
    }
  }
  return rows;
}
