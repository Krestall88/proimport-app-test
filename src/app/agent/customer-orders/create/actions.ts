'use server'

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import { Database } from '@/lib/database.types';

export async function createCustomerOrders(data: { customerId: string; cart: any[]; wishlist: any[] }): Promise<{ success: boolean; message: string; orderId?: string; }> {
  'use server';
  console.log('--- SERVER ACTION: createCustomerOrders ---');
  console.log('Received data:', JSON.stringify(data, null, 2));

  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, message: 'Пользователь не авторизован.' };
    }

    const { customerId, cart, wishlist } = data;

    if (!customerId || !cart) {
      return { success: false, message: 'Отсутствует клиент или корзина.' };
    }

    if (cart.length === 0) {
      return { success: false, message: 'Корзина не может быть пустой.' };
    }

    // 1. Вставка заказа с указанием agent_id
    const { data: order, error: orderError } = await supabase.from('customer_orders').insert([{
      customer_id: customerId,
      agent_id: user.id,
      created_by: user.id,
      status: 'new',
      priority: false,
      // created_at будет установлен автоматически
    }] as Database['public']['Tables']['customer_orders']['Insert'][]).select().single();

    if (orderError) {
      console.error('Ошибка создания заказа:', orderError);
      return { success: false, message: `Ошибка базы данных: ${orderError.message}` };
    }

    if (!order) {
        return { success: false, message: 'Не удалось создать заказ.' };
    }

    // 2. Вставка позиций заказа
    const processedItems = [];
    for (const item of cart) {
      let productId = item.product_id;

      // Если это новый товар, создаем его
      if (!productId) {
        const { data: newProduct, error: newProductError } = await supabase
          .from('products')
          .insert([{
            title: item.product_name || 'Новый товар',
            description: 'Новый товар, добавленный через заказ',
            unit: 'шт',
            // Другие обязательные поля, если есть
          }] as Database['public']['Tables']['products']['Insert'][])
          .select('id')
          .single();

        if (newProductError || !newProduct) {
          console.error('Ошибка создания нового товара:', newProductError);
          throw new Error('Не удалось создать новый товар в базе данных.');
        }
        productId = newProduct.id;
      }

      // Передаем правильную цену
      const pricePerUnit = (item.final_price !== undefined && !isNaN(item.final_price)) ? item.final_price : 0;
      processedItems.push({
        product_id: productId,
        qty: item.qty,
        price_per_unit: pricePerUnit,
      });
    }

    const items = processedItems;
    console.log('DEBUG: Processed items for insertion:', items);

    const { insertCustomerOrderItemsWithBatch } = await import('@/lib/actions/warehouse');
    await insertCustomerOrderItemsWithBatch(order.id, items);

    // 3. Ревалидация путей
    revalidatePath('/');
    revalidatePath('/agent/customer-orders');
    revalidatePath('/manager/customer-orders');
    revalidatePath('/warehouse/customer-orders');

    let wishlistMessage = '';
    if (wishlist && wishlist.length > 0) {
      const wishlistItems = wishlist.map((item: any) => ({
        name: item.name,
        qty: item.qty,
        unit: item.unit || null,
        category: item.category || null,
        comment: item.comment || null
      }));

      const { error: wishlistError } = await supabase.from('customer_wishlist').insert([{
        customer_id: customerId,
        agent_id: user.id,
        wishlist_items: wishlistItems,
        // created_at и updated_at будут установлены автоматически
      }] as Database['public']['Tables']['customer_wishlist']['Insert'][]);

      if (wishlistError) {
        console.error('Ошибка создания хотелок:', wishlistError);
        wishlistMessage = ' Заказ создан, но произошла ошибка при добавлении хотелок.';
      } else {
        wishlistMessage = ' и хотелки успешно добавлены!';
        revalidatePath('/agent/customer-wishlist');
      }
    }

    return { success: true, message: `Заказ успешно создан!${wishlistMessage}`, orderId: order.id };

  } catch (e: any) {
    console.error('Критическая ошибка создания заказа:', e);
    return { success: false, message: `Критическая ошибка: ${e.message}` };
  }
}

export async function createCustomerWishlist(formData: FormData): Promise<{ success: boolean; message: string }> {
  'use server';
  const supabase = await createClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'Пользователь не авторизован.' };

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (!profile?.role || !['agent', 'owner'].includes(profile.role)) return { success: false, message: 'У вас нет прав для этого действия.' };

    const customerId = formData.get('customer') as string;
    const wishlistJson = formData.get('wishlist') as string;
    if (!customerId || !wishlistJson) {
      return { success: false, message: 'Необходимо выбрать клиента и добавить товары в хотелки.' };
    }

    const wishlist: { name: string, qty: number, unit?: string, category?: string, comment?: string }[] = JSON.parse(wishlistJson);
    if (wishlist.length === 0) {
      return { success: false, message: 'Хотелки не могут быть пустыми.' };
    }

    const { error } = await supabase.from('customer_wishlist').insert({
      customer_id: customerId,
      agent_id: user.id,
      wishlist_items: wishlist,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Supabase insert error:', error);
      return { success: false, message: `Ошибка базы данных: ${error.message}` };
    }

    revalidatePath('/');
    revalidatePath('/agent/customer-orders');
    revalidatePath('/agent/customer-wishlist');

    return { success: true, message: 'Хотелки успешно отправлены!' };

  } catch (e: any) {
    console.error('Create wishlist server action error:', e);
    return { success: false, message: `Критическая ошибка: ${e.message}` };
  }
}
