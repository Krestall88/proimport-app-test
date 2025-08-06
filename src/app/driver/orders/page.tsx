import React from 'react';
import { getDriverOrders } from '@/lib/actions/driver-orders';
import { confirmShippedAction } from './confirm-shipped-action';

export default async function DriverOrdersPage() {
  // Получаем список заказов для водителя (только ready_for_shipment)
  const orders = await getDriverOrders();

  return (
    <main className="main-content flex-1 p-6 md:p-10 bg-background min-h-screen">
      <div className="w-full">
        
        <div className="w-full overflow-x-auto rounded-lg shadow bg-card">
          <table className="w-full min-w-[900px] divide-y divide-gray-700">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Клиент</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Телефон</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Адрес</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Дата создания</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Статус</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Товаров</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-accent transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">{order.customer_name}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{order.customer_phone}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{order.customer_address}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{order.created_at}</td>
                  <td className="px-4 py-3 whitespace-nowrap"><span className="inline-block rounded px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold">Готов к отгрузке</span></td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">{
  Array.isArray(order.items_count)
    ? (order.items_count[0]?.count ?? order.items_count.length ?? 0)
    : order.items_count ?? 0
}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <form action={confirmShippedAction.bind(null, order.id)}>
                      <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded transition-colors">Подтвердить отгрузку</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
