'use client';

import React, { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { WarehouseOrderItem } from '@/lib/types';

interface CustomerOrdersProps {
  customerOrders: WarehouseOrderItem[];
  onConfirmPicking: (orderId: string) => Promise<void>;
}

const statusMap: Record<string, string> = {
  new: "Ожидает сборки",
  picking: "В процессе сборки",
  ready_for_shipment: "Готов к отгрузке",
  shipped: "Отгружен",
  delivered: "Доставлен",
};

export default function CustomerOrders({ customerOrders, onConfirmPicking }: CustomerOrdersProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

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

  const handleConfirmPicking = (orderId: string) => {
    startTransition(async () => {
      await onConfirmPicking(orderId);
    });
  };

  const grouped = customerOrders.reduce((acc, item) => {
    acc[item.purchase_order_id] = acc[item.purchase_order_id] || { ...item, items: [] };
    acc[item.purchase_order_id].items.push(item);
    return acc;
  }, {} as Record<string, WarehouseOrderItem & { items: WarehouseOrderItem[] }>);

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

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Неверная дата' : date.toLocaleString('ru-RU');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Заказы клиентов</CardTitle>
        <CardDescription>Заказы, которые необходимо собрать и отправить.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>ID Заказа</TableHead>
              <TableHead>Клиент</TableHead>
              <TableHead>Дата создания</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groupedOrders.map((order) => (
              <React.Fragment key={order.purchase_order_id}>
                <TableRow onClick={() => toggleRow(order.purchase_order_id)} className="cursor-pointer">
                  <TableCell>
                    {expandedRows.has(order.purchase_order_id) ? <ChevronDown /> : <ChevronRight />}
                  </TableCell>
                  <TableCell className="font-medium">{(order.purchase_order_id || '').substring(0, 8)}</TableCell>
                  <TableCell>{order.customer_name}</TableCell>
                  <TableCell>{formatDate(order.created_at)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${order.status === 'new' ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'}`}>
                      {statusMap[order.status] || order.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isPending || order.status !== 'new'}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        handleConfirmPicking(order.purchase_order_id); 
                      }}
                    >
                      {order.status === 'new' ? 'Начать сборку' : 'Сборка начата'}
                    </Button>
                  </TableCell>
                </TableRow>
                {expandedRows.has(order.purchase_order_id) && (
                  <TableRow>
                    <TableCell colSpan={6} className="p-4 bg-muted/50">
                      <h4 className="font-bold mb-2 text-md">Состав заказа:</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Артикул</TableHead>
                            <TableHead>Товар</TableHead>
                            <TableHead>Кол-во</TableHead>
                            <TableHead>Ед. изм.</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {order.items.map(item => (
                            <TableRow key={item.order_item_id}>
                              <TableCell>{item.product?.nomenclature_code ?? '-'}</TableCell>
                              <TableCell>{item.product?.title ?? '-'}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>{item.product?.unit ?? '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
