'use client';

import { useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search } from 'lucide-react';
import Link from 'next/link';
import CustomerList from '@/app/manager/CustomerList';
import { getCustomers } from '@/app/clients/actions';
import type { CustomerInfo } from '@/lib/types';

export default function ManagerClientsPage() {
  const [customers, setCustomers] = useState<CustomerInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    async function fetchCustomers() {
      setIsLoading(true);
      try {
        const data = await getCustomers(debouncedSearchTerm);
        setCustomers(data);
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCustomers();
  }, [debouncedSearchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Клиенты</h1>
        <Link href="/manager/clients/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Добавить клиента
          </Button>
        </Link>
      </div>

      <div className="relative w-full max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Поиск клиентов..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <p>Загрузка...</p>
      ) : (
        <CustomerList customers={customers} />
      )}
    </div>
  );
}
