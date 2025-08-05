'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ProductTable from '@/components/ProductTable';
import { useUserRole } from '@/components/UserRoleContext';

interface InventoryProps {
  inventory: any[]; // Replace 'any' with a proper type later
}

export default function Inventory({ inventory }: InventoryProps) {
  const { role } = useUserRole();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Остатки по складу</CardTitle>
        <CardDescription>Текущие остатки товаров на складе.</CardDescription>
      </CardHeader>
      <CardContent>
        <ProductTable role={role} />
      </CardContent>
    </Card>
  );
}
