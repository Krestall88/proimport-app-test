import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { updateOrderStatus, uploadDeliveryPhoto } from './actions';

import StatusBadge from '@/components/StatusBadge';

import { formatCurrency } from '@/app/utils/formatCurrency';
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

// Local type for order items to ensure type safety
interface OrderItem {
  id: string;
  quantity: number;
  price_per_unit: number;
  product: {
    title: string;
    description: string;
  };
}

// Local type for customer to ensure type safety
interface Customer {
  name: string;
  address: string;
  contacts: {
    phone?: string | null;
    email?: string | null;
  } | null;
  tin?: string;
  kpp?: string;
  delivery_address?: string;
  payment_terms?: string;
}

// Local type for agent to ensure type safety
interface Agent {
  full_name: string;
}

const AgentCustomerOrderPage = async function (props: any) {
  const { params } = props;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user!.id).single();
  const userRole = profile?.role;

  const { data: order, error } = await supabase
    .from('customer_orders')
    .select(`
      id, 
      created_at, 
      status, 
      customer:customers (name, address, contacts, tin, kpp, delivery_address, payment_terms),
      agent:profiles (full_name),
      customer_order_items(id, quantity, price_per_unit, product:products(title, description)),
      invoices(*)
    `)
    .eq('id', params.id)
    .single();

  if (error || !order) {
    notFound();
  }

  const isManager = userRole === 'warehouse_manager';
  const isDriver = userRole === 'driver';
  const isAccountant = userRole === 'accountant';

  const canCreateInvoice = isAccountant && order.status === 'delivered' && order.invoices.length === 0;

  const totalCost = (order.customer_order_items as unknown as OrderItem[]).reduce((acc: number, item: OrderItem) => acc + item.quantity * item.price_per_unit, 0);
  const availableStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <Link href="/agent/customer-orders" className="text-sm flex items-center gap-2 hover:underline">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="15 18 9 12 15 6" /></svg>
            Назад к списку заказов
        </Link>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p><strong>Клиент:</strong> {(order.customer as unknown as Customer)?.name ?? 'N/A'}</p>
            <p><strong>Адрес:</strong> {(order.customer as unknown as Customer)?.address ?? 'N/A'}</p>
            <p><strong>Телефон:</strong> {(order.customer as unknown as Customer)?.contacts?.phone ?? 'N/A'}</p>
            <p><strong>Email:</strong> {(order.customer as unknown as Customer)?.contacts?.email ?? 'N/A'}</p>
            <p><strong>ИНН:</strong> {(order.customer as unknown as Customer)?.tin ?? 'N/A'}</p>
            <p><strong>КПП:</strong> {(order.customer as unknown as Customer)?.kpp ?? 'N/A'}</p>
            <p><strong>Адрес доставки:</strong> {(order.customer as unknown as Customer)?.delivery_address ?? 'N/A'}</p>
            <p><strong>Условия оплаты:</strong> {(order.customer as unknown as Customer)?.payment_terms ?? 'N/A'}</p>
          </div>
          <div>
            <p><strong>Дата заказа:</strong> {formatDate(order.created_at)}</p>
            <p><strong>Статус:</strong> <StatusBadge status={order.status} /></p>
            <p><strong>Агент:</strong> {(order.agent as unknown as Agent)?.full_name ?? 'N/A'}</p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-4 border-t border-gray-700 pt-4">Позиции заказа</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-700">
              <tr>
                <th className="p-4">Товар</th>
                <th className="p-4 text-right">Количество</th>
                <th className="p-4 text-right">Цена за шт.</th>
                <th className="p-4 text-right">Сумма</th>
              </tr>
            </thead>
            <tbody>
              {(order.customer_order_items as unknown as OrderItem[]).map((item: OrderItem) => (
                <tr key={item.id} className="border-b border-gray-700 last:border-b-0">
                  <td className="p-4 font-medium">
                    <div>{item.product.title}</div>
                    <div className="text-xs text-gray-400">{item.product.description}</div>
                  </td>
                  <td className="p-4 text-right">{item.quantity}</td>
                  <td className="p-4 text-right">{formatCurrency(item.price_per_unit)}</td>
                  <td className="p-4 text-right">{formatCurrency(item.quantity * item.price_per_unit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-right">
          <p className="text-lg font-semibold">Итоговая сумма: {formatCurrency(totalCost)}</p>
        </div>

        {isManager && (
          <div className="mt-8 border-t border-gray-700 pt-6">
            <h3 className="font-semibold text-lg mb-4">Изменить статус заказа</h3>
            <form action={updateOrderStatus} className="flex items-center gap-4">
              <input type="hidden" name="orderId" value={order.id} />
              <select 
                name="status"
                defaultValue={order.status}
                className="p-2 rounded bg-gray-700 border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
              >
                {availableStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                Обновить
              </button>
            </form>
          </div>
        )}

        {isDriver && order.status === 'shipped' && (
          <div className="mt-8 border-t border-gray-700 pt-6">
            <h3 className="font-semibold text-lg mb-4">Подтверждение доставки</h3>
            <form action={uploadDeliveryPhoto} className="space-y-4">
              <input type="hidden" name="orderId" value={order.id} />
              <div>
                <label htmlFor="photo" className="block text-sm font-medium text-gray-300 mb-2">
                  Загрузить фото для подтверждения
                </label>
                <input
                  type="file"
                  id="photo"
                  name="photo"
                  required
                  accept="image/*"
                  className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-base"
              >
                Загрузить фото и завершить доставку
              </button>
            </form>
          </div>
        )}

        {canCreateInvoice && (
  <div className="mt-8 border-t border-gray-700 pt-6">
    <h3 className="font-semibold text-lg mb-4">Действия бухгалтера</h3>
    <div className="p-4 bg-yellow-900 text-yellow-200 rounded">
      Создание счета временно недоступно (таблица invoices отсутствует).
    </div>
  </div>
)}
      </div>
    </div>
  );
}
