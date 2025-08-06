'use server';

import { createClient } from '@/lib/supabase/server';

interface SupplierInfo {
  id: string;
  name: string;
  tin?: string;
  kpp?: string;
  contacts?: { phone?: string; email?: string };
  delivery_address?: string;
  payment_terms?: string;
}

export async function createSupplier(formData: FormData) {
  const supabase = await createClient();
  // Собираем контактные данные
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
    contacts,
  };
  const { error } = await supabase.from('suppliers').insert([rawFormData]);
  if (error) {
    return { success: false, message: `Ошибка при добавлении поставщика: ${error.message}` };
  }
  return { success: true, message: 'Поставщик успешно добавлен' };
}

export async function updateSupplier(id: string, formData: FormData) {
  const supabase = await createClient();
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
    contacts,
  };
  const { error } = await supabase.from('suppliers').update(rawFormData).eq('id', id);
  if (error) {
    return { success: false, message: `Ошибка при обновлении поставщика: ${error.message}` };
  }
  return { success: true, message: 'Поставщик успешно обновлён' };
}

export async function deleteSupplier(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('suppliers').delete().eq('id', id);
  if (error) {
    return { success: false, message: `Ошибка при удалении поставщика: ${error.message}` };
  }
  return { success: true, message: 'Поставщик успешно удалён' };
}

export async function getSuppliers(searchTerm?: string): Promise<SupplierInfo[]> {
  const supabase = createClient();
  let query = supabase
    .from('suppliers')
    .select('id, name, contacts, tin, kpp, delivery_address, payment_terms')
    .order('name', { ascending: true });

  if (searchTerm) {
    query = query.ilike('name', `%${searchTerm}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Ошибка загрузки поставщиков:', error);
    return [];
  }

  return (data || []).map((supplier: any) => ({
    id: supplier.id,
    name: supplier.name,
    contacts: supplier.contacts || { phone: undefined, email: undefined },
    tin: supplier.tin || undefined,
    kpp: supplier.kpp || undefined,
    delivery_address: supplier.delivery_address || undefined,
    payment_terms: supplier.payment_terms || undefined,
  }));
}
