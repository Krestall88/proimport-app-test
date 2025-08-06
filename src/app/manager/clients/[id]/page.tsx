import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import ClientDetail from './ClientDetail';
import { getClientById } from '@/app/clients/actions';

export default async function (props: any) {
  const { params } = props;
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

  if (!profile || profile.role !== 'owner') {
    return notFound();
  }

  const client = await getClientById(params.id);
  
  if (!client) {
    return notFound();
  }

  // Руководитель может редактировать и удалять клиентов
  const canEdit = true;

  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Детали клиента</h1>
      <ClientDetail client={client} canEdit={canEdit} />
    </div>
  );
}
