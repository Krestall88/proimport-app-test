import { useState } from 'react';
import { TableRow, TableCell, Table, TableHeader, TableHead, TableBody } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { OrderRowExpandIcon } from './OrderRowExpandIcon';

import type { WarehouseOrderItem } from '@/lib/types';

export function OrderExpandableRow({ order, onConfirmPicking }: { order: WarehouseOrderItem, onConfirmPicking: (orderId: string) => Promise<void> }) {
  const [expanded, setExpanded] = useState(false);
  const isDisabled = order.status === 'picking' || order.status === 'ready_for_shipment' || order.status === 'shipped';

  return (
    <>
      <TableRow
        style={{ cursor: 'pointer' }}
        onClick={() => setExpanded((v) => !v)}
      >
        <TableCell style={{ width: 32 }}>
          <OrderRowExpandIcon expanded={expanded} />
        </TableCell>
        <TableCell className="font-medium">{(order.order_item_id ? String(order.order_item_id) : '').substring(0, 8) || <span style={{color: 'red'}}>нет ID</span>}</TableCell>
        <TableCell>{order.customer_name ?? order.customer?.name ?? ''}</TableCell>
        <TableCell>{order.created_at ? new Date(order.created_at).toLocaleDateString() : ''}</TableCell>
        <TableCell>{order.status ?? ''}</TableCell>
        <TableCell>
          <form
            action={async (formData) => {
              const orderId = order.order_item_id;
              await onConfirmPicking(orderId);
            }}
            onClick={e => e.stopPropagation()}
          >
            <input type="hidden" name="orderId" value={order.order_item_id} />
            <Button
              variant="outline"
              size="sm"
              type="submit"
              disabled={isDisabled}
            >
              {isDisabled ? 'Собрано' : 'Подтвердить сборку'}
            </Button>
          </form>
        </TableCell>
      </TableRow>
      {expanded && (
        <TableRow>
          <TableCell colSpan={8}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Наименование</TableHead>
                  <TableHead>Артикул</TableHead>
                  <TableHead>Описание</TableHead>
                  <TableHead>Категория</TableHead>
                  
                  <TableHead>Кол-во</TableHead>
                  <TableHead>Ед. изм.</TableHead>
                  <TableHead>Цена за ед.</TableHead>
                  <TableHead>Общая цена</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>{order.product?.title ?? ''}</TableCell>
                  <TableCell>{order.product?.nomenclature_code ?? ''}</TableCell>
                  <TableCell>{order.product?.description ?? ''}</TableCell>
                  <TableCell>{order.product?.category ?? ''}</TableCell>
                  
                  <TableCell>{order.quantity ?? ''}</TableCell>
                  <TableCell>{order.product?.unit ?? ''}</TableCell>
                  <TableCell>{order.price_per_unit ?? ''}</TableCell>
                  <TableCell>{(order.price_per_unit * order.quantity).toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
