'use client';

import { GoodsReceiptForDashboard } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface ActiveReceiptsTableProps {
  receipts: GoodsReceiptForDashboard[];
}

export default function ActiveReceiptsTable({ receipts }: ActiveReceiptsTableProps) {
  const router = useRouter();

  const handleContinueReceiving = (receiptId: string) => {
    // TODO: Implement navigation to continue this specific receipt process
    console.log(`Navigating to continue receiving for receipt ${receiptId}`);
    // router.push(`/warehouse/receiving/continue/${receiptId}`);
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Поставщик</TableHead>
            <TableHead>Дата начала</TableHead>
            <TableHead className="text-center">Статус</TableHead>
            <TableHead className="text-right">Действие</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {receipts.map((receipt) => (
            <TableRow key={receipt.id}>
              <TableCell className="font-medium">{receipt.supplier_name ?? 'N/A'}</TableCell>
              <TableCell>{new Date(receipt.created_at).toLocaleDateString()}</TableCell>
              <TableCell className="text-center">
                <Badge variant="destructive">{receipt.status}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button onClick={() => handleContinueReceiving(receipt.id)} size="sm">
                  Продолжить
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
