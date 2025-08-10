import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';


const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU');
};

export default async function WarehouseManagerDashboard() {
  const supabase = await createClient();
  // fetch counts for quick nav badges
  const [{ count: receivingCount }, { count: inventoryCount }] = await Promise.all([
    supabase.from('purchase_orders').select('id', { count: 'exact', head: true }).in('status', ['ordered', 'in_transit']),
    supabase.from('inventory').select('id', { count: 'exact', head: true }),
  ] as const);

  const { data: orders, error } = await supabase
    .from('customer_orders')
    .select(`
      id,
      created_at,
      status,
      customer:customers (name),
      customer_order_items(quantity, product:products(title))
    `)
    .in('status', ['new', 'picking', 'ready_for_shipment'])
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    return <p>Не удалось загрузить заказы.</p>;
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Панель менеджера склада</h2>

        {/* Quick nav */}
        <div className="flex flex-wrap gap-4 mt-4">
          <Link href="/inventory" className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded">
            Инвентарь {typeof inventoryCount === 'number' && <span className="text-sm text-gray-400">({inventoryCount})</span>}
          </Link>
          <Link href="/warehouse/receiving" className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded">
            Приёмка {typeof receivingCount === 'number' && <span className="text-sm text-gray-400">({receivingCount})</span>}
          </Link>
        </div>

        {/* Заказы клиентов */}
      
      <h3 className="text-xl font-semibold mb-4">Заказы ({orders.length})</h3>
      
      {orders.length === 0 ? (
        <p className="text-gray-400">Нет заказов.</p>
      ) : (
        <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
            <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-700">
                    <tr>
                        <th className="p-4">Номер заказа</th>
                        <th className="p-4">Дата</th>
                        <th className="p-4">Товары</th>
                        <th className="p-4">Клиент</th>
                        <th className="p-4">Статус</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order.id}>
                          <td className="p-4">
                            <Link href={`/warehouse/customer-orders/${order.id}`} className="text-blue-400 hover:underline">
                              {order.id.slice(0, 8)}...
                            </Link>
                          </td>
                          <td className="p-4">{formatDate(order.created_at)}</td>
                          <td className="p-4 font-medium">
                            {order.customer_order_items.map(item => `${item.product.title} (${item.quantity} шт.)`).join(', ')}
                          </td>
                          <td className="p-4">{order.customer?.name ?? 'N/A'}</td>
                          <td className="p-4">
                            {/* <StatusBadge status={order.status} /> */}
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
