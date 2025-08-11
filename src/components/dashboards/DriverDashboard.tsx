import Link from 'next/link';
import type { ManagerOrderItem } from '@/lib/types'; // Используем унифицированный тип

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('ru-RU');

interface ShippedOrdersListProps {
  orders: ManagerOrderItem[];
}

function ShippedOrdersList({ orders }: ShippedOrdersListProps) {
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
                <th className="p-4 font-semibold">Действие</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.purchase_order_id} className="border-b border-gray-700 hover:bg-gray-700/50">
                  <td className="p-4 whitespace-nowrap">{formatDate(order.created_at)}</td>
                  <td className="p-4 font-medium">
                    {`${order.product.title} (${order.available_quantity} шт.)`}
                  </td>
                  <td className="p-4">{order.customer_name}</td>
                  <td className="p-4">
                    <Link href={`/agent/customer-orders/${order.purchase_order_id}`} className="text-blue-400 hover:underline">
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

interface DriverDashboardProps {
  shippedOrders: ManagerOrderItem[];
}

export default function DriverDashboard({ shippedOrders }: DriverDashboardProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Панель водителя</h2>
      <ShippedOrdersList orders={shippedOrders} />
    </div>
  );
}
