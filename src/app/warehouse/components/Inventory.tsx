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
        {role === 'owner' || role === 'warehouse_manager' || role === 'agent' ? (
          <ProductTable
            role={role}
            products={Array.isArray(inventory) ? inventory.map((item) => ({
              // Маппинг минимальный, если inventory уже Product[] — просто item
              ...(item || {}),
              description: typeof item?.description === 'string' ? item.description : '',
              // TODO: добавить остальные обязательные поля Product, если нужно
            })) : []}
            onProductsChange={() => {}}
          />
        ) : (
          <div style={{ color: 'red' }}>
            Некорректная роль пользователя: {role}. Таблица товаров недоступна.
            {/* TODO: поддержка новых ролей, если потребуется */}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
