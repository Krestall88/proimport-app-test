import { getDriverOrders } from '@/lib/actions/driver-orders';
import DriverOrdersClient from './DriverOrdersClient';

export default async function DriverOrdersPage() {
  const orders = await getDriverOrders();
  return <DriverOrdersClient orders={orders} />;
}
