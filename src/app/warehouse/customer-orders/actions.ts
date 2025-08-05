'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function confirmOrderPicked(orderId: string, nextStatus: 'picking' | 'ready_for_shipment') {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('customer_orders')
    .update({ status: nextStatus })
    .eq('id', orderId)
    .select();

  if (error) {
    console.error('Error confirming order picking:', error);
    return { error: 'Не удалось подтвердить сборку заказа.' };
  }

  // Перепроверяем пути, чтобы обновить данные на всех страницах
  revalidatePath('/warehouse/customer-orders');
  revalidatePath('/agent/customer-orders');
  revalidatePath('/manager/customer-orders');

  return { success: true, data };
}
