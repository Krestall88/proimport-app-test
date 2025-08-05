'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Deletes multiple order items from the database.
 * @param itemIds An array of order item IDs to delete.
 * @returns An object with success status and a message.
 */
export async function deleteOrderItems(itemIds: string[]) {
  if (itemIds.length === 0) {
    return { success: false, message: 'Не выбраны позиции для удаления.' };
  }

  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: 'Пользователь не авторизован' };
  }

  const { error } = await supabase
    .from('customer_order_items')
    .delete()
    .in('id', itemIds);

  if (error) {
    console.error('Error deleting order items:', error);
    return { success: false, message: `Ошибка при удалении позиций: ${error.message}` };
  }

  revalidatePath('/agent/customer-orders');
  revalidatePath('/warehouse/customer-orders');
  return { success: true, message: `${itemIds.length} позиций успешно удалено.` };
}

/**
 * Deletes entire order including all related items and records
 * @param orderId The ID of the order to delete
 * @returns An object with success status and a message
 */
export async function deleteEntireOrder(orderId: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: 'Пользователь не авторизован' };
  }

  // Проверяем роль пользователя
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['owner', 'agent'].includes(profile.role)) {
    return { success: false, message: 'Недостаточно прав для удаления заказа' };
  }

  try {
    // 1. Сначала удаляем все позиции заказа
    const { error: itemsError } = await supabase
      .from('customer_order_items')
      .delete()
      .eq('customer_order_id', orderId);

    if (itemsError) {
      console.error('Error deleting order items:', itemsError);
      return { success: false, message: 'Ошибка при удалении позиций заказа' };
    }

    // 2. Затем удаляем сам заказ
    const { error: orderError } = await supabase
      .from('customer_orders')
      .delete()
      .eq('id', orderId);

    if (orderError) {
      console.error('Error deleting order:', orderError);
      return { success: false, message: 'Ошибка при удалении заказа' };
    }

    revalidatePath('/agent/customer-orders');
    revalidatePath('/warehouse/customer-orders');
    return { success: true, message: 'Заказ успешно удален' };

  } catch (error) {
    console.error('Error in deleteEntireOrder:', error);
    return { success: false, message: 'Произошла ошибка при удалении заказа' };
  }
}
