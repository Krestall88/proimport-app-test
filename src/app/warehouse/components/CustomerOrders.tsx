'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useState } from 'react';
import { OrderRowExpandIcon } from './OrderRowExpandIcon';
import { OrderExpandableRow } from './OrderExpandableRow';

import type { WarehouseOrderItem } from '@/lib/types';

interface CustomerOrdersProps {
  customerOrders: WarehouseOrderItem[];
  onConfirmPicking: (orderId: string) => Promise<void>;
}

export default function CustomerOrders({ customerOrders, onConfirmPicking }: CustomerOrdersProps) {
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
              <TableHead style={{ width: 32 }}></TableHead>
              <TableHead>ID Заказа</TableHead>
              <TableHead>Клиент</TableHead>
              <TableHead>Дата создания</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
  
        <TableBody>
          {customerOrders.map((order) => (
            <OrderExpandableRow key={order.order_item_id} order={order} onConfirmPicking={onConfirmPicking} />
          ))}
        </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
