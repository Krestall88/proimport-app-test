'use client';

'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { PurchaseOrder } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { deletePurchaseOrder } from '@/app/purchase-orders/actions';

interface PendingOrdersTableProps {
  orders: PurchaseOrder[];
}

export default function PendingOrdersTable({ orders }: PendingOrdersTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dialogState, setDialogState] = useState({ isOpen: false, orderId: '' });

  const handleStartReceiving = (orderId: string) => {
    router.push(`/warehouse/receiving/${orderId}`);
  };

  const openDeleteDialog = (orderId: string) => {
    setDialogState({ isOpen: true, orderId });
  };

  const confirmDelete = () => {
    startTransition(async () => {
      const result = await deletePurchaseOrder(dialogState.orderId);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
      setDialogState({ isOpen: false, orderId: '' });
    });
  };

  return (
    <div className="border rounded-lg">
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState({ isOpen: false, orderId: '' })}
        onConfirm={confirmDelete}
        title="Подтвердите удаление"
        description="Вы уверены, что хотите удалить эту заявку на поставку? Это действие необратимо."
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Поставщик</TableHead>
            <TableHead>Ожидаемая дата</TableHead>
            <TableHead className="text-center">Позиций</TableHead>
            <TableHead className="text-center">Статус</TableHead>
            <TableHead className="text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.supplier?.name ?? 'N/A'}</TableCell>
              <TableCell>{order.expected_delivery_date ? new Date(order.expected_delivery_date).toLocaleDateString() : 'Не указана'}</TableCell>
              <TableCell className="text-center">{order.purchase_order_items.length}</TableCell>
              <TableCell className="text-center">
                <Badge variant={order.status === 'pending' ? 'default' : 'secondary'}>
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button onClick={() => handleStartReceiving(order.id)} size="sm" disabled={isPending}>
                  Начать приёмку
                </Button>
                <Button variant="destructive" size="icon" onClick={() => openDeleteDialog(order.id)} disabled={isPending}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
