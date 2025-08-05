import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { OrderWithFinanceDetails } from '@/lib/types';

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('ru-RU');
const formatCurrency = (amount: number) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(amount);

async function DeliveredOrdersList() {
  const supabase = createClient();

  // Fetch delivered orders that don't have an invoice yet
  const { data: orders, error } = await supabase
    .from('customer_orders')
    .select(`
      id, 
      created_at, 
      product_name, 
      quantity,
      price_per_unit,
      status,
      supplier:suppliers (name),
      customer:customers (name),
      invoice:invoices(id)
    `)
    .eq('status', 'delivered')
    .is('invoices.id', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching delivered orders:', error);
    return <p className="text-red-400">Не удалось загрузить финансовые данные.</p>;
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Завершенные заказы ({orders.length})</h3>
      {orders.length === 0 ? (
        <p className="text-gray-400">Нет завершенных заказов для отображения.</p>
      ) : (
        <div className="overflow-x-auto bg-gray-800 rounded-lg">
          <table className="min-w-full text-left">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="p-4 font-semibold">Дата</th>
                <th className="p-4 font-semibold">Товар</th>
                <th className="p-4 font-semibold">Поставщик</th>
                <th className="p-4 font-semibold">Клиент</th>
                <th className="p-4 font-semibold text-right">Сумма</th>
                <th className="p-4 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {(orders as OrderWithFinanceDetails[]).map(order => (
                <tr key={order.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                  <td className="p-4 whitespace-nowrap">{formatDate(order.created_at)}</td>
                  <td className="p-4 font-medium">{order.product_name} ({order.quantity} шт.)</td>
                  <td className="p-4">{order.supplier?.[0]?.name ?? 'N/A'}</td>
                  <td className="p-4">{order.customer?.[0]?.name ?? 'N/A'}</td>
                  <td className="p-4 text-right font-mono">{formatCurrency(order.quantity * order.price_per_unit)}</td>
                  <td className="p-4">
                    <Link href={`/customer-orders/${order.id}`} className="text-blue-400 hover:underline">
                      Детали
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

export default function AccountantDashboard() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Готовые к выставлению счета</h2>
      <DeliveredOrdersList />
    </div>
  );
}
