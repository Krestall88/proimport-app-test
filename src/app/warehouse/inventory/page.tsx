import WarehouseInventoryTable from '@/app/warehouse/WarehouseInventoryTable';
import CreateProductModal from '@/components/CreateProductModal';

import { getInventory } from '@/lib/actions/warehouse';

export default async function WarehouseProductsPage() {
  const inventory = await getInventory();

  return (
    <div className="container mx-auto p-4">

      <WarehouseInventoryTable inventory={inventory} />
    </div>
  );
}
