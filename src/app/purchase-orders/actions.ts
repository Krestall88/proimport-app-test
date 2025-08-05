'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPurchaseOrder(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'owner') {
    return redirect('/purchase-orders/create?message=У вас нет прав для выполнения этого действия.&type=error');
  }

  const orderType = formData.get('orderType');
  let productId: string | null = null;

  // --- Этап 1: Определяем или создаем продукт ---
  if (orderType === 'new') {
    const newProductData = {
      title: formData.get('new_product_title') as string,
      nomenclature_code: formData.get('new_product_sku') as string,
      description: formData.get('new_product_description') as string || null,
      unit: formData.get('new_product_unit') as string || null,
      category: formData.get('new_product_category') as string || null,
      purchase_price: Number(formData.get('new_product_purchase_price')) || null,
    };

    if (!newProductData.title || !newProductData.nomenclature_code) {
      return redirect('/purchase-orders/create?message=Название и артикул для нового товара обязательны.&type=error');
    }

    const { data: newProduct, error: newProductError } = await supabase
      .from('products')
      .insert(newProductData)
      .select('id')
      .single();

    if (newProductError) {
      console.error('Error creating new product:', newProductError);
      return redirect(`/purchase-orders/create?message=Не удалось создать новый товар: ${newProductError.message}&type=error`);
    }
    productId = newProduct.id;

  } else {
    productId = formData.get('product_id') as string;
  }

  const orderDetails = {
    supplier_id: formData.get('supplier_id') as string,
    quantity: Number(formData.get('quantity')),
    price_per_unit: Number(formData.get('price_per_unit')),
  };

  if (!productId || !orderDetails.supplier_id || !orderDetails.quantity || !orderDetails.price_per_unit) {
    return redirect('/purchase-orders/create?message=Все поля заказа обязательны для заполнения.&type=error');
  }

  // --- Этап 2: Создаем основной заказ на закупку ---
  const { data: purchaseOrder, error: poError } = await supabase
    .from('purchase_orders')
    .insert({ supplier_id: orderDetails.supplier_id, created_by: user.id, status: 'pending' })
    .select('id')
    .single();

  if (poError || !purchaseOrder) {
    console.error('Error creating purchase order:', poError);
    return redirect('/purchase-orders/create?message=Не удалось создать закупочный заказ.&type=error');
  }

  // --- Этап 3: Добавляем товар в созданный заказ ---
  const { error: itemError } = await supabase.from('purchase_order_items').insert({
    purchase_order_id: purchaseOrder.id,
    product_id: productId,
    quantity_ordered: orderDetails.quantity,
    price_per_unit: orderDetails.price_per_unit,
  });

  if (itemError) {
    console.error('Error adding item to purchase order:', itemError);
    // TODO: Удалить созданный purchase_order, чтобы не было "висячих" заказов
    return redirect('/purchase-orders/create?message=Не удалось добавить товар в заказ.&type=error');
  }

  revalidatePath('/purchase-orders');
  redirect('/purchase-orders?message=Закупочный заказ успешно создан.&type=success');
}

export async function deletePurchaseOrder(orderId: string) {
  const supabase = await createClient();

  // Сначала удаляем связанные элементы, чтобы избежать ошибок внешнего ключа
  const { error: itemsError } = await supabase
    .from('purchase_order_items')
    .delete()
    .eq('purchase_order_id', orderId);

  if (itemsError) {
    console.error('Error deleting purchase order items:', itemsError);
    return { success: false, message: `Ошибка при удалении позиций заказа: ${itemsError.message}` };
  }

  // Затем удаляем сам заказ
  const { error: orderError } = await supabase
    .from('purchase_orders')
    .delete()
    .eq('id', orderId);

  if (orderError) {
    console.error('Error deleting purchase order:', orderError);
    return { success: false, message: `Ошибка при удалении заказа: ${orderError.message}` };
  }

  revalidatePath('/purchase-orders');
  return { success: true, message: 'Заявка на поставку успешно удалена.' };
}

/**
 * Deletes a single purchase order item by its ID.
 * This function should only be callable by warehouse managers (owners).
 */
export async function deletePurchaseOrderItem(itemId: string) {
  const supabase = await createClient();

  // Delete the purchase order item
  const { error } = await supabase
    .from('purchase_order_items')
    .delete()
    .eq('id', itemId);

  if (error) {
    console.error('Error deleting purchase order item:', error);
    return { success: false, message: `Ошибка при удалении позиции заказа: ${error.message}` };
  }

  revalidatePath('/warehouse/pending-shipments');
  return { success: true, message: 'Позиция заказа успешно удалена.' };
}
