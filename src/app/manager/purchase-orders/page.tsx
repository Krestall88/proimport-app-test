import { getPurchaseOrdersForManager } from '@/lib/actions/manager';
import PendingOrdersTable from '@/app/warehouse/PendingOrdersTable';

export default async function ManagerPurchaseOrdersPage() {
  const pendingOrders = await getPurchaseOrdersForManager();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold tracking-tight">Ожидаемые поставки</h3>
        <p className="text-sm text-muted-foreground">
          Список всех заказов на поставку, ожидающих приёмки на склад.
        </p>
      </div>
      <PendingOrdersTable orders={pendingOrders} />
    </div>
  );
}
