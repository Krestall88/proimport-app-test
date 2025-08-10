import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { FinancialOrderItem } from '@/lib/types';

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('ru-RU');
const formatCurrency = (amount: number) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(amount);

async function DeliveredOrdersList() {
  const supabase = await createClient();

  const { data: items, error } = await supabase
    .from('customer_order_items')
    .select(`
      id,
      quantity,
      price_per_unit,
      products (title),
      customer_orders (
        id,
        created_at,
        status,
        customers (name),
        invoices (id)
      )
    `)
    // @ts-ignore
    .eq('customer_orders.status', 'delivered')
    // @ts-ignore
    .is('customer_orders.invoices.id', null)
    .order('created_at', { referencedTable: 'customer_orders', ascending: false });

  if (error) {
    console.error('Error fetching delivered order items:', error);
    return <p className="text-red-400">Не удалось загрузить финансовые данные.</p>;
  }

  const orderItems: FinancialOrderItem[] = (items ?? []).map((item: any) => ({
  id: item.id,
  quantity: item.quantity,
  price_per_unit: item.price_per_unit,
  product: item.products ? {
    id: item.products.id ?? '-',
    title: item.products.title ?? '-',
    nomenclature_code: item.products.nomenclature_code ?? '-',
    description: item.products.description ?? '',
    purchase_price: item.products.purchase_price ?? null,
    selling_price: item.products.selling_price ?? null,
    category: item.products.category ?? '',
    unit: item.products.unit ?? '',
    created_at: item.products.created_at ?? '',
    supplier_id: item.products.supplier_id ?? null,
  } : null,
  customer_orders: item.customer_orders,
}));

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Готовые к выставлению счета ({orderItems.length})</h3>
      {orderItems.length === 0 ? (
        <p className="text-gray-400">Нет позиций для выставления счета.</p>
      ) : (
        <div className="overflow-x-auto bg-gray-800 rounded-lg">
          <table className="min-w-full text-left">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="p-4 font-semibold">Дата</th>
                <th className="p-4 font-semibold">Товар</th>
                <th className="p-4 font-semibold">Клиент</th>
                <th className="p-4 font-semibold text-right">Сумма</th>
                <th className="p-4 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {orderItems.map(item => (
                <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                  <td className="p-4 whitespace-nowrap">{item.customer_orders ? formatDate(item.customer_orders.created_at) : '-'}</td>
                  <td className="p-4 font-medium">{item.product?.title ?? 'Товар не найден'} ({item.quantity} шт.)</td>
                  <td className="p-4">{item.customer_orders?.customers?.name ?? 'Клиент не найден'}</td>
                  <td className="p-4 text-right font-mono">{formatCurrency(item.quantity * item.price_per_unit)}</td>
                  <td className="p-4">
                    <Link href={`/manager/orders/${item.customer_orders?.id}`} className="text-blue-400 hover:underline">
                      К заказу
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
