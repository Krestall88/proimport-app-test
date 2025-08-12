"use client";
import React, { useState, useEffect } from "react";
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/lib/database.types';
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import ConfirmPickButton from './ConfirmPickButton';
import { deleteCustomerOrders } from '@/lib/actions/warehouse';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useTransition } from 'react';

// ... (интерфейсы и statusMap остаются теми же)
import type { WarehouseOrderItem } from '@/lib/types';

interface WarehouseOrdersTableProps {
  orders: WarehouseOrderItem[];
  loading?: boolean;
}

const statusMap: Record<string, string> = {
  new: "Ожидает сборки",
  picking: "В процессе сборки",
  ready_for_shipment: "Готов к отгрузке",
  shipped: "Отгружен",
  delivered: "Доставлен",
};

export default function WarehouseOrdersTable({ orders: initialOrders, loading }: WarehouseOrdersTableProps) {
  const [orders, setOrders] = useState(initialOrders);

  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('realtime-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'customer_orders' },
        (payload) => {
          console.log('Change received!', payload);

          if (payload.eventType === 'UPDATE') {
            const updatedOrder = payload.new as Database['public']['Tables']['customer_orders']['Row'];
            setOrders(currentOrders =>
              currentOrders.map(order =>
                order.purchase_order_id === updatedOrder.id
                  ? { ...order, status: updatedOrder.status, shipment_date: updatedOrder.shipment_date }
                  : order
              )
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedOrder = payload.old as { id?: string };
            if (deletedOrder.id) {
              setOrders(currentOrders =>
                currentOrders.filter(item => item.purchase_order_id !== deletedOrder.id)
              );
            }
          }
          // INSERT events will be handled by a full page refetch for data consistency
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
    const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Неверная дата' : date.toLocaleString('ru-RU');
  };

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [dialogState, setDialogState] = useState({ isOpen: false, orderId: '' });

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

  const openDeleteDialog = (orderId: string) => {
    setDialogState({ isOpen: true, orderId });
  };

  const confirmDelete = () => {
    startTransition(async () => {
      const result = await deleteCustomerOrders([dialogState.orderId]);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
      setDialogState({ isOpen: false, orderId: '' });
    });
  };

  const grouped = orders.reduce((acc, item) => {
  acc[item.purchase_order_id] = acc[item.purchase_order_id] || { ...item, items: [] };
  acc[item.purchase_order_id].items.push(item);
  return acc;
}, {} as Record<string, WarehouseOrderItem & { items: WarehouseOrderItem[] }>);
  // Сортировка: новые статусы всегда сверху, внутри групп — по дате (новые сверху)
  const statusPriority = (status: string) => {
    switch (status) {
      case 'new': return 0;
      case 'picking': return 1;
      case 'ready_for_shipment': return 2;
      default: return 3;
    }
  };
  const groupedOrders = Object.values(grouped).sort((a, b) => {
    const prioA = statusPriority(a.status);
    const prioB = statusPriority(b.status);
    if (prioA !== prioB) return prioA - prioB;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="overflow-auto max-h-[80vh] border rounded-lg bg-background shadow-md">
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState({ isOpen: false, orderId: '' })}
        onConfirm={confirmDelete}
        title="Подтвердите удаление"
        description="Вы уверены, что хотите удалить этот заказ? Это действие необратимо."
      />
      <table className="min-w-full table-auto border-collapse">
        <thead className="bg-muted sticky top-0 z-10">
          <tr>
            <th className="p-3 border-b text-left w-12"></th>
            <th className="p-3 border-b text-left">ID заказа</th>
            <th className="p-3 border-b text-left">Клиент</th>
            <th className="p-3 border-b text-left">Дата создания</th>
            <th className="p-3 border-b text-left">Статус</th>
            <th className="p-3 border-b text-left">Товаров</th>
            <th className="p-3 border-b text-center">Действия</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={7} className="text-center p-6">Загрузка...</td></tr>
          ) : groupedOrders.length === 0 ? (
            <tr><td colSpan={7} className="text-center p-6">Нет заказов для отображения.</td></tr>
          ) : (
            groupedOrders.map(order => (
              <React.Fragment key={order.purchase_order_id}>
                <tr className="border-b align-top hover:bg-muted/50 cursor-pointer" onClick={() => toggleRow(order.purchase_order_id)}>
                  <td className="p-3 border-r text-center">
                    {expandedRows.has(order.purchase_order_id) ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </td>
                  <td className="p-3 border-r font-mono">{order.purchase_order_id ? String(order.purchase_order_id).substring(0, 8) : 'нет ID'}</td>
                  <td className="p-3 border-r">
                    <div>
                                            <div>{order.customer_name || 'Нет имени'}</div>
                      <div className="text-xs text-gray-500">
                        {order.customer?.contacts?.phone && <div>Тел: {order.customer.contacts.phone}</div>}
                        {order.customer?.contacts?.email && <div>Email: {order.customer.contacts.email}</div>}
                        {order.customer?.tin && <div>ИНН: {order.customer.tin}</div>}
                        {order.customer?.kpp && <div>КПП: {order.customer.kpp}</div>}
                        {order.customer?.delivery_address && <div>Адрес доставки: {order.customer.delivery_address}</div>}
                        {order.customer?.payment_terms && <div>Условия оплаты: {order.customer.payment_terms}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="p-3 border-r whitespace-nowrap">{formatDate(order.created_at)}</td>
                  <td className="p-3 border-r whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${order.status === 'new' ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'}`}>
                      {statusMap[order.status] || order.status}
                    </span>
                  </td>
                  <td className="p-3 border-r text-center">{order.items.length}</td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center space-x-2" onClick={(e) => e.stopPropagation()}>
                      {(order.status === 'new' || order.status === 'picking') && (
                        <ConfirmPickButton orderId={order.purchase_order_id} currentStatus={order.status} />
                      )}
                      <button 
                        onClick={() => openDeleteDialog(order.purchase_order_id)}
                        disabled={isPending}
                        className="p-2 text-red-500 hover:text-red-700 disabled:opacity-50"
                        title="Удалить заказ"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedRows.has(order.purchase_order_id) && (
                  <tr className="bg-muted/20">
                    <td colSpan={7} className="p-0 border-b">
                      <div className="p-4">
                        <h4 className="font-bold mb-2 text-lg">Состав заказа:</h4>
                        <table className="min-w-full bg-background/50 text-sm rounded-md">
                          <thead className="bg-muted/40">
                            <tr>
                              <th className="p-2 border text-left">Артикул</th>
                              <th className="p-2 border text-left">Товар</th>
                              <th className="p-2 border text-left">Описание</th>
                              <th className="p-2 border text-left">Категория</th>
                              <th className="p-2 border text-left">Срок годн.</th>
                              <th className="p-2 border text-left">Партия</th>
                              <th className="p-2 border text-center">Кол-во</th>
                              <th className="p-2 border text-center">Ед. изм.</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.items.map(item => (
                              <tr key={item.order_item_id} className="border-t">
                                <td className="p-2 border-r">{item.product?.nomenclature_code ?? '-'}</td>
                                <td className="p-2 border-r">{item.product?.title ?? '-'}</td>
                                <td className="p-2 border-r">{item.product?.description ?? '-'}</td>
                                <td className="p-2 border-r">{item.product?.category ?? '-'}</td>
                                                                <td className="p-2 border-r">{formatDate(item.product?.expiry_date)}</td>
                                <td className="p-2 border-r">{item.product?.batch_number ?? '-'}</td>
                                <td className="p-2 border-r text-center font-bold">{item.quantity}</td>
                                <td className="p-2 text-center">{item.product?.unit ?? '-'}</td>
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
  );
}
