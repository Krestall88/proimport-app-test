'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import StatusBadge from '@/components/StatusBadge';
import { formatCurrency } from '@/app/utils/formatCurrency';
import { deletePurchaseOrder } from './actions';

interface PurchaseOrder {
  id: string;
  created_at: string;
  status: string;
  suppliers: { name: string } | { name: string }[] | null;
  purchase_order_items: {
    quantity_ordered: number;
    price_per_unit: number;
    products: { title: string } | { title: string }[] | null;
  }[];
}

interface PurchaseOrdersTableProps {
  orders: PurchaseOrder[];
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default function PurchaseOrdersTable({ orders }: PurchaseOrdersTableProps) {
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState<(() => void) | null>(null);
  const [dialogContent, setDialogContent] = useState({ title: '', description: '' });

  const handleDelete = (orderId: string) => {
    setDialogContent({
      title: 'Подтвердите удаление',
      description: 'Вы уверены, что хотите удалить эту заявку на поставку? Это действие необратимо.',
    });
    setActionToConfirm(() => () => {
      startTransition(async () => {
        const result = await deletePurchaseOrder(orderId);
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
    <>
      <div className="border rounded-lg w-full">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Дата</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Товар</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Поставщик</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Кол-во</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Сумма</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Статус</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Действия</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {orders?.map((order) => (
                order.purchase_order_items.map(item => {
                  const product = Array.isArray(item.products) ? item.products[0] : item.products;
                  const supplier = Array.isArray(order.suppliers) ? order.suppliers[0] : order.suppliers;

                  if (!product || !supplier) {
                    return null;
                  }

                  return (
                    <tr key={`${order.id}-${product.title}`} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <td className="p-4 align-middle whitespace-nowrap">{formatDate(order.created_at)}</td>
                      <td className="p-4 align-middle font-medium">{product.title}</td>
                      <td className="p-4 align-middle">{supplier.name}</td>
                      <td className="p-4 align-middle">{item.quantity_ordered}</td>
                      <td className="p-4 align-middle whitespace-nowrap">{formatCurrency(item.quantity_ordered * item.price_per_unit)}</td>
                      <td className="p-4 align-middle"><StatusBadge status={order.status} /></td>
                      <td className="p-4 align-middle">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(order.id)} disabled={isPending}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <ConfirmationDialog
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogContent.title}
        description={dialogContent.description}
        onConfirm={() => {
          if (actionToConfirm) {
            actionToConfirm();
          }
          setDialogOpen(false);
        }}
        isPending={isPending}
      />
    </>
  );
}
