import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import ClientDetail from './ClientDetail';
import { getClientById } from '@/app/clients/actions';

export default async function(props) {
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

  const client = await getClientById(params.id);
  
  if (!client) {
    return notFound();
  }

  // Только owner может редактировать и удалять клиентов
  const canEdit = profile?.role === 'owner';

  return <ClientDetail client={client} canEdit={canEdit} />;
}
