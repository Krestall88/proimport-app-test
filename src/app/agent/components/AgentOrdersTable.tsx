"use client";
import React, { useState, useTransition, useMemo } from "react";
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { deleteOrderItems, deleteEntireOrder } from '../customer-orders/actions';
import { toast } from 'sonner';
import { type CheckedState } from "@radix-ui/react-checkbox";

import type { AgentOrderItem } from '@/lib/types';

interface AgentOrdersTableProps {
  orders: AgentOrderItem[];
  loading?: boolean;
}

interface GroupedOrder extends AgentOrderItem {
  items: AgentOrderItem[];
  total_sum: number;
}

const statusMap: Record<string, string> = {
  new: "Новый",
  picking: "В сборке",
  ready_for_shipment: "Готов к отгрузке",
  shipped: "Отгружен",
  delivered: "Доставлен",
  canceled: "Отменен",
};

const formatCurrency = (amount: number | null | undefined) => {
  if (amount === null || amount === undefined) return '0 сом';
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'KGS', minimumFractionDigits: 2 }).format(amount);
};

const formatNumber = (amount: number | null | undefined) => {
  if (amount === null || amount === undefined) return '0';
  return new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
};

const formatDate = (dateString?: string | null) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? 'Неверная дата' : date.toLocaleDateString('ru-RU');
};

