"use client";
import React, { useState, useTransition, useMemo } from "react";
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { deleteOrderItems, deleteEntireOrder } from '../customer-orders/actions';
import { toast } from 'sonner';
import { type CheckedState } from "@radix-ui/react-checkbox";

interface Product {
  title: string;
  description: string;
  batch_number: string;
  expiry_date: string;
  nomenclature_code: string;
  unit?: string | null;
}

interface AgentOrderItem {
  order_id: string;
  created_at: string;
  status: string;
  customer_name: string;
  customer_contacts?: {
    phone?: string | null;
    email?: string | null;
  } | null;
  customer_tin?: string;
  customer_kpp?: string;
  customer_delivery_address?: string;
  customer_payment_terms?: string;
  order_item_id: string;
  product: {
    title: string;
    description: string;
    batch_number: string;
    expiry_date: string;
    nomenclature_code: string;
    unit: string;
  };
  available_quantity: number;
  price_per_unit?: number;
}

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

export default function AgentOrdersTable({ orders, loading }: AgentOrdersTableProps) {
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState<(() => void) | null>(null);
  const [dialogContent, setDialogContent] = useState({ title: '', description: '' });
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const groupedOrders: GroupedOrder[] = useMemo(() => {
    const grouped = orders.reduce((acc, item: AgentOrderItem) => {
      const key = item.order_id;
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
    <div>
      <ConfirmationDialog
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={() => {
          if (actionToConfirm) actionToConfirm();
          setDialogOpen(false);
        }}
        title={dialogContent.title}
        description={dialogContent.description}
      />
      <div className="mb-4 flex items-center gap-4">
        <Button
          onClick={() => handleDeleteEntireOrder(groupedOrders[0].order_id)}
          disabled={selectedRows.length === 0 || isPending}
          variant="destructive"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Удалить выбранное ({selectedRows.length})
        </Button>
      </div>
      <div className="overflow-auto max-h-[80vh] border rounded-lg bg-background shadow-md">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-muted sticky top-0 z-10">
            <tr>
              <th className="p-3 border-b text-left w-12"></th>
              <th className="p-3 border-b text-left">ID заказа</th>
              <th className="p-3 border-b text-left">Клиент</th>
              <th className="p-3 border-b text-left">Дата создания</th>
              <th className="p-3 border-b text-left">Статус</th>
              <th className="p-3 border-b text-center">Товаров</th>
              <th className="p-3 border-b text-right">Сумма заказа</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center p-6">Загрузка...</td></tr>
            ) : groupedOrders.length === 0 ? (
              <tr><td colSpan={7} className="text-center p-6">Нет заказов для отображения.</td></tr>
            ) : (
              groupedOrders.map((order: GroupedOrder) => (
                <React.Fragment key={order.order_id}>
                  <tr className="border-b align-top hover:bg-muted/50" data-state={selectedRows.some(id => order.items.some(item => item.order_item_id === id)) ? 'selected' : ''}>
                    <td className="p-3 border-r text-center cursor-pointer" onClick={() => toggleRow(order.order_id)}>
                      {expandedRows.has(order.order_id) ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </td>
                    <td className="p-3 border-r font-mono whitespace-nowrap">{order.order_id.substring(0, 8)}</td>
                    <td className="p-3 border-r whitespace-nowrap">{order.customer_name}</td>
                    <td className="p-3 border-r whitespace-nowrap">{new Date(order.created_at).toLocaleString("ru-RU")}</td>
                    <td className="p-3 border-r whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${order.status === 'new' ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'}`}>
                        {statusMap[order.status] || order.status}
                      </span>
                    </td>
                    <td className="p-3 border-r text-center">{order.items.length}</td>
                    <td className="p-3 text-right font-bold whitespace-nowrap">{formatCurrency(order.total_sum)}</td>
                  </tr>
                  {expandedRows.has(order.order_id) && (
                    <tr className="bg-muted/20">
                      <td colSpan={7} className="p-0 border-b">
                        <div className="p-4">
                          <h4 className="font-bold mb-2 text-lg">Состав заказа:</h4>
                          <table className="min-w-full bg-background/50 text-sm rounded-md">
                            <thead className="bg-muted/40">
                              <tr>
                                <th className="p-2 border w-10">
                                  <Checkbox
                                    onCheckedChange={(checked: CheckedState) => {
                                      const itemIds = order.items.map((i: AgentOrderItem) => i.order_item_id);
                                      if (checked === true) {
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
                                <th className="p-2 border text-left">Артикул</th>
                                <th className="p-2 border text-left">Товар</th>
                                <th className="p-2 border text-left">Описание</th>
                                <th className="p-2 border text-left">Партия</th>
                                <th className="p-2 border text-left">Срок годности</th>
                                <th className="p-2 border text-center">Кол-во</th>
                                <th className="p-2 border text-right">Цена</th>
                                <th className="p-2 border text-right">Итого</th>
                                <th className="p-2 border text-center">Действия</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.items.map((item: AgentOrderItem) => (
                                <tr key={item.order_item_id} className="border-t" data-state={selectedRows.includes(item.order_item_id) ? 'selected' : ''}>
                                  <td className="p-2 border-r">
                                    <Checkbox
                                      onCheckedChange={() => handleSelectRow(item.order_item_id)}
                                      checked={selectedRows.includes(item.order_item_id)}
                                    />
                                  </td>
                                  <td className="p-2 border-r">{item.product?.nomenclature_code ?? '-'}</td>
                                  <td className="p-2 border-r">{item.product?.title ?? '-'}</td>
                                  <td className="p-2 border-r text-xs text-gray-400">{item.product?.description ?? '-'}</td>
                                  <td className="p-2 border-r">{item.product?.batch_number ?? '-'}</td>
                                  <td className="p-2 border-r">{item.product?.expiry_date ?? '-'}</td>
                                  <td className="p-2 border-r text-center font-bold">{item.available_quantity} {item.product?.unit ?? ''}</td>
                                  <td className="p-2 border-r text-right">{formatCurrency(item.price_per_unit)}</td>
                                  <td className="p-2 text-right font-bold">{formatCurrency((item.price_per_unit || 0) * item.available_quantity)}</td>
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
