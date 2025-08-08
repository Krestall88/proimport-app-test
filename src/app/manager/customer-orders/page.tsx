'use client';

'use client';

import { useState, useEffect, Suspense } from 'react';
import { getManagerCustomerOrders } from '@/lib/actions/orders';
import type { ManagerOrderItem } from '@/lib/types';
import ExpandableOrdersTable from '@/components/ui/ExpandableOrdersTable';
import Link from 'next/link';
import { deleteOrders } from './actions';

import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export default function ManagerOrdersPage() {
  const [orders, setOrders] = useState<ManagerOrderItem[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [dialogState, setDialogState] = useState({ isOpen: false, orderIds: [] as string[] });

  useEffect(() => {
    getManagerCustomerOrders().then((orders: ManagerOrderItem[]) => setOrders(orders));
  }, []);

  const openDeleteDialog = (orderIds: string[]) => {
    setDialogState({ isOpen: true, orderIds });
  };

  const confirmDelete = async () => {
    const { orderIds } = dialogState;
    const result = await deleteOrders(orderIds);

    if (result.success) {
      toast.success(`Успешно удалено ${orderIds.length} заказ(ов).`);
      setOrders(prev => prev.filter(o => !orderIds.includes(o.purchase_order_id)));
      setSelectedOrders(prev => {
        const newSet = new Set(prev);
        orderIds.forEach(id => newSet.delete(id));
        return newSet;
      });
    } else {
      toast.error(`Ошибка при удалении: ${result.error}`);
    }
  };

  return (
    <div className="w-full p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Заказы клиентов (Руководитель)</h1>
        <div className="flex items-center gap-4">
          {selectedOrders.size > 0 && (
            <button 
              onClick={() => openDeleteDialog(Array.from(selectedOrders))}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Удалить выбранное ({selectedOrders.size})
            </button>
          )}
          <Link href="/agent/customer-orders/create" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Создать заказ
          </Link>
        </div>
      </div>
      <Suspense fallback={<div className="text-center p-8">Загрузка заказов...</div>}>
        <ExpandableOrdersTable 
          orders={orders} 
          role="owner" 
          selectedOrders={selectedOrders}
          setSelectedOrders={setSelectedOrders}
          onDeleteOrder={(orderId) => openDeleteDialog([orderId])}
        />
      </Suspense>
      <ConfirmDialog 
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState({ isOpen: false, orderIds: [] })}
        onConfirm={confirmDelete}
        title="Подтвердите удаление"
        description={`Вы уверены, что хотите удалить ${dialogState.orderIds.length} заказ(ов)? Это действие необратимо.`}
      />
    </div>
  );
}
