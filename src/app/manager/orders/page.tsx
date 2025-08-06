"use client";
import { getCustomerOrdersForManager, ManagerOrdersFilters } from '@/lib/actions/manager';
import ManagerOrdersTable from '@/app/manager/ManagerOrdersTable';
import { getCustomers } from '@/lib/actions/manager';
import type { ManagerOrderItem } from '@/lib/types';
import { useEffect, useState } from "react";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<ManagerOrderItem[]>([]);
  const [customer, setCustomer] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<{ customer_id: string, name: string }[]>([]);

  // Загрузка уникальных поставщиков для фильтра
  useEffect(() => {
    async function fetchInitialData() {
      setLoading(true);
      const [allOrders, allCustomers] = await Promise.all([
        getCustomerOrdersForManager(),
        getCustomers()
      ]);
      setOrders(allOrders);
      setLoading(false);
      setCustomers([{ customer_id: "all", name: "Все клиенты" }, ...(allCustomers || [])]);
    }
    fetchInitialData();
  }, []);

  // Фильтр
  const handleFilter = async () => {
    setLoading(true);
    const filters: ManagerOrdersFilters & { customerId?: string } = {};
    if (customer && customer !== "all") filters.customerId = customer;
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;
    const filtered = await getCustomerOrdersForManager(filters);
    setOrders(filtered);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs mb-1">Клиент</label>
          <Select value={customer} onValueChange={setCustomer}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Все клиенты" />
            </SelectTrigger>
            <SelectContent>
              {customers.map(c => (
                <SelectItem key={c.customer_id} value={c.customer_id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-xs mb-1">С даты</label>
          <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-36" />
        </div>
        <div>
          <label className="block text-xs mb-1">По дату</label>
          <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-36" />
        </div>
        <Button onClick={handleFilter} disabled={loading} className="h-10">Применить фильтр</Button>
      </div>
      <ManagerOrdersTable orders={orders} loading={loading} />
    </div>
  );
}

