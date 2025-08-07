import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import StatusBadge from '../StatusBadge';
import type { CustomerOrder } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('ru-RU');

export default async function AgentDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { count: ordersCount } = await supabase
    .from('customer_orders')
    .select('*', { count: 'exact', head: true })
    .eq('agent_id', user.id);

  const { count: clientsCount } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true });

  const { data: recentOrders, error } = await supabase
    .from('customer_orders')
    .select(`
      id,
      created_at,
      status,
      customers ( name ),
      customer_order_items (
        quantity,
        products (
          title
        )
      )
    `)
    .eq('agent_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching recent orders for agent:', error);
    // Optionally return an error message to the UI
  }

  const orders = recentOrders as CustomerOrder[] || [];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Панель агента</h1>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Всего заказов</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{ordersCount ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Всего клиентов</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{clientsCount ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Последние заказы */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Последние заказы</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length > 0 ? (
            <div className="overflow-x-auto rounded-lg">
              <table className="min-w-full text-left">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="p-4 font-semibold">Дата</th>
                    <th className="p-4 font-semibold">Товары</th>
                    <th className="p-4 font-semibold">Клиент</th>
                    <th className="p-4 font-semibold">Статус</th>
                    <th className="p-4 font-semibold"></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                      <td className="p-4 whitespace-nowrap">{formatDate(order.created_at)}</td>
                      <td className="p-4 font-medium">
                        {order.customer_order_items.length > 0
                          ? order.customer_order_items
                              .map(item => `${item.products?.title ?? 'N/A'} (${item.quantity} шт.)`)
                              .join(', ')
                          : '—'}
                      </td>
                      <td className="p-4">{order.customers?.name ?? 'N/A'}</td>
                      <td className="p-4"><StatusBadge status={order.status} /></td>
                      <td className="p-4">
                        <Link href={`/agent/customer-orders/${order.id}`} className="text-blue-400 hover:underline">Детали</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>У вас пока нет заказов.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
