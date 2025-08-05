import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { OrderWithCustomerDetails } from '@/lib/types';

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('ru-RU');

async function ShippedOrdersList() {
  const supabase = createClient();

  const { data: orders, error } = await supabase
    .from('customer_orders')
    .select(`
      id,
      created_at,
      status,
      customer:customers (name, address),
      customer_order_items(quantity, product:products(title))
    `)
    .eq('status', 'shipped');

  if (error) {
    console.error('Error fetching shipped orders:', error);
    return <p className="text-red-400">Не удалось загрузить заказы для доставки.</p>;
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Заказы к доставке ({orders.length})</h3>
      {orders.length === 0 ? (
        <p className="text-gray-400">Нет заказов, готовых к доставке.</p>
      ) : (
        <div className="overflow-x-auto bg-gray-800 rounded-lg">
          <table className="min-w-full text-left">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="p-4 font-semibold">Дата</th>
                <th className="p-4 font-semibold">Товар</th>
                <th className="p-4 font-semibold">Клиент</th>
                <th className="p-4 font-semibold">Адрес</th>
                <th className="p-4 font-semibold">Действие</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                  <td className="p-4 whitespace-nowrap">{formatDate(order.created_at)}</td>
                  <td className="p-4 font-medium">
                    {order.customer_order_items.map(item => `${item.product.title} (${item.quantity} шт.)`).join(', ')}
                  </td>
                  <td className="p-4">{order.customer?.[0]?.name ?? 'N/A'}</td>
                  <td className="p-4">{order.customer?.[0]?.address ?? 'N/A'}</td>
                  <td className="p-4">
                    <Link href={`/customer-orders/${order.id}`} className="text-blue-400 hover:underline">
                      Посмотреть
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function DriverDashboard() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Панель водителя</h2>
      <ShippedOrdersList />
    </div>
  );
}
