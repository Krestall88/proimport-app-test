import { getInventoryForManager } from '@/lib/actions/manager';
import InventoryTable from '@/app/manager/InventoryTable';
import type { ManagerInventoryItem } from '@/lib/types';

export default async function InventoryPage() {
  const inventory: ManagerInventoryItem[] = await getInventoryForManager();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold tracking-tight">Остатки на складе</h3>
        <p className="text-sm text-muted-foreground">
          Просмотр текущих остатков товаров на складе.
        </p>
      </div>
      <InventoryTable inventory={inventory} />
    </div>
  );
}
