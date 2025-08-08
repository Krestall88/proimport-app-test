'use server';

import { createClient } from '../../../lib/supabase/server';

// Запрос для руководителя - должен видеть все заказы
// и иметь доступ к закупочным ценам
export async function getManagerCustomerOrders() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('customer_orders')
    .select(`
      id,
      created_at,
      status,
      customer:customers(name),
      customer_order_items!inner(
        id,
        quantity,
        price_per_unit,
        product:products(id, nomenclature_code, title, description),
        inventory_items!inner(
          goods_receipt_items!inner(purchase_price)
        )
      ),
      agent:profiles(full_name)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching manager orders:', error);
    return [];
  }

  // Трансформируем данные, чтобы закупочная цена была на том же уровне, что и остальные поля
    // Определяем тип для элемента заказа для большей безопасности
  type OrderItem = {
    id: string;
    quantity: number;
    price_per_unit: number | null;
    inventory_items: {
      goods_receipt_items: {
        purchase_price: number | null;
      }[];
    }[];
  };

  const transformedData = data.map(order => ({
    ...order,
    customer_order_items: order.customer_order_items.map((item: any) => ({
      id: item.id,
      quantity: item.quantity,
      price_per_unit: item.price_per_unit,
      purchase_price: item.inventory_items[0]?.goods_receipt_items[0]?.purchase_price || 0,
      product: item.product
        ? {
            id: item.product.id,
            nomenclature_code: item.product.nomenclature_code,
            title: item.product.title,
            description: item.product.description ?? '',
          }
        : null // TODO: если product_id отсутствует или не найден, обработать кейс
    })),
  }));

  return transformedData || [];
}

import { revalidatePath } from 'next/cache';

export async function deleteOrders(orderIds: string[]) {
  const supabase = await createClient();

  // 1. Delete associated order items first to avoid foreign key violations
  const { error: itemsError } = await supabase
    .from('customer_order_items')
    .delete()
    .in('customer_order_id', orderIds);

  if (itemsError) {
    console.error('Error deleting order items:', itemsError);
    return { success: false, error: 'Не удалось удалить позиции заказа.' };
  }

  // 2. Delete the orders themselves
  const { error: ordersError } = await supabase
    .from('customer_orders')
    .delete()
    .in('id', orderIds);

  if (ordersError) {
    console.error('Error deleting orders:', ordersError);
    return { success: false, error: 'Не удалось удалить заказы.' };
  }

  // 3. Revalidate the path to refresh the data on the page
  revalidatePath('/manager/customer-orders');

  return { success: true };
}
