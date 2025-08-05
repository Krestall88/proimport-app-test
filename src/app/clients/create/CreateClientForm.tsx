'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createClientAction(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login');
  }

  // Проверяем роль пользователя - только owner и agent могут создавать клиентов
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || (profile.role !== 'owner' && profile.role !== 'agent')) {
    return redirect('/clients/create?message=Недостаточно прав для создания клиента');
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
    address: formData.get('address') as string || null,
    delivery_address: formData.get('delivery_address') as string || null,
    payment_terms: formData.get('payment_terms') as string || null,
    contacts: contacts,
    comments: formData.get('comments') as string || null,
    user_id: user.id, // Привязываем клиента к пользователю
  };

  const { error } = await supabase.from('customers').insert([rawFormData]);

  if (error) {
    console.error('Error creating client:', error);
    return redirect('/clients/create?message=Не удалось создать клиента');
  }

  revalidatePath('/agent/clients');
  revalidatePath('/manager/clients');
  redirect('/clients');
}
