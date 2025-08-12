'use client';

import React, { useState, useEffect } from 'react';
import { ConfirmButton } from './ConfirmButton';

interface Order {
  id: string;
  created_at: string;
  status: string;
  shipment_date: string | null;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items_count: any;
}

interface DriverOrdersClientProps {
  orders: Order[];
}

const statusStyles: { [key: string]: { text: string; className: string } } = {
  ready_for_shipment: { text: 'Готов к отгрузке', className: 'bg-yellow-100 text-yellow-800' },
  shipped: { text: 'Отгружен', className: 'bg-green-100 text-green-800' },
};

export default function DriverOrdersClient({ orders: initialOrders }: DriverOrdersClientProps) {
  const [orders, setOrders] = useState(initialOrders);

  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  return (
    <main className="main-content flex-1 p-6 md:p-10 bg-background min-h-screen">
      <div className="w-full">
        <div className="w-full overflow-x-auto rounded-lg shadow bg-card">
          <table className="w-full min-w-[900px] divide-y divide-gray-700">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Клиент</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Адрес</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Дата отгрузки</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Статус</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Товаров</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-accent transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div>{order.customer_name}</div>
                    <div className="text-xs text-muted-foreground">{order.customer_phone}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{order.customer_address}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{order.shipment_date || '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-block rounded px-2 py-1 text-xs font-semibold ${statusStyles[order.status]?.className || ''}`}>
                      {statusStyles[order.status]?.text || order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">{
                    Array.isArray(order.items_count)
                      ? (order.items_count[0]?.count ?? order.items_count.length ?? 0)
                      : order.items_count ?? 0
                  }</td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    {order.status === 'ready_for_shipment' && (
                      <ConfirmButton orderId={order.id} />
                    )}
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
