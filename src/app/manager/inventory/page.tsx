import { getInventoryForManager } from '@/lib/actions/manager';
import InventoryTable from '@/app/manager/InventoryTable';
import type { ManagerInventoryItem } from '@/lib/types';

export default async function InventoryPage() {
  const inventory: ManagerInventoryItem[] = await getInventoryForManager();

  return (
    <div className="space-y-6">
      
      <InventoryTable inventory={inventory} loading={false} />
    </div>
  );
}
