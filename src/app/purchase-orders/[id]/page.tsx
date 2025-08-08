import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { updatePurchaseOrderStatus } from './actions';
import StatusBadge from '@/components/StatusBadge';
import { PurchaseOrderDetail, PurchaseOrderStatus } from '@/lib/types';

import { formatCurrency } from '@/app/utils/formatCurrency';
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

const PurchaseOrderPage = async function (props: any) {
  const { params } = props;
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user!.id).single();
  const userRole = profile?.role;

  const { data: order, error } = await supabase
    .from('purchase_orders')
    .select(`
      *,
      supplier:suppliers (name),
      created_by_user:profiles (full_name),
      items:purchase_order_items (*, product:products(title))
    `)
    .eq('id', params.id)
    .single<PurchaseOrderDetail>();

  if (error || !order) {
    notFound();
  }

  const canUpdateStatus = userRole === 'owner' || userRole === 'warehouse_manager';
  const availableStatuses: PurchaseOrderStatus[] = ['ordered', 'in_transit', 'received', 'cancelled'];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <Link href="/purchase-orders" className="text-sm flex items-center gap-2 hover:underline">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="15 18 9 12 15 6" /></svg>
            Назад к списку закупок
        </Link>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-start mb-6">
            <div>
                <h1 className="text-3xl font-bold">Закупочный заказ #{order.id.substring(0, 8)}</h1>
            </div>
            <StatusBadge status={order.status} />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p><strong>Поставщик:</strong> {order.supplier?.name ?? 'N/A'}</p>
            <p><strong>Статус:</strong> <StatusBadge status={order.status} /></p>
          </div>
          <div>
            <p><strong>Дата создания:</strong> {formatDate(order.created_at)}</p>
            <p><strong>Автор:</strong> {order.created_by_user?.full_name ?? 'N/A'}</p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-4 border-t border-gray-700 pt-4">Позиции заказа</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-700">
              <tr>
                <th className="p-4">Товар</th>
                <th className="p-4 text-right">Количество</th>
                <th className="p-4 text-right">Цена закупки</th>
                <th className="p-4 text-right">Сумма</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map(item => (
                <tr key={item.id} className="border-b border-gray-700 last:border-b-0">
                  <td className="p-4 font-medium">{item.product.title}</td>
                  <td className="p-4 text-right">{item.quantity}</td>
                  <td className="p-4 text-right">{formatCurrency(item.purchase_price)}</td>
                  <td className="p-4 text-right">{formatCurrency(item.quantity * item.purchase_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-right">
          <p className="text-lg font-semibold">Итоговая сумма: {formatCurrency(order.items.reduce((acc, item) => acc + item.quantity * item.purchase_price, 0))}</p>
        </div>

        {canUpdateStatus && (
          <div className="mt-8 pt-6 border-t border-gray-700">
            <h3 className="font-semibold text-lg mb-4">Изменить статус заказа</h3>
            <form action={updatePurchaseOrderStatus} className="grid md:grid-cols-4 gap-4 items-end">
              <input type="hidden" name="orderId" value={order.id} />
              <select 
                name="status"
                defaultValue={order.status}
                className="p-2 rounded bg-gray-700 border border-gray-600 focus:ring-purple-500 focus:border-purple-500"
              >
                {availableStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <label className="text-sm md:col-span-1">Факт. количество
                <input type="number" name="actualQuantity" min="1" step="1" defaultValue={order.quantity} className="mt-1 w-full p-2 rounded bg-gray-700 border border-gray-600" />
              </label>
              <label className="text-sm md:col-span-1">Комментарий
                <input type="text" name="comment" placeholder="Брак, недостача..." className="mt-1 w-full p-2 rounded bg-gray-700 border border-gray-600" />
              </label>
              <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded md:col-span-1">
                Обновить статус
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
