'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { PurchaseOrderStatus } from '@/lib/types';

export async function updatePurchaseOrderStatus(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'owner' && profile?.role !== 'warehouse_manager') {
    return redirect(`/purchase-orders?message=У вас нет прав для изменения статуса.&type=error`)
  }

  const orderId = formData.get('orderId') as string;
  const newStatus = formData.get('status') as PurchaseOrderStatus;
  const actualQtyStr = formData.get('actualQuantity') as string | null;
  const comment = formData.get('comment') as string | null;

  if (!orderId || !newStatus) {
    return redirect(`/purchase-orders/${orderId}?message=Ошибка: ID заказа или статус не указаны.&type=error`)
  }

  // If the order is received, validate quantity and update inventory
  if (newStatus === 'received') {
    if (!actualQtyStr) {
      return redirect(`/purchase-orders/${orderId}?message=Укажите фактически полученное количество.&type=error`);
    }
    const actualQuantity = Number(actualQtyStr);
    if (isNaN(actualQuantity) || actualQuantity <= 0) {
      return redirect(`/purchase-orders/${orderId}?message=Некорректное фактическое количество.&type=error`);
    }
    const { data: order, error: orderError } = await supabase
      .from('purchase_orders')
      .select('id, items:purchase_order_items(*, product:products(*))')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Error fetching purchase order for inventory update:', orderError);
      return redirect(`/purchase-orders/${orderId}?message=Не удалось найти заказ для обновления инвентаря.&type=error`);
    }

    const goodsReceiptItems = order.items.map(item => ({
      goods_receipt_id: 'goods_receipt_id', // Replace with actual goods receipt ID
      purchase_order_item_id: item.id,
      product_id: item.product_id,
      quantity_received: Number(item.quantity), // Всегда число, без null
      batch_number: `BATCH-${Date.now()}`,
      expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
      status: 'received',
      price_per_unit: item.product.purchase_price ?? null
    }));

    // Insert items into goods_receipt_items
    const { error: itemsError } = await supabase
      .from('goods_receipt_items')
      .insert(goodsReceiptItems);

    if (itemsError) {
      console.error('Error inserting goods receipt items:', itemsError);
      return redirect(`/purchase-orders/${orderId}?message=Не удалось создать записи о приемке товара.&type=error`);
    }

    const { error: rpcError } = await supabase.rpc('upsert_inventory_on_receipt', {
      p_product_id: order.items[0].product_id,
      p_quantity_to_add: actualQuantity,
    });

    if (rpcError) {
      console.error('Error updating inventory:', rpcError);
      return redirect(`/purchase-orders/${orderId}?message=Не удалось обновить инвентарь.&type=error`);
    }
    // Optionally store comment / discrepancy (future improvement)
  }

  const updateFields: any = { status: newStatus };
  if (newStatus === 'received') {
    updateFields.actual_quantity = Number(actualQtyStr);
    if (comment) updateFields.receiving_comment = comment;
  }

  const { error } = await supabase
    .from('purchase_orders')
    .update(updateFields)
    .eq('id', orderId);

  if (error) {
    console.error('Error updating purchase order status:', error)
    return redirect(`/purchase-orders/${orderId}?message=Не удалось обновить статус заказа.&type=error`)
  }

  revalidatePath(`/purchase-orders/${orderId}`);
  revalidatePath('/purchase-orders');
  revalidatePath('/inventory');

  redirect(`/purchase-orders/${orderId}?message=Статус заказа успешно обновлен.&type=success`)
}
