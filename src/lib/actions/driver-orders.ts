import { createClient } from '@/lib/supabase/server';

// Получить заказы для водителя (только ready_for_shipment)
export async function getDriverOrders() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('customer_orders')
    .select(`
      id,
      created_at,
      status,
      customer:customers(id, name, delivery_address, contacts),
      customer_id,
      items:customer_order_items(id),
      items_count:customer_order_items(count)
    `)
    .eq('status', 'ready_for_shipment')
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Унифицируем формат данных для таблицы
  return (data || []).map(order => ({
    id: order.id,
    created_at: new Date(order.created_at).toLocaleString(),
    status: order.status,
    customer_name: order.customer?.name || '',
    customer_phone: (order.customer?.contacts && typeof order.customer.contacts === 'object' && 'phone' in order.customer.contacts)
      ? (order.customer.contacts as any).phone || ''
      : '',
    customer_address: order.customer?.delivery_address || '',
    items_count: order.items ? order.items.length : order.items_count || 0,
  }));
}

// Подтвердить отгрузку заказа (сменить статус на 'shipped')
export async function confirmOrderShipped(orderId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('customer_orders')
    .update({ status: 'shipped' })
    .eq('id', orderId);
  if (error) throw error;
}
