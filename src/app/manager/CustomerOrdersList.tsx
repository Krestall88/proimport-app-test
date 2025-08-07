'use client';

import type { Database } from '@/lib/database.types';
type CustomerOrder = Database['public']['Tables']['customer_orders']['Row'];
type CustomerOrderWithRelations = CustomerOrder & {
  customers?: { name: string };
  customer_order_items?: Array<{
    purchase_price?: number;
    final_price?: number;
    quantity?: number;
    product?: { title?: string };
  }>;
};
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/app/utils/formatCurrency';

interface CustomerOrdersListProps {
  orders: CustomerOrderWithRelations[];
}

export default function CustomerOrdersList({ orders }: CustomerOrdersListProps) {
  if (!orders || orders.length === 0) {
    return <p>Нет заказов для отображения.</p>;
  }

  return (
    <div className="overflow-auto max-h-[600px] border rounded-lg bg-background">
      <table className="min-w-full table-auto border-collapse">
        <thead className="bg-muted">
          <tr>
            <th className="p-2 border">ID заказа</th>
            <th className="p-2 border">Клиент</th>
            <th className="p-2 border">Дата создания</th>
            <th className="p-2 border">Статус</th>
            <th className="p-2 border">Позиции заказа</th>
            <th className="p-2 border">Общая сумма заказа</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order: CustomerOrderWithRelations, idx: number) => {
            const orderTotal = (order.customer_order_items ?? []).reduce((sum: number, item: { purchase_price?: number; final_price?: number; quantity?: number }) => {
              const purchase = (item.purchase_price ?? 0) * (item.quantity ?? 0);
              const final = (item.final_price ?? 0) * (item.quantity ?? 0);
              return sum + (final || purchase);
            }, 0);
            return (
              <tr key={order.id} className="align-top border-b">
                <td className="p-2 border font-mono whitespace-nowrap">{order.id.substring(0, 8)}</td>
                <td className="p-2 border">{order.customers?.name ?? ''}</td>
                <td className="p-2 border whitespace-nowrap">{new Date(order.created_at).toLocaleString('ru-RU')}</td>
                <td className="p-2 border whitespace-nowrap">{order.status}</td>
                <td className="p-2 border">
                  {order.customer_order_items && order.customer_order_items.length > 0 ? (
                    <ul>
                      {order.customer_order_items.map((item: { products?: { title?: string }; quantity?: number }, idx: number) => (
                        <li key={idx}>
                          {item.product?.title ?? 'N/A'} — {item.quantity} шт.
                        </li>
                      ))}
                    </ul>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="p-2 border text-right font-bold text-lg">{formatCurrency(orderTotal)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
