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
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

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

  const handleExport = (order: PurchaseOrder) => {
    // 1. Информация о поставщике
    const supplierInfo = [
      ['Поставщик:', order.supplier?.name ?? ''],
      ['Телефон:', order.supplier?.contacts?.phone ?? ''],
      ['Email:', order.supplier?.contacts?.email ?? ''],
      ['Адрес доставки:', order.supplier?.delivery_address ?? ''],
      [], // Пустая строка для отступа
      ['Номер заказа на поставку:', order.id],
      ['Ожидаемая дата поставки:', order.expected_delivery_date ? format(new Date(order.expected_delivery_date), 'dd.MM.yyyy') : ''],
      [], // Пустая строка для отступа
    ];

    // 2. Заголовки таблицы товаров
    const itemHeaders = [
      'Артикул',
      'Название товара',
      'Описание',
      'Категория',
      'Цена закупки',
      'Количество',
      'Единица измерения',
      'Общая сумма закупки по позиции',
    ];

    // 3. Данные о товарах и расчет сумм
    let totalOrderSum = 0;
    const itemsData = order.purchase_order_items.map(item => {
      const price = item.price_per_unit ?? 0;
      const quantity = item.quantity_ordered;
      const itemTotal = price * quantity;
      totalOrderSum += itemTotal;
      return [
        item.product?.nomenclature_code ?? '',
        item.product?.title ?? '',
        item.product?.description ?? '',
        item.product?.category ?? '',
        price,
        quantity,
        item.product?.unit ?? '',
        itemTotal,
      ];
    });

    // 4. Строка с итоговой суммой
    const totalRow = [
      '', '', '', '', '', '', 'Общая сумма всего заказа:', totalOrderSum
    ];

    // 5. Сборка всех данных в один массив
    const exportData = [
      ...supplierInfo,
      itemHeaders,
      ...itemsData,
      [], // Пустая строка
      totalRow
    ];

    // 6. Создание листа Excel
    const ws = XLSX.utils.aoa_to_sheet(exportData);

    // 7. Настройка ширины колонок
    ws['!cols'] = [
      { wch: 20 }, // Артикул
      { wch: 40 }, // Название товара
      { wch: 50 }, // Описание
      { wch: 25 }, // Категория
      { wch: 15 }, // Цена закупки
      { wch: 15 }, // Количество
      { wch: 20 }, // Единица измерения
      { wch: 30 }, // Общая сумма
    ];

    // 8. Создание книги и скачивание
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Заявка на поставку');
    XLSX.writeFile(wb, `Заявка_на_поставку_${order.id}.xlsx`);
  };

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
                    <span className="text-sm text-muted-foreground ml-4">
                      Поставщик: {order.supplier?.name ?? 'Неизвестно'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground mr-4">
                      Ожидается: {order.expected_delivery_date ? new Date(order.expected_delivery_date).toLocaleDateString() : '—'}
                    </span>
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
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExport(order);
                      }}
                      disabled={isPending}
                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                      title="Сохранить в Excel"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
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
                          <TableCell>{item.product?.nomenclature_code ?? '—'}</TableCell>
                          <TableCell>{item.product?.title ?? '—'}</TableCell>
                          <TableCell>{item.product?.description ?? 'Нет описания'}</TableCell>
                          <TableCell>{item.product?.category ?? 'N/A'}</TableCell>
                          <TableCell className="text-right">{item.quantity_ordered}</TableCell>
                          <TableCell>{item.product?.unit ?? '—'}</TableCell>
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
