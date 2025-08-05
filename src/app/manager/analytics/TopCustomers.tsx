import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { TopCustomer } from '@/lib/types';

interface TopCustomersProps {
  data: TopCustomer[];
}

import { formatCurrency } from '@/app/utils/formatCurrency';

export default function TopCustomers({ data }: TopCustomersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Топ-5 клиентов по выручке</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-8">
        {data.map((customer) => (
          <div className="flex items-center gap-4" key={customer.name}>
            <Avatar className="hidden h-9 w-9 sm:flex">
              <AvatarFallback>{customer.initial}</AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <p className="text-sm font-medium leading-none">{customer.name}</p>
            </div>
            <div className="ml-auto font-medium">{formatCurrency(customer.revenue)}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
