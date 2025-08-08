'use client';

import type { Database } from '@/lib/database.types';
import type { ManagerOrderItem } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/app/utils/formatCurrency';

interface CustomerOrdersListProps {
  orders: ManagerOrderItem[];
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
          {orders.map((order: ManagerOrderItem, idx: number) => (
            <tr key={order.order_item_id} className="align-top border-b">
              <td className="p-2 border font-mono whitespace-nowrap">{order.order_item_id.substring(0, 8)}</td>
              <td className="p-2 border">{order.customer_name ?? ''}</td>
              <td className="p-2 border whitespace-nowrap">{new Date(order.created_at).toLocaleString('ru-RU')}</td>
              <td className="p-2 border whitespace-nowrap">{order.status}</td>
              <td className="p-2 border">
                {order.product?.title ? (
                  <ul>
                    <li>{order.product.title} — {order.available_quantity} шт.</li>
                  </ul>
                ) : (
                  '—'
                )}
              </td>
              <td className="p-2 border text-right font-bold text-lg">{formatCurrency(order.item_total ?? 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
