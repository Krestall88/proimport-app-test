import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCustomers } from './actions';

const ClientsPage = async function (props: any) {
  const { searchParams } = props;
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

  if (!profile || (profile.role !== 'agent' && profile.role !== 'owner')) {
    return notFound();
  }

  const customers = await getCustomers(searchParams.search);

  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Клиенты</h1>
        <Link 
          href="/clients/create" 
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          Добавить клиента
        </Link>
      </div>
      
      <div className="mb-6">
        <form method="GET" className="flex gap-2">
          <input
            type="text"
            name="search"
            placeholder="Поиск по названию..."
            defaultValue={searchParams.search || ''}
            className="flex-1 p-2.5 rounded bg-gray-700 border border-gray-600 placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500"
          />
          <button 
            type="submit" 
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Поиск
          </button>
        </form>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {customers.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-400">Клиенты не найдены</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {customers.map((customer) => (
              <Link 
                key={customer.customer_id} 
                href={`/clients/${customer.customer_id}`}
                className="block p-6 hover:bg-gray-750 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">{customer.name}</h2>
                    <div className="space-y-1 text-sm text-gray-400">
                      {customer.tin && <p>ИНН: {customer.tin}</p>}
                      {customer.kpp && <p>КПП: {customer.kpp}</p>}
                      {customer.contacts?.phone && <p>Телефон: {customer.contacts.phone}</p>}
                      {customer.contacts?.email && <p>Email: {customer.contacts.email}</p>}
                      {customer.delivery_address && <p>Адрес доставки: {customer.delivery_address}</p>}
                      {customer.payment_terms && <p>Условия оплаты: {customer.payment_terms}</p>}
                    </div>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-gray-500">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
