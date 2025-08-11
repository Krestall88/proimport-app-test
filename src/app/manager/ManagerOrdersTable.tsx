"use client";
import React, { useState, useTransition } from "react";
import { formatCurrency } from "@/app/utils/formatCurrency";
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { deleteOrderItem, deleteOrderItems } from './actions';
import { toast } from 'sonner';

import type { ManagerOrderItem } from '@/lib/types';

interface ManagerOrdersTableProps {
  orders: ManagerOrderItem[];
  loading?: boolean;
}

const statusMap: Record<string, string> = {
  new: "Сборка",
  pending: "Сборка",
  picking: "Ожидает отгрузки",
  ready_for_shipment: "Ожидает отгрузки",
  picked: "Ожидает отгрузки",
  shipped: "Отгружен",
  delivered: "Отгружен",
};

export default function ManagerOrdersTable({ orders, loading }: ManagerOrdersTableProps) {
  const [isPending, startTransition] = useTransition();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState<(() => void) | null>(null);
  const [dialogContent, setDialogContent] = useState({ title: '', description: '' });
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedRows(orders.map(item => item.purchase_order_id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedRows(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    setDialogContent({
      title: 'Подтвердите удаление',
      description: `Вы уверены, что хотите удалить ${selectedRows.length} выбранных позиций? Это действие необратимо.`
    });
    setActionToConfirm(() => () => {
      startTransition(async () => {
        const result = await deleteOrderItems(selectedRows);
        if (result.success) {
          toast.success(result.message); 
          setSelectedRows([]);
        } else {
          toast.error(result.message);
        }
      });
    });
    setDialogOpen(true);
  };

  const handleDeleteRow = (id: string) => {
    setDialogContent({
      title: 'Подтвердите удаление',
      description: 'Вы уверены, что хотите удалить эту позицию? Это действие необратимо.'
    });
    setActionToConfirm(() => () => {
      startTransition(async () => {
        const result = await deleteOrderItem(id);
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      });
    });
    setDialogOpen(true);
  };

  return (
    <div>
      <ConfirmationDialog 
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={() => {
          if (actionToConfirm) {
            actionToConfirm();
          }
          setDialogOpen(false);
        }}
        title={dialogContent.title}
        description={dialogContent.description}
      />
      <div className="mb-4 overflow-x-auto">
        <Button 
          onClick={handleDeleteSelected} 
          disabled={selectedRows.length === 0 || isPending}
          variant="destructive"
        >
          Удалить выбранное ({selectedRows.length})
        </Button>
      </div>
      <div className="overflow-x-auto max-h-[600px] border rounded-lg bg-background">
        <table className="min-w-full text-xs whitespace-nowrap">
          <thead className="bg-muted">
            <tr>
              <th className="p-2 border">
                <Checkbox 
                  checked={selectedRows.length === orders.length && orders.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </th>
              <th className="p-2 border">Клиент</th>
              <th className="p-2 border">Дата заказа</th>
              <th className="p-2 border">Дата отгрузки</th>
              <th className="p-2 border">Статус</th>
              <th className="p-2 border">Товар</th>
              <th className="p-2 border">Описание</th>
              <th className="p-2 border">Артикул</th>
              <th className="p-2 border">Партия</th>
              <th className="p-2 border">Срок годности</th>
              <th className="p-2 border">Кол-во</th>
              <th className="p-2 border">Закупочная цена</th>
              <th className="p-2 border">Цена продажи</th>
              <th className="p-2 border">Сумма</th>
              <th className="p-2 border">Действия</th>
            </tr>
          </thead> 
          <tbody>
            {loading ? (
              <tr><td colSpan={15} className="text-center p-4">Загрузка...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={15} className="text-center p-4">Нет заказов для отображения.</td></tr>
            ) : (
              orders.map((item) => (
                <tr key={item.order_item_id} className="border-b align-top" data-state={selectedRows.includes(item.order_item_id) ? 'selected' : ''}>
                  <td className="p-2 border">
                    <Checkbox 
                      checked={selectedRows.includes(item.order_item_id)}
                      onCheckedChange={() => handleSelectRow(item.order_item_id)}
                    />
                  </td>
                  <td className="p-2 border font-medium">{item.customer_name}</td>
                  <td className="p-2 border">{new Date(item.created_at).toLocaleDateString()}</td>
                  <td className="p-2 border">{item.shipped_at ? new Date(item.shipped_at).toLocaleDateString() : '—'}</td>
                  <td className="p-2 border">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.status === 'new' || item.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : item.status === 'shipped' || item.status === 'delivered'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {statusMap[item.status] || item.status}
                    </span>
                  </td>
                  <td className="p-2 border">{item.product?.title ?? 'Название не найдено'}</td>
                  <td className="p-2 border">{item.product?.description ?? 'без описания'}</td>
                  <td className="p-2 border">{item.product?.nomenclature_code ?? 'Артикул не найден'}</td>
                  <td className="p-2 border">{item.product?.batch_number ?? '-'}</td>
                  <td className="p-2 border">{item.product?.expiry_date ? new Date(item.product.expiry_date).toLocaleDateString() : '—'}</td>
                  <td className="p-2 border">{item.available_quantity} {item.product?.unit ?? ''}</td>
                  <td className="p-2 border">{formatCurrency(item.purchase_price)}</td>
                  <td className="p-2 border">{formatCurrency(item.final_price)}</td>
                  <td className="p-2 border">{formatCurrency(item.item_total)}</td>
                  <td className="p-2 border">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRow(item.order_item_id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
