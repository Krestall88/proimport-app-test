import type { WarehouseOrderItem } from '@/lib/types';

export function mapCustomerOrdersToWarehouseOrders(rawOrders: any[]): WarehouseOrderItem[] {
  // Если массив уже плоский (warehouse_orders_view), просто возвращаем его как есть
  if (rawOrders.length > 0 && rawOrders[0].order_item_id) {
    return rawOrders.map((item: any) => ({
      purchase_order_id: item.order_id,
      created_at: item.created_at,
      shipped_at: item.shipped_at || null,
      status: item.status,
      customer_name: item.customer_name,
      customer: item.customer || null,
      order_item_id: item.order_item_id,
      product: {
        id: item.product_id || '',
        title: item.product_name || '',
        nomenclature_code: item.nomenclature_code || '',
        description: item.description || '',
        purchase_price: item.purchase_price ?? null,
        selling_price: item.selling_price ?? null,
        category: item.category || '',
        unit: item.unit || '',
        expiry_date: item.expiry_date,
        batch_number: item.batch_number,
        created_at: item.product_created_at || '',
        supplier_id: item.supplier_id ?? null,
        characteristics: item.characteristics,
        available_quantity: item.available_quantity ?? item.quantity ?? 0,
      },
      available_quantity: item.available_quantity ?? item.quantity ?? 0,
      price_per_unit: item.price_per_unit ?? undefined,
      final_price: item.final_price ?? undefined
    }));
  }
  // Старый режим: вложенные order_items (на всякий случай)
  const rows: WarehouseOrderItem[] = [];
  for (const order of rawOrders) {
    const { id, created_at, status, customer_name, customer, order_items } = order;
    if (Array.isArray(order_items)) {
      for (const item of order_items) {
        rows.push({
          purchase_order_id: id,
          created_at,
          shipped_at: item.shipped_at || null,
          status,
          customer_name,
          customer,
          order_item_id: item.id,
          product: item.product ?? null,
          available_quantity: item.available_quantity ?? 0,
          price_per_unit: item.price_per_unit ?? undefined,
          final_price: item.final_price ?? undefined
        });
      }
    }
  }
  return rows;
}
