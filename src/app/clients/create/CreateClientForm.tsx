'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import React from 'react';

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
    created_by: user.id,
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

export function CreateClientForm() {
  return (
    <form action={createClientAction} className="space-y-4">
      <input name="name" placeholder="Имя клиента" required className="input" />
      <input name="tin" placeholder="ИНН" className="input" />
      <input name="kpp" placeholder="КПП" className="input" />
      <input name="address" placeholder="Юридический адрес" className="input" />
      <input name="delivery_address" placeholder="Адрес доставки" className="input" />
      <input name="payment_terms" placeholder="Условия оплаты" className="input" />
      <input name="contacts.phone" placeholder="Телефон" className="input" />
      <input name="contacts.email" placeholder="Email" className="input" />
      <textarea name="comments" placeholder="Комментарий" className="input" />
      <button type="submit" className="btn btn-primary">Создать клиента</button>
    </form>
  );
}
