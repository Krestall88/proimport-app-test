"use client";
import WarehouseOrdersTable from '../components/WarehouseOrdersTable';
import { mapCustomerOrdersToWarehouseOrders } from '../components/warehouseOrdersAdapter';
import { useWarehouseOrders } from '../components/useWarehouseOrders';

export default function CustomerOrdersPage() {
  const { orders, isLoading } = useWarehouseOrders();
  return (
    <WarehouseOrdersTable orders={orders || []} loading={isLoading} />
  );
}
