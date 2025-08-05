import { useState } from 'react';
import { TableRow, TableCell, Table, TableHeader, TableHead, TableBody } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { OrderRowExpandIcon } from './OrderRowExpandIcon';

export function OrderExpandableRow({ order, onConfirmPicking }: { order: any, onConfirmPicking: (orderId: string) => Promise<void> }) {
  const [expanded, setExpanded] = useState(false);
  const isDisabled = order.status === 'picking' || order.status === 'ready_for_shipment' || order.status === 'shipped';

  return (
    <>
      <TableRow
        style={{ cursor: Array.isArray(order.order_items) && order.order_items.length > 0 ? 'pointer' : undefined }}
        onClick={() => {
          if (Array.isArray(order.order_items) && order.order_items.length > 0) setExpanded((v) => !v);
        }}
      >
        <TableCell style={{ width: 32 }}>
          {Array.isArray(order.order_items) && order.order_items.length > 0 ? <OrderRowExpandIcon expanded={expanded} /> : null}
        </TableCell>
        <TableCell className="font-medium">{order.id?.substring(0, 8) ?? ''}</TableCell>
        <TableCell>{order.customer_name ?? order.customer?.name ?? ''}</TableCell>
        <TableCell>{order.created_at ? new Date(order.created_at).toLocaleDateString() : ''}</TableCell>
        <TableCell>{order.status ?? ''}</TableCell>
        <TableCell>
          <form
            action={async (formData) => {
              const orderId = order.id;
              await onConfirmPicking(orderId);
            }}
            onClick={e => e.stopPropagation()}
          >
            <input type="hidden" name="orderId" value={order.id} />
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
        Array.isArray(order.order_items) && order.order_items.length > 0 ? (
          <TableRow>
            <TableCell colSpan={8}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Наименование</TableHead>
                    <TableHead>Артикул</TableHead>
                    <TableHead>Описание</TableHead>
                    <TableHead>Категория</TableHead>
                    <TableHead>Партия</TableHead>
                    <TableHead>Срок годности</TableHead>
                    <TableHead>Кол-во</TableHead>
                    <TableHead>Ед. изм.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.order_items.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.product && typeof item.product === 'object' ? (item.product.title ?? '-') : '-'}</TableCell>
                      <TableCell>{item.product && typeof item.product === 'object' ? (item.product.nomenclature_code ?? '-') : '-'}</TableCell>
                      <TableCell>{item.product && typeof item.product === 'object' ? (item.product.description ?? '-') : '-'}</TableCell>
                      <TableCell>{item.product && typeof item.product === 'object' ? (item.product.category ?? '-') : '-'}</TableCell>
                      <TableCell>{item.batch_number || item.goods_receipt_item?.batch_number || '-'}</TableCell>
                      <TableCell>{(item.expiry_date || item.goods_receipt_item?.expiry_date) ? new Date(item.expiry_date || item.goods_receipt_item?.expiry_date).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>{item.quantity ?? '-'}</TableCell>
                      <TableCell>{item.product && typeof item.product === 'object' ? (item.product.unit ?? '-') : '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableCell>
          </TableRow>
        ) : (
          <TableRow>
            <TableCell colSpan={8} className="text-center text-muted-foreground">Нет позиций в заказе</TableCell>
          </TableRow>
        )
      )}
    </>
  );
}
