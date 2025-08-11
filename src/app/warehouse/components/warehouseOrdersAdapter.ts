import type { WarehouseOrderItem } from '@/lib/types';

export function mapCustomerOrdersToWarehouseOrders(rawOrders: any[]): WarehouseOrderItem[] {
  // Если массив уже плоский (warehouse_orders_view), просто возвращаем его как есть
  if (rawOrders.length > 0 && rawOrders[0].order_item_id) {
    return rawOrders.map((item: any) => ({
      purchase_order_id: item.purchase_order_id || item.order_id || '',
      created_at: item.created_at,
      shipped_at: item.shipped_at || null,
      status: item.status,
      customer_name: item.customer_name,
      customer: item.customer || null,
      order_item_id: typeof item.order_item_id === 'string' ? item.order_item_id : String(item.order_item_id || ''),
      quantity: item.quantity, // This is the quantity in the order
      price_per_unit: item.price_per_unit ?? 0,
      product: {
        id: item.product_id || item.sku || '',
        title: item.product_name || '', // Use product_name from the view
        nomenclature_code: item.sku || '', // Use sku from the view
        description: item.description || '',
        purchase_price: item.purchase_price ?? null,
        selling_price: item.selling_price ?? null,
        category: item.category || '',
        unit: item.unit || '',
        expiry_date: item.expiry_date || null,
        batch_number: item.batch_number || '',
        created_at: item.product_created_at || '',
        supplier_id: item.supplier_id ?? null,
        characteristics: item.characteristics,
        quantity: item.quantity ?? 0
      },
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
          order_item_id: typeof item.id === 'string' ? item.id : (item.id ? String(item.id) : ''),
          product: item.product ?? null,
          quantity: item.quantity ?? 0,
          price_per_unit: item.price_per_unit ?? undefined
        });
      }
    }
  }
  return rows;
}
