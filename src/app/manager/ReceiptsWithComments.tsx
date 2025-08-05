'use client';

import type { ManagerGoodsReceipt } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ReceiptsWithCommentsProps {
  receipts: ManagerGoodsReceipt[];
}

export default function ReceiptsWithComments({ receipts }: ReceiptsWithCommentsProps) {
  if (!receipts || receipts.length === 0) {
    return <p>Нет приёмок с комментариями.</p>;
  }

  return (
    <div className="space-y-4 max-h-[400px] overflow-y-auto">
      {receipts.map((receipt) => (
        <Card key={receipt.item_id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{receipt.product_title}</CardTitle>
            <CardDescription>
              Приёмка от {new Date(receipt.receipt_date).toLocaleDateString()} (Заказ #{receipt.purchase_order_id.substring(0, 8)})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <blockquote className="border-l-2 pl-4 italic">
              {receipt.comment}
            </blockquote>
            <p className="text-xs text-muted-foreground mt-2">Получено: {receipt.quantity_received} шт.</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
