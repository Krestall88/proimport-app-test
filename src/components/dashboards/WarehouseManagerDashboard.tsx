import Link from 'next/link';
import type { ManagerOrderItem } from '@/lib/types';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU');
};

interface WarehouseManagerDashboardProps {
  orders: ManagerOrderItem[];
  receivingCount: number;
  inventoryCount: number;
}

export default function WarehouseManagerDashboard({
  orders,
  receivingCount,
  inventoryCount,
}: WarehouseManagerDashboardProps) {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Панель менеджера склада</h2>

      {/* Quick nav */}
      <div className="flex flex-wrap gap-4 mt-4">
        <Link href="/inventory" className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded">
          Инвентарь <span className="text-sm text-gray-400">({inventoryCount})</span>
        </Link>
        <Link href="/warehouse/receiving" className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded">
          Приёмка <span className="text-sm text-gray-400">({receivingCount})</span>
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
                <tr key={order.purchase_order_id}>
                  <td className="p-4">
                    <Link href={`/warehouse/customer-orders/${order.purchase_order_id}`} className="text-blue-400 hover:underline">
                      {order.purchase_order_id.slice(0, 8)}...
                    </Link>
                  </td>
                  <td className="p-4">{formatDate(order.created_at)}</td>
                  <td className="p-4 font-medium">
                    {`${order.product.title} (${order.available_quantity} шт.)`}
                  </td>
                  <td className="p-4">{order.customer_name}</td>
                  <td className="p-4">{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
