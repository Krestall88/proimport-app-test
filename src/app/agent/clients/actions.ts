'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function addClient(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login');
  }

  // Собираем контактные данные в объект contacts
  const contacts = {
    phone: formData.get('contacts.phone') as string || null,
    email: formData.get('contacts.email') as string || null,
  };

  // Собираем все данные из формы в соответствии со структурой таблицы
  const rawFormData = {
    name: formData.get('name') as string,
    tin: formData.get('tin') as string || null,
    kpp: formData.get('kpp') as string || null,
    delivery_address: formData.get('delivery_address') as string || null,
    payment_terms: formData.get('payment_terms') as string || null,
    comments: formData.get('comments') as string || null,
    contacts: contacts,
    created_by: user.id,
  };

  const { error } = await supabase.from('customers').insert([rawFormData]);

  if (error) {
    console.error('Error adding client:', error);
    return redirect('/agent/clients/create?message=Could not add client');
  }

  revalidatePath('/agent/clients');
  redirect('/agent/clients');
}

/**
 * Обновляет данные клиента для агента
 * @param id - ID клиента
 * @param formData - Данные формы
 * @returns Результат операции
 */
export async function updateClient(id: string, formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: 'Пользователь не авторизован' };
  }

  // Проверяем роль пользователя - агенты и owner могут редактировать клиентов
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || (profile.role !== 'agent' && profile.role !== 'owner')) {
    return { success: false, message: 'Недостаточно прав для редактирования клиента' };
  }

  // Собираем контактные данные в объект contacts
  const contacts = {
    phone: formData.get('contacts.phone') as string || null,
    email: formData.get('contacts.email') as string || null,
  };

  const rawFormData = {
    name: formData.get('name') as string,
    tin: formData.get('tin') as string || null,
    kpp: formData.get('kpp') as string || null,
    delivery_address: formData.get('delivery_address') as string || null,
    payment_terms: formData.get('payment_terms') as string || null,
    comments: formData.get('comments') as string || null,
    contacts: contacts,
  };

  const { error } = await supabase
    .from('customers')
    .update(rawFormData)
    .eq('id', id);

  if (error) {
    console.error('Error updating client:', error);
    return { success: false, message: `Ошибка при обновлении клиента: ${error.message}` };
  }

  revalidatePath(`/agent/clients/${id}`);
  revalidatePath('/agent/clients');
  return { success: true, message: 'Клиент успешно обновлен' };
}

/**
 * Удаляет клиента по ID для агента
 * @param id - ID клиента
 * @returns Результат операции
 */
export async function deleteClient(id: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: 'Пользователь не авторизован' };
  }

  // Проверяем роль пользователя - только owner может удалять клиентов
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || profile.role !== 'owner') {
    return { success: false, message: 'Недостаточно прав для удаления клиента' };
  }

  // Проверяем все возможные связи клиента с заказами и связанными таблицами
  
  // 1. Проверяем активные заказы
  const { data: orders, error: ordersError } = await supabase
    .from('customer_orders')
    .select('id')
    .eq('customer_id', id);

  if (ordersError) {
    console.error('Error checking client orders:', ordersError);
    return { success: false, message: 'Ошибка при проверке заказов клиента' };
  }

  if (orders && orders.length > 0) {
    console.log('Found orders for client:', orders.length, 'orders:', orders.map(o => o.id));
    return { success: false, message: `Невозможно удалить клиента: найдено ${orders.length} заказов` };
  }

  // 2. Проверяем связанные записи в customer_wishlist
  const { data: wishlist, error: wishlistError } = await supabase
    .from('customer_wishlist')
    .select('id')
    .eq('customer_id', id);

  if (wishlistError) {
    console.error('Error checking client wishlist:', wishlistError);
    return { success: false, message: 'Ошибка при проверке хотелок клиента' };
  }

  if (wishlist && wishlist.length > 0) {
    console.log('Found wishlist items for client:', wishlist.length);
    return { success: false, message: `Невозможно удалить клиента: найдено ${wishlist.length} записей в хотелках` };
  }

  // 3. Проверяем связанные записи в других таблицах, если они есть
  const tablesToCheck = [
    { table: 'invoices', foreignKey: 'customer_id', name: 'счетов' },
    { table: 'delivery_notes', foreignKey: 'customer_id', name: 'накладных' }
  ];

  for (const { table, foreignKey, name } of tablesToCheck) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .eq(foreignKey, id);

      if (error) {
        console.warn(`Error checking ${table}:`, error);
        continue; // Продолжаем проверку других таблиц
      }

      if (data && data.length > 0) {
        console.log(`Found ${data.length} ${table} for client`);
        return { success: false, message: `Невозможно удалить клиента: найдено ${data.length} ${name}` };
      }
    } catch (error) {
      console.warn(`Table ${table} might not exist or have different structure:`, error);
    }
  }

  // Удаляем клиента
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting client:', error);
    return { success: false, message: `Ошибка при удалении клиента: ${error.message}` };
  }

  revalidatePath('/agent/clients');
  return { success: true, message: 'Клиент успешно удален' };
}
