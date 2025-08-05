import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

// Импортируем все компоненты панелей управления
import OwnerDashboard from '@/components/dashboards/OwnerDashboard';
import AgentDashboard from '@/components/dashboards/AgentDashboard';
import AccountantDashboard from '@/components/dashboards/AccountantDashboard';
import WarehouseManagerDashboard from '@/components/dashboards/WarehouseManagerDashboard';
import DriverDashboard from '@/components/dashboards/DriverDashboard';

export default async function Home() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  // В зависимости от роли пользователя отображаем соответствующую панель
  switch (profile?.role) {
    case 'owner':
      return <OwnerDashboard />;
    case 'agent':
      return <AgentDashboard />;
    case 'accountant':
      return <AccountantDashboard />;
    case 'warehouse_manager':
      return <WarehouseManagerDashboard />;
    case 'driver':
      return <DriverDashboard />;
    default:
      // Запасной вариант для пользователей без роли или с неизвестной ролью
      return (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-2xl font-bold">Добро пожаловать!</h1>
          <p className="text-gray-400 mt-2">Ваша роль не определена. Обратитесь к администратору.</p>
        </div>
      );
  }
}
