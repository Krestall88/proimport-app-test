'use server';

'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function deleteOrderItems(orderItemIds: string[]) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('customer_order_items')
    .delete()
    .in('id', orderItemIds);

  if (error) {
    console.error('Error deleting order items:', error);
    return { success: false, message: 'Ошибка при удалении позиций заказа.' };
  }

  revalidatePath('/manager');
  return { success: true, message: 'Выбранные позиции успешно удалены.' };
}

export async function deleteOrderItem(orderItemId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('customer_order_items')
    .delete()
    .eq('id', orderItemId);

  if (error) {
    console.error('Error deleting order item:', error);
    return { success: false, message: 'Ошибка при удалении позиции заказа.' };
  }

  revalidatePath('/manager');
  return { success: true, message: 'Позиция успешно удалена.' };
}

// export async function forceDeleteOrderItem(orderItemId: string) {
//   const supabase = await createClient();
// 
//   // TODO: Найти и использовать новую RPC-функцию для безопасного удаления позиции заказа
//   const { error } = await supabase.rpc('force_delete_order_item', {
//     p_order_item_id: orderItemId
//   });
// 
//   if (error) {
//     console.error('Error force deleting order item:', error);
//     return { success: false, message: 'Ошибка при принудительном удалении позиции заказа.' };
//   }
// 
//   revalidatePath('/manager/orders');
//   revalidatePath('/manager');
//   return { success: true, message: 'Позиция принудительно удалена.' };
// }

// export async function forceDeleteOrderItems(orderItemIds: string[]) {
//   const supabase = await createClient();
// 
//   // TODO: Найти и использовать новую RPC-функцию для безопасного удаления позиций заказа
//   const { error } = await supabase.rpc('force_delete_order_items', {
//     p_order_item_ids: orderItemIds
//   });
// 
//   if (error) {
//     console.error('Error force deleting order items:', error);
//     return { success: false, message: 'Ошибка при принудительном удалении позиций заказа.' };
//   }
// 
//   revalidatePath('/manager/orders');
//   revalidatePath('/manager');
//   return { success: true, message: 'Выбранные позиции принудительно удалены.' };
// }

// Defines the unique key for a group of inventory items as seen in the manager view.
export type InventoryGroupKey = {
  productId: string;
  batchNumber: string | null;
  expiryDate: string | null;
};

async function deleteInventoryGroup(supabase: any, group: InventoryGroupKey) {
  // Using an RPC function is the safest way to perform multiple operations atomically.
  // This function should handle unlinking from customer_order_items and then deleting.
  const { error } = await supabase.rpc('delete_inventory_group_and_unlink_orders', {
    p_product_id: group.productId,
    p_batch_number: group.batchNumber,
    p_expiry_date: group.expiryDate
  });

  return error;
}

export async function deleteInventoryRecord(group: InventoryGroupKey) {
  const supabase = await createClient();
  const error = await deleteInventoryGroup(supabase, group);

  if (error) {
    console.error('Error deleting inventory record:', error);
    return { success: false, message: 'Ошибка при удалении записи об остатках.' };
  }

  revalidatePath('/manager/inventory');
  return { success: true, message: 'Запись успешно удалена.' };
}

export async function deleteInventoryRecords(groups: InventoryGroupKey[]) {
  const supabase = await createClient();
  
  // Using Promise.all to run deletions in parallel for efficiency
  const deletePromises = groups.map(group => deleteInventoryGroup(supabase, group));
  const results = await Promise.all(deletePromises);

  const firstError = results.find(error => error !== null);

  if (firstError) {
    console.error('Error deleting inventory records:', firstError);
    return { success: false, message: `Ошибка при удалении записей: ${firstError.message}` };
  }

  revalidatePath('/manager/inventory');
  return { success: true, message: 'Выбранные записи успешно удалены.' };
}

export async function deleteProducts(productIds: string[]) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('products')
    .delete()
    .in('id', productIds);

  if (error) {
    console.error('Error deleting products:', error);
    return { success: false, message: 'Ошибка при удалении товаров.' };
  }

  revalidatePath('/manager'); // Revalidate the main manager page or a specific products page if it exists
  return { success: true, message: 'Выбранные товары успешно удалены.' };
}

export async function deleteProduct(productId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) {
    console.error('Error deleting product:', error);
    return { success: false, message: 'Ошибка при удалении товара.' };
  }

  revalidatePath('/manager');
  return { success: true, message: 'Товар успешно удален.' };
}


