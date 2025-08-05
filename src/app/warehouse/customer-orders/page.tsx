"use client";
import WarehouseOrdersTable from '../components/WarehouseOrdersTable';
import { mapCustomerOrdersToWarehouseOrders } from '../components/warehouseOrdersAdapter';
import { useWarehouseOrders } from '../components/useWarehouseOrders';

export default function CustomerOrdersPage() {
  const { orders, isLoading } = useWarehouseOrders();
  const flatOrders = mapCustomerOrdersToWarehouseOrders(orders || []);
  return (
    <WarehouseOrdersTable orders={flatOrders} loading={isLoading} />
  );
}
