"use server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Создание новой поставки и добавление позиций из корзины руководителя
export async function createManagerPurchaseOrder(cart: any[]) {
  const supabase = createClient();
  try {
    // 1. Создать новую поставку
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Нет доступа");
    const { data: order, error: orderError } = await supabase.from('purchase_orders').insert({
      id: crypto.randomUUID(),
      created_by: user.id,
      created_at: new Date().toISOString(),
      status: 'new',
    }).select().single();
    if (orderError) throw new Error(orderError.message);

    // 2. Для каждой позиции: создать товар (products) при необходимости, затем добавить в purchase_order_items
    for (const item of cart) {
      // Проверяем, есть ли такой товар
      let productId: string | undefined = undefined;
      const { data: existing } = await supabase.from('products').select('id').eq('title', item.name).single();
      if (existing) {
        productId = existing.id;
      } else {
        // Создаём новый товар
        const { data: newProduct, error: prodError } = await supabase.from('products').insert({
          id: crypto.randomUUID(),
          title: item.name,
          unit: item.unit,
          category: item.category,
          purchase_price: item.purchase_price,
          selling_price: item.selling_price,
          comment: item.comment ?? '',
          created_at: new Date().toISOString(),
        }).select().single();
        if (prodError) throw new Error(prodError.message);
        productId = newProduct.id;
      }
      // Добавляем позицию в поставку
      const { error: itemError } = await supabase.from('purchase_order_items').insert({
        id: crypto.randomUUID(),
        purchase_order_id: order.id,
        product_id: productId,
        quantity_ordered: item.qty,
        price_per_unit: item.purchase_price,
      });
      if (itemError) throw new Error(itemError.message);
      // Обновляем статус wishlist (если нужно)
      await supabase.from('customer_wishlist').update({ status: 'included' }).eq('name', item.name).eq('qty', item.qty);
    }
    return order.id;
  } catch (e: any) {
    throw new Error(e.message || "Ошибка создания поставки");
  }
}
