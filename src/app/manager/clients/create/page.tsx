import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import CreateClientForm from '@/app/clients/create/CreateClientForm';

export default async function ManagerCreateClientPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return notFound();
  }

  // Проверяем роль пользователя - только owner может создавать клиентов в панели руководителя
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'owner') {
    return notFound();
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Создание нового клиента</h1>
      <CreateClientForm />
    </div>
  );
}
