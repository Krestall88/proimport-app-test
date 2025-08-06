import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import ClientsPageClient from './page-client';
import { Customer } from '@/lib/types';



export default async function ClientsPage() {

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return notFound();
  }

  // Получаем профиль пользователя для проверки роли
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const { data: customers, error } = await supabase
    .from('customers')
    .select('*')
    .order('name', { ascending: true })
    .returns<Customer[]>();

  if (error) {
    console.error('Error fetching customers:', error);
    return <p className="text-red-500">Не удалось загрузить список клиентов.</p>;
  }

  // Только owner может удалять клиентов
  const canDelete = profile?.role === 'owner';

  return <ClientsPageClient customers={customers || []} canDelete={canDelete} />;
}
