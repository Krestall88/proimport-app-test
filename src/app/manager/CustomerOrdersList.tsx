'use client';

import type { CustomerOrder } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface CustomerOrdersListProps {
  orders: CustomerOrder[];
}

import type { CustomerOrder } from '@/lib/types';
import { formatCurrency } from '@/app/utils/formatCurrency';

interface CustomerOrdersListProps {
  orders: CustomerOrder[];
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
          {orders.map((order) => {
            const orderTotal = (order.items || []).reduce((sum, item) => {
              // Предполагаем, что item содержит purchase_price, final_price, quantity
              // Если нет, нужно будет скорректировать структуру данных и запрос
              const purchase = (item.purchase_price ?? 0) * (item.quantity ?? 0);
              const final = (item.final_price ?? 0) * (item.quantity ?? 0);
              return sum + (final || purchase);
            }, 0);
            return (
              <tr key={order.id} className="align-top border-b">
                <td className="p-2 border font-mono whitespace-nowrap">{order.id.substring(0, 8)}</td>
                <td className="p-2 border whitespace-nowrap">{order.customer_name}</td>
                <td className="p-2 border whitespace-nowrap">{new Date(order.created_at).toLocaleString('ru-RU')}</td>
                <td className="p-2 border whitespace-nowrap">{order.status}</td>
                <td className="p-2 border">
                  <table className="min-w-[400px] w-full text-xs border-none">
                    <thead>
                      <tr>
                        <th className="p-1 border">Наименование</th>
                        <th className="p-1 border">Кол-во</th>
                        <th className="p-1 border">Закуп. цена</th>
                        <th className="p-1 border">Итог. цена</th>
                        <th className="p-1 border">Сумма по позиции</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(order.items || []).map((item, idx) => {
                        const sumPurchase = (item.purchase_price ?? 0) * (item.quantity ?? 0);
                        const sumFinal = (item.final_price ?? 0) * (item.quantity ?? 0);
                        return (
                          <tr key={idx}>
                            <td className="p-1 border whitespace-nowrap">{item.product_title || '-'}</td>
                            <td className="p-1 border text-center">{item.quantity}</td>
                            <td className="p-1 border text-right">{formatCurrency(item.purchase_price)}</td>
                            <td className="p-1 border text-right">{formatCurrency(item.final_price)}</td>
                            <td className="p-1 border text-right font-semibold">{formatCurrency(sumFinal || sumPurchase)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
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
