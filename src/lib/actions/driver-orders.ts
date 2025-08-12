"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Получить заказы для водителя (готовые к отгрузке и отгруженные)
export async function getDriverOrders() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('customer_orders')
    .select(`
      id,
      created_at,
      status,
      shipment_date,
      customer:customers(id, name, delivery_address, contacts),
      customer_id,
      items:customer_order_items(id),
      items_count:customer_order_items(count)
    `)
    .in('status', ['ready_for_shipment', 'shipped'])
     // Не показывать заказы с нулевым количеством
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Унифицируем формат данных для таблицы
  return (data || [])
    .filter((order): order is NonNullable<typeof order> => {
      if (!order) return false;
      const itemsCount = order.items_count as unknown as { count: number }[] | null;
      return (itemsCount?.[0]?.count ?? 0) > 0;
    })
    .map(order => ({
      id: order.id,
      created_at: new Date(order.created_at).toLocaleString(),
      status: order.status,
      shipment_date: order.shipment_date ? new Date(order.shipment_date).toLocaleString() : 'Не назначена',
      customer_name: order.customer?.name || '',
      customer_phone: (order.customer?.contacts && typeof order.customer.contacts === 'object' && 'phone' in order.customer.contacts)
        ? (order.customer.contacts as any).phone || ''
        : '',
      customer_address: order.customer?.delivery_address || '',
      items_count: order.items ? order.items.length : order.items_count || 0,
    }));
}

// Подтвердить отгрузку заказа (сменить статус на 'shipped')
export async function confirmOrderShipped(orderId: string): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('customer_orders')
    .update({ 
        status: 'shipped',
        shipment_date: new Date().toISOString() 
    })
    .eq('id', orderId)
    .eq('status', 'ready_for_shipment');

  if (error) {
    console.error('Error confirming shipment:', error);
    return { success: false, message: `Не удалось подтвердить отгрузку: ${error.message}` };
  }

  revalidatePath('/driver/orders');
  revalidatePath('/warehouse/customer-orders');
  revalidatePath('/agent/customer-orders');
  revalidatePath('/manager/orders');

  return { success: true, message: 'Статус заказа успешно обновлен.' };
}
