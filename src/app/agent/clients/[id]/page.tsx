import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import AgentClientDetail from './AgentClientDetail';
import { getClientById } from '@/app/clients/actions';

interface PageProps {
  params: {
    id: string;
  };
}

const Page = async ({ params }: PageProps) => {
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

  // Агент может просматривать и редактировать клиентов
  if (!profile || (profile.role !== 'agent' && profile.role !== 'owner')) {
    return notFound();
  }

  const client = await getClientById(params.id);
  
  if (!client) {
    return notFound();
  }

  // Агент может редактировать клиентов
  const canEdit = true;

  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Детали клиента</h1>
      <AgentClientDetail client={client} canEdit={canEdit} />
    </div>
  );
}
