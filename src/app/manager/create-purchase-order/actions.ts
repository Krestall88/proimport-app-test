"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

import type { Product } from '@/lib/types';

import type { CartItem } from '@/lib/types'; // глобальный формат корзины

export async function createProductFromWishlist(product: {
  nomenclature_code: string;
  title: string;
  purchase_price?: number | null;
  unit?: string | null;
  category?: string | null;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .insert([{ ...product }])
    .select()
    .single();
  if (error) {
    return { error };
  }
  return { product: data };
}

export async function createPurchaseOrder(supplierId: string, cartItems: CartItem[], expectedDeliveryDate?: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: { message: 'Пользователь не авторизован' } };
  }

  // 1. Create the purchase order
  const { data: poData, error: poError } = await supabase
    .from('purchase_orders')
    .insert({
      supplier_id: supplierId,
      created_by: user.id,
      status: 'pending',
      expected_delivery_date: expectedDeliveryDate || null,
    })
    .select('id')
    .single();

  if (poError) {
    console.error('Error creating purchase order:', poError);
    return { error: { message: 'Не удалось создать заказ на поставку' } };
  }

  const purchaseOrderId = poData.id;

  // 2. Prepare purchase order items
  const orderItems = cartItems.map(item => ({
    purchase_order_id: purchaseOrderId,
    product_id: item.product.id,
    quantity_ordered: item.qty,
    price_per_unit: item.product.purchase_price ?? 0,
  }));

  // 3. Insert purchase order items
  const { error: itemsError } = await supabase
    .from('purchase_order_items')
    .insert(orderItems);

  if (itemsError) {
    console.error('Error inserting purchase order items:', itemsError);
    // Optional: Attempt to delete the created purchase order to avoid orphans
    await supabase.from('purchase_orders').delete().eq('id', purchaseOrderId);
    return { error: { message: 'Не удалось добавить товары в заказ' } };
  }

  revalidatePath('/manager/create-purchase-order');
  return { success: true, purchaseOrderId };
}
