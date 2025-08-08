'use client';

import React, { useState, useTransition } from "react";
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { deleteInventoryRecord, deleteInventoryRecords, type InventoryGroupKey } from './actions';
import type { ManagerInventoryItem } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/app/utils/formatCurrency';

interface InventoryTableProps {
  inventory: ManagerInventoryItem[];
  loading: boolean;
}

export default function InventoryTable({ inventory, loading }: InventoryTableProps) {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [dialogState, setDialogState] = useState({ isOpen: false, recordIds: [] as string[] });

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedRows(inventory.map(item => item.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedRows(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const openDeleteDialog = (recordIds: string[]) => {
    setDialogState({ isOpen: true, recordIds });
  };

    const confirmDelete = () => {
    startTransition(async () => {
      const { recordIds } = dialogState;

      const groupsToDelete: InventoryGroupKey[] = recordIds.map(id => {
        const item = inventory.find(invItem => invItem.id === id);
        return {
          productId: item!.product.title,
          batchNumber: item!.product.batch_number,
          expiryDate: item!.product.expiry_date,
        };
      });

      if (groupsToDelete.some(g => !g.productId)) {
        toast.error('Ошибка: Не удалось определить товар для удаления.');
        return;
      }

      const result = groupsToDelete.length > 1
        ? await deleteInventoryRecords(groupsToDelete)
        : await deleteInventoryRecord(groupsToDelete[0]);

      if (result.success) {
        toast.success(result.message);
        setSelectedRows(prev => prev.filter(id => !recordIds.includes(id)));
        setDialogState({ isOpen: false, recordIds: [] });
      } else {
        toast.error(result.message);
      }
    });
  };

  if (loading) {
    return <p>Загрузка данных...</p>;
  }

  if (!inventory || inventory.length === 0) {
    return <p>Нет данных об остатках на складе.</p>;
  }

  return (
    <div>
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState({ isOpen: false, recordIds: [] })}
        onConfirm={confirmDelete}
        title="Подтвердите удаление"
        description={`Вы уверены, что хотите удалить ${dialogState.recordIds.length} запись(ей)? Это действие необратимо.`}
      />
      <div className="mb-4">
        <Button 
          onClick={() => openDeleteDialog(selectedRows)} 
          disabled={selectedRows.length === 0 || isPending}
          variant="destructive"
        >
          Удалить выбранное ({selectedRows.length})
        </Button>
      </div>
      <div className="overflow-auto max-h-[600px] border rounded-lg bg-background">
        <Table className="min-w-full text-xs">
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox 
                  checked={selectedRows.length > 0 && selectedRows.length === inventory.length}
                  onCheckedChange={handleSelectAll}
                  aria-label="Выбрать все"
                />
              </TableHead>
              <TableHead>Артикул</TableHead>
              <TableHead>Название</TableHead>
              <TableHead>Описание</TableHead>
              <TableHead>Категория</TableHead>
              <TableHead>Партия</TableHead>
              <TableHead>Срок годности</TableHead>
              <TableHead className="text-right">Остаток</TableHead>
              <TableHead>Ед. изм.</TableHead>
              <TableHead className="text-right">Цена закупки</TableHead>
              <TableHead className="text-right">Финальная цена</TableHead>
              <TableHead className="text-right">Сумма (закупка)</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Checkbox 
                    checked={selectedRows.includes(item.id)}
                    onCheckedChange={() => handleSelectRow(item.id)}
                    aria-label={`Выбрать строку ${item.id}`}
                  />
                </TableCell>
                <TableCell>{item.product?.sku ?? '-'}</TableCell>
                <TableCell className="font-medium">{item.product?.title ?? '-'}</TableCell>
                <TableCell>{item.product?.description ?? '-'}</TableCell>
                <TableCell>{item.product?.category ?? '-'}</TableCell>
                <TableCell>{item.product?.batch_number ?? '-'}</TableCell>
                <TableCell>{item.product?.expiry_date ? format(new Date(item.product.expiry_date), 'dd.MM.yyyy') : '-'}</TableCell>
                <TableCell className="text-right">{item.available_quantity}</TableCell>
                <TableCell>{item.product?.unit ?? '-'}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.purchase_price)}</TableCell>
                <TableCell className="text-right font-semibold">{formatCurrency(item.final_price)}</TableCell>
                <TableCell className="text-right font-bold">{formatCurrency(item.purchase_price * item.available_quantity)}</TableCell>
                <TableCell className="text-right font-bold">{formatCurrency(item.purchase_price * item.available_quantity)}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => openDeleteDialog([item.id])} disabled={isPending}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
