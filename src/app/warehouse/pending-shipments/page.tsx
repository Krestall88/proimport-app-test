import { getPurchaseOrders } from '@/lib/actions/warehouse';
import PendingShipments from '../components/PendingShipments';

export default async function PendingShipmentsPage() {
  const purchaseOrders = await getPurchaseOrders();

  return <PendingShipments purchaseOrders={purchaseOrders || []} />;
}
