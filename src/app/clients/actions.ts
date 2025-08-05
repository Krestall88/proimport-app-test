'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Customer, CustomerInfo } from '@/lib/types';

/**
 * Получает клиентов с возможностью поиска
 * @param searchTerm - Поисковый запрос
 * @returns Список клиентов
 */
export async function getCustomers(searchTerm?: string): Promise<CustomerInfo[]> {
  const supabase = await createClient();

  // Получаем все поля, включая contacts как jsonb
  let query = supabase
    .from('customers')
    .select('id, name, contacts, tin, kpp, delivery_address, payment_terms')
    .order('name', { ascending: true });

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching customers:', error);
    return [];
  }

  return data.map(customer => ({
    customer_id: customer.id,
    name: customer.name,
    contacts: customer.contacts || { phone: null, email: null },
    tin: customer.tin || undefined,
    kpp: customer.kpp || undefined,
    delivery_address: customer.delivery_address || undefined,
    payment_terms: customer.payment_terms || undefined
  }));
}

/**
 * Получает клиента по ID
 * @param id - ID клиента
 * @returns Клиент или null, если не найден
 */
export async function getClientById(id: string): Promise<Customer | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching client:', error);
    return null;
  }

  return data;
}

/**
 * Обновляет данные клиента
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

  // Проверяем роль пользователя - только owner может редактировать клиентов
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || profile.role !== 'owner') {
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

  revalidatePath(`/clients/${id}`);
  revalidatePath('/agent/clients');
  revalidatePath('/manager/clients');
  return { success: true, message: 'Клиент успешно обновлен' };
}

/**
 * Удаляет клиента по ID
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

  // Проверяем, есть ли у клиента заказы
  const { data: orders, error: ordersError } = await supabase
    .from('customer_orders')
    .select('id')
    .eq('customer_id', id);

  if (ordersError) {
    console.error('Error checking client orders:', ordersError);
    return { success: false, message: 'Ошибка при проверке заказов клиента' };
  }

  if (orders && orders.length > 0) {
    return { success: false, message: 'Невозможно удалить клиента, у которого есть заказы' };
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
  revalidatePath('/manager/clients');
  return { success: true, message: 'Клиент успешно удален' };
}
