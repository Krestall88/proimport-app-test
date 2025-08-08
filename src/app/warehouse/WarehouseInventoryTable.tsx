"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { BatchInventoryItem } from '@/lib/types';

interface WarehouseInventoryTableProps {
  inventory: BatchInventoryItem[];
}

export default function WarehouseInventoryTable({ inventory }: WarehouseInventoryTableProps) {
  if (!inventory || inventory.length === 0) {
    return <p>Нет данных об остатках на складе.</p>;
  }

  return (
    <Table className="min-w-full text-xs">
      <TableHeader>
        <TableRow>
          <TableHead>Наименование</TableHead>
          <TableHead>Описание</TableHead>
          <TableHead>Артикул</TableHead>
          <TableHead>Категория</TableHead>
          <TableHead>Партия</TableHead>
          <TableHead>Срок годности</TableHead>
          <TableHead className="text-right">Остаток</TableHead>
          <TableHead>Ед.изм.</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {inventory.map((item, idx) => (
          <TableRow key={item.product.sku + '_' + idx}>
            <TableCell className="font-medium">{item.product.title}</TableCell>
            <TableCell>{item.product.description ? item.product.description : '-'}</TableCell>
            <TableCell>{item.product.sku}</TableCell>
            <TableCell>{item.product.category ?? '-'}</TableCell>
            <TableCell>{item.product.batch_number ?? '-'}</TableCell>
            <TableCell>{item.product.expiry_date ? new Date(item.product.expiry_date).toLocaleDateString() : '-'}</TableCell>
            <TableCell className="text-right">{item.available_quantity}</TableCell>
            <TableCell>{item.product.unit ?? '-'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