export default function AgentOrdersTable({ orders, loading }: AgentOrdersTableProps) {
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState<(() => void) | null>(null);
  const [dialogContent, setDialogContent] = useState({ title: '', description: '' });
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const groupedOrders: GroupedOrder[] = useMemo(() => {
    const grouped = orders.reduce((acc, item: AgentOrderItem) => {
      const key = item.purchase_order_id;
      if (!acc[key]) {
        acc[key] = { ...item, items: [], total_sum: 0 };
      }
      acc[key].items.push(item);
      acc[key].total_sum += (item.price_per_unit || 0) * item.available_quantity;
      return acc;
    }, {} as Record<string, GroupedOrder>);
    return Object.values(grouped);
  }, [orders]);

  const handleSelectRow = (id: string) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const handleDeleteEntireOrder = (orderId: string) => {
    setDialogContent({
      title: 'Подтвердите удаление заказа',
      description: 'Вы уверены, что хотите удалить весь заказ? Это действие удалит заказ и все его позиции.'
    });
    setActionToConfirm(() => () => {
      startTransition(async () => {
        const result = await deleteEntireOrder(orderId);
        if (result.success) {
          toast.success(result.message);
          setSelectedRows([]);
        } else {
          toast.error(result.message);
        }
        setDialogOpen(false);
      });
    });
    setDialogOpen(true);
  };

  const handleDeleteItem = (itemId: string) => {
    setDialogContent({
      title: 'Подтвердите удаление',
      description: 'Вы уверены, что хотите удалить эту позицию? Это действие необратимо.'
    });
    setActionToConfirm(() => () => {
      startTransition(async () => {
        const result = await deleteOrderItems([itemId]);
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
        setDialogOpen(false);
      });
    });
    setDialogOpen(true);
  };

  const toggleRow = (orderId: string) => {
    setExpandedRows(prev => {
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
    <div className="container mx-auto p-4 bg-gray-900 text-gray-200 rounded-lg">
      <ConfirmationDialog
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={() => {
          actionToConfirm?.();
          setDialogOpen(false);
        }}
        title={dialogContent.title}
        description={dialogContent.description}
        isPending={isPending}
      />
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Заказы клиентов</h1>
      </div>
      <div className="overflow-auto max-h-[80vh] border border-gray-700 rounded-lg bg-gray-900 shadow-md">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-gray-800 sticky top-0 z-10">
            <tr>
              <th className="p-3 border-b border-gray-700 text-left w-12"></th>
              <th className="p-3 border-b border-gray-700 text-left">ID заказа</th>
              <th className="p-3 border-b border-gray-700 text-left">Статус</th>
              <th className="p-3 border-b border-gray-700 text-left">Дата отгрузки</th>
              <th className="p-3 border-b border-gray-700 text-left">Клиент</th>
              <th className="p-3 border-b border-gray-700 text-left">Дата создания</th>
              <th className="p-3 border-b border-gray-700 text-right">Сумма</th>
              <th className="p-3 border-b border-gray-700 text-center">Действия</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center p-6">Загрузка...</td></tr>
            ) : groupedOrders.length === 0 ? (
              <tr><td colSpan={8} className="text-center p-6">Нет заказов для отображения.</td></tr>
            ) : (
              groupedOrders.map((order: GroupedOrder) => (
                <React.Fragment key={order.purchase_order_id}>
                  <tr className="border-b border-gray-700 hover:bg-gray-800/50" data-state={selectedRows.includes(order.purchase_order_id) ? 'selected' : ''}>
                    <td className="p-3 border-r border-gray-700 cursor-pointer" onClick={() => toggleRow(order.purchase_order_id)}>
                      {expandedRows.has(order.purchase_order_id) ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </td>
                    <td className="p-3 border-r border-gray-700 font-mono whitespace-nowrap">{order.purchase_order_id.substring(0, 8)}</td>
                    <td className="p-3 border-r border-gray-700 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${order.status === 'new' ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'}`}>
                        {statusMap[order.status] || order.status}
                      </span>
                    </td>
                    <td className="p-3 border-r border-gray-700 whitespace-nowrap">{formatDate(order.shipment_date)}</td>
                    <td className="p-3 border-r border-gray-700 whitespace-nowrap">{order.customer_name}</td>
                    <td className="p-3 border-r border-gray-700 whitespace-nowrap">{new Date(order.created_at).toLocaleDateString('ru-RU')}</td>
                    <td className="p-3 border-r border-gray-700 text-right font-bold">{formatCurrency(order.total_sum)}</td>
                    <td className="p-3 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteEntireOrder(order.purchase_order_id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                  {expandedRows.has(order.purchase_order_id) && (
                    <tr className="bg-gray-800/50">
                      <td colSpan={8} className="p-0">
                        <div className="p-4">
                          <table className="min-w-full table-auto border-collapse">
                            <thead className="bg-gray-700/50">
                              <tr>
                                <th className="p-2 border border-gray-600 text-left w-12">
                                  <Checkbox
                                    onCheckedChange={(checked: CheckedState) => {
                                      const itemIds = order.items.map((i: AgentOrderItem) => i.order_item_id);
                                      if (checked) {
                                        setSelectedRows(prev => [...new Set([...prev, ...itemIds])]);
                                      } else {
                                        setSelectedRows(prev => prev.filter(id => !itemIds.includes(id)));
                                      }
                                    }}
                                    checked={
                                      order.items.every((i: AgentOrderItem) => selectedRows.includes(i.order_item_id)) ? true :
                                      order.items.some((i: AgentOrderItem) => selectedRows.includes(i.order_item_id)) ? 'indeterminate' : false
                                    }
                                  />
                                </th>
                                <th className="p-2 border border-gray-600 text-left">Артикул</th>
                                <th className="p-2 border border-gray-600 text-left">Товар</th>
                                <th className="p-2 border border-gray-600 text-left">Описание</th>
                                <th className="p-2 border border-gray-600 text-left">Партия</th>
                                <th className="p-2 border border-gray-600 text-left">Срок годности</th>
                                <th className="p-2 border border-gray-600 text-center">Кол-во</th>
                                <th className="p-2 border border-gray-600 text-right">Цена</th>
                                <th className="p-2 border border-gray-600 text-right">Итого</th>
                                <th className="p-2 border border-gray-600 text-center">Действия</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.items.map((item: AgentOrderItem) => (
                                <tr key={item.order_item_id} className="border-t border-gray-700" data-state={selectedRows.includes(item.order_item_id) ? 'selected' : ''}>
                                  <td className="p-2 border-r border-gray-600">
                                    <Checkbox
                                      onCheckedChange={() => handleSelectRow(item.order_item_id)}
                                      checked={selectedRows.includes(item.order_item_id)}
                                    />
                                  </td>
                                  <td className="p-2 border-r border-gray-600">{item.product?.nomenclature_code ?? '-'}</td>
                                  <td className="p-2 border-r border-gray-600">{item.product?.title ?? '-'}</td>
                                  <td className="p-2 border-r border-gray-600 text-xs text-gray-400">{item.product?.description ?? '-'}</td>
                                  <td className="p-2 border-r border-gray-600">{item.product?.batch_number ?? '-'}</td>
                                  <td className="p-2 border-r border-gray-600">{item.product?.expiry_date ?? '-'}</td>
                                  <td className="p-2 border-r border-gray-600 text-center font-bold">{item.available_quantity} {item.product?.unit ?? ''}</td>
                                  <td className="p-2 border-r border-gray-600 text-right">{formatCurrency(item.price_per_unit)}</td>
                                  <td className="p-2 border-r border-gray-600 text-right font-bold">{formatCurrency((item.price_per_unit || 0) * item.available_quantity)}</td>
                                  <td className="p-2 text-center">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteItem(item.order_item_id)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
