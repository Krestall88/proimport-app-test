'use client';

import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import { formatCurrency } from '@/app/utils/formatCurrency';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

interface OrderItem {
  id: string;
  product: { title: string };
  quantity: number;
  price_per_unit?: number; // Цена продажи
  purchase_price?: number; // Цена закупки
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  customer: { name: string };
  customer_order_items: OrderItem[];
}

interface ColumnConfig {
  header: string;
  accessor: (item: OrderItem) => React.ReactNode;
}

interface ExpandableOrdersTableProps {
  orders: Order[];
  columns: ColumnConfig[];
  loading?: boolean;
}

const ExpandableRow = ({ order, columns }: { order: Order, columns: ColumnConfig[] }) => {
  const [isOpen, setIsOpen] = useState(false);

  const totalSaleAmount = order.customer_order_items.reduce((sum, item) => sum + (item.price_per_unit || 0) * item.quantity, 0);
  const totalPurchaseAmount = order.customer_order_items.reduce((sum, item) => sum + (item.purchase_price || 0) * item.quantity, 0);

  return (
    <React.Fragment>
      <tr className="border-b border-gray-700 bg-gray-900/50 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <td className="p-4">{order.id.slice(0, 8)}...</td>
        <td className="p-4">{formatDate(order.created_at)}</td>
        <td className="p-4">{order.customer.name}</td>
        <td className="p-4"><StatusBadge status={order.status} /></td>
        <td className="p-4 text-xs text-gray-400">Позиций: {order.customer_order_items.length}</td>
      </tr>
      {isOpen && (
        <tr>
          <td colSpan={5} className="p-0 bg-gray-800">
            <div className="p-4">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-700/50">
                  <tr>
                    {columns.map(col => <th key={col.header} className="p-2">{col.header}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {order.customer_order_items.map(item => (
                    <tr key={item.id} className="border-b border-gray-700/50 last:border-b-0">
                      {columns.map(col => <td key={col.header} className="p-2">{col.accessor(item)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
};

export default function ExpandableOrdersTable({ orders, columns, loading }: ExpandableOrdersTableProps) {
  return (
    <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="overflow-y-auto max-h-[calc(100vh-200px)]"> {/* Ограничение высоты и скролл */}
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-700 sticky top-0 z-10">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Дата</th>
              <th className="p-4">Клиент</th>
              <th className="p-4">Статус</th>
              <th className="p-4">Товары</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center">Загрузка...</td></tr>
            ) : orders.length > 0 ? (
              orders.map(order => <ExpandableRow key={order.id} order={order} columns={columns} />)
            ) : (
              <tr><td colSpan={5} className="p-8 text-center text-gray-400">Нет заказов для отображения</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
