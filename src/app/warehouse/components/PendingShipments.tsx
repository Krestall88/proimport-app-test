'use client';

import { PurchaseOrder } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from 'sonner';
import { deletePurchaseOrder, deletePurchaseOrderItem } from '@/app/purchase-orders/actions';

interface PendingShipmentsProps {
  purchaseOrders: PurchaseOrder[];
}

export default function PendingShipments({ purchaseOrders }: PendingShipmentsProps) {
  const [isPending, startTransition] = useTransition();
  const [dialogState, setDialogState] = useState({ 
    isOpen: false, 
    orderId: '', 
    itemId: '', 
    action: 'deleteOrder' as 'deleteOrder' | 'deleteItem' 
  });

  const openDeleteOrderDialog = (orderId: string) => {
    setDialogState({ isOpen: true, orderId, itemId: '', action: 'deleteOrder' });
  };

  const openDeleteItemDialog = (itemId: string) => {
    setDialogState({ isOpen: true, orderId: '', itemId, action: 'deleteItem' });
  };

  const confirmDelete = () => {
    startTransition(async () => {
      let result;
      if (dialogState.action === 'deleteOrder') {
        result = await deletePurchaseOrder(dialogState.orderId);
      } else {
        result = await deletePurchaseOrderItem(dialogState.itemId);
      }
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
      setDialogState({ isOpen: false, orderId: '', itemId: '', action: 'deleteOrder' });
    });
  };

  return (
    <Card>
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState({ isOpen: false, orderId: '', itemId: '', action: 'deleteOrder' })}
        onConfirm={confirmDelete}
        title="Подтвердите удаление"
        description={
          dialogState.action === 'deleteOrder' 
            ? "Вы уверены, что хотите удалить эту заявку на поставку? Это действие необратимо."
            : "Вы уверены, что хотите удалить эту позицию из заявки на поставку? Это действие необратимо."
        }
      />
      <CardHeader>
        <CardTitle>Ожидаемые поставки</CardTitle>
        <CardDescription>Заказы, которые должны поступить на склад.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {purchaseOrders.map((order) => (
            <AccordionItem value={order.id} key={order.id}>
              <AccordionTrigger>
                <div className="flex justify-between items-center w-full pr-4">
                  <div className="text-left">
                    <span className="font-medium">Заказ №{order.id.substring(0, 8)}</span>
                    <span className="text-sm text-muted-foreground ml-4">Поставщик: {order.supplier.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground mr-4">Ожидается: {new Date(order.expected_delivery_date).toLocaleDateString()}</span>
                    <Badge variant="outline">{order.status}</Badge>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteOrderDialog(order.id);
                      }}
                      disabled={isPending}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      title="Удалить всю поставку"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="p-4 bg-muted/40 rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Номенклатурный код</TableHead>
                        <TableHead>Название</TableHead>
                        <TableHead>Описание</TableHead>
                        <TableHead>Категория</TableHead>
                        <TableHead className="text-right">Кол-во</TableHead>
                        <TableHead>Ед. изм.</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.purchase_order_items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.product.nomenclature_code}</TableCell>
                          <TableCell>{item.product.title}</TableCell>
                          <TableCell>{item.product?.description ?? 'Нет описания'}</TableCell>
                          <TableCell>{item.product?.category ?? 'N/A'}</TableCell>
                          <TableCell className="text-right">{item.quantity_ordered}</TableCell>
                          <TableCell>{item.product.unit}</TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={(e) => {
                                e.stopPropagation();
                                openDeleteItemDialog(item.id);
                              }}
                              disabled={isPending}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              title="Удалить позицию"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="text-right mt-4">
                    <Button asChild variant="outline">
                      <Link href={`/warehouse/receiving/${order.id}`}>Перейти к приёмке</Link>
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
