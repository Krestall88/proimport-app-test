'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/app/utils/formatCurrency';

// Определим типы данных, которые будет принимать таблица
import type { ManagerOrderItem } from '@/lib/types';

interface ExpandableOrdersTableProps {
  orders: ManagerOrderItem[];
  role: 'agent' | 'owner';
  selectedOrders: Set<string>;
  setSelectedOrders: React.Dispatch<React.SetStateAction<Set<string>>>;
  onDeleteOrder: (orderId: string) => void;
}

const statusMap: Record<string, string> = {
  new: "Новый",
  picking: "Сборка",
  ready_for_shipment: "Собран",
  shipped: "Отгружен",
  delivered: "Доставлен",
  canceled: "Отменен",
};

export default function ExpandableOrdersTable({ orders, role, selectedOrders, setSelectedOrders, onDeleteOrder }: ExpandableOrdersTableProps) {
  const [openOrders, setOpenOrders] = useState<Set<string>>(new Set());

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedOrders(new Set(orders.map(o => o.purchase_order_id)));
    } else {
      setSelectedOrders(new Set());
    }
  };

  const toggleOrder = (orderId: string) => {
    setOpenOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-4">
      {role === 'owner' && orders.length > 0 && (
        <div className="flex items-center p-4 bg-muted/20 border rounded-lg">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            checked={selectedOrders.size === orders.length}
            onChange={handleSelectAll}
            aria-label="Выбрать все заказы"
          />
          <span className="ml-3 text-sm">Выбрать все</span>
        </div>
      )}

      {orders.map(order => {
        const isOpen = openOrders.has(order.purchase_order_id);
        const totalSalePrice = order.final_price * order.available_quantity;
        const totalPurchasePrice = order.purchase_price * order.available_quantity;

        return (
          <div key={order.purchase_order_id} className="border rounded-lg overflow-hidden">
            {/* Основная строка заказа */}
            <div 
              className="flex items-center justify-between p-4 bg-muted/50 cursor-pointer hover:bg-muted"
              onClick={() => toggleOrder(order.purchase_order_id)}
            >
              <div className="flex items-center gap-4">
                {role === 'owner' && (
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    checked={selectedOrders.has(order.purchase_order_id)}
                    onChange={() => handleSelectOrder(order.purchase_order_id)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Выбрать заказ ${order.purchase_order_id.substring(0, 8)}`}
                  />
                )}
                {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                <div className="font-mono text-sm">{order.purchase_order_id.substring(0, 8)}</div>
                <div>
                  <div>{order.customer_name}</div>
                  {/* Контакты клиента можно добавить, если они есть в order, например, order.customer_contacts?.phone */}
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className={`px-2 py-1 text-xs rounded-full ${order.status === 'new' ? 'bg-blue-500' : 'bg-green-500'} text-white`}>
                  {statusMap[order.status] || order.status}
                </div>
                <div className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString('ru-RU')}</div>
                {role === 'owner' && <div className="font-semibold">Закупка: {formatCurrency(totalPurchasePrice)}</div>}
                <div className="font-semibold">Продажа: {formatCurrency(totalSalePrice)}</div>
                {role === 'owner' && (
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation();
                      onDeleteOrder(order.purchase_order_id);
                    }}
                    className="ml-4 px-3 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Удалить
                  </button>
                )}
              </div>
            </div>

            {/* Выпадающая таблица с товарами */}
            {isOpen && (
              <div className="p-4 bg-background">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="pb-2">Наименование</th>
                      <th className="pb-2 text-center">Кол-во</th>
                      {role === 'owner' && <th className="pb-2 text-right">Цена закупки</th>}
                      <th className="pb-2 text-right">Цена продажи</th>
                      {role === 'owner' && <th className="pb-2 text-right">Сумма закупки</th>}
                      <th className="pb-2 text-right">Сумма продажи</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b last:border-none">
                      <td className="py-2">{order.product.title} ({order.product.nomenclature_code})</td>
                      <td className="py-2 text-center">{order.available_quantity}</td>
                      {role === 'owner' && <td className="py-2 text-right">{formatCurrency(order.purchase_price)}</td>}
                      <td className="py-2 text-right">{formatCurrency(order.final_price)}</td>
                      {role === 'owner' && <td className="py-2 text-right font-medium">{formatCurrency(order.purchase_price * order.available_quantity)}</td>}
                      <td className="py-2 text-right font-medium">{formatCurrency(order.final_price * order.available_quantity)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
       {orders.length === 0 && (
        <div className="text-center p-8 border rounded-lg text-muted-foreground">
          Нет заказов для отображения.
        </div>
      )}
    </div>
  );
}
