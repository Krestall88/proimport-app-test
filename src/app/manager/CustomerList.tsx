import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CustomerInfo } from '@/lib/types';

interface CustomerListProps {
  customers: CustomerInfo[];
}

export default function CustomerList({ customers }: CustomerListProps) {
  if (!customers || customers.length === 0) {
    return <p>Клиенты не найдены.</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {customers.map((customer) => (
        <Link href={`/manager/clients/${customer.customer_id}`} key={customer.customer_id}>
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader>
              <CardTitle>{customer.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm text-muted-foreground">
                {customer.tin && <p>ИНН: {customer.tin}</p>}
                {customer.kpp && <p>КПП: {customer.kpp}</p>}
                {customer.contacts?.phone && <p>Телефон: {customer.contacts.phone}</p>}
                {customer.contacts?.email && <p>Email: {customer.contacts.email}</p>}
                {customer.delivery_address && <p>Адрес доставки: {customer.delivery_address}</p>}
                {customer.payment_terms && <p>Условия оплаты: {customer.payment_terms}</p>}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
