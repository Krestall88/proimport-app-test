import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SupplierInfo {
  id: string;
  name: string;
  tin?: string;
  kpp?: string;
  contacts?: { phone?: string; email?: string };
  delivery_address?: string;
  payment_terms?: string;
}

interface SupplierListProps {
  suppliers: SupplierInfo[];
}

export default function SupplierList({ suppliers }: SupplierListProps) {
  if (!suppliers || suppliers.length === 0) {
    return <p>Поставщики не найдены.</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {suppliers.map((supplier) => (
        <Link href={`/manager/suppliers/${supplier.id}`} key={supplier.id}>
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader>
              <CardTitle>{supplier.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm text-muted-foreground">
                {supplier.tin && <p>ИНН: {supplier.tin}</p>}
                {supplier.kpp && <p>КПП: {supplier.kpp}</p>}
                {supplier.contacts?.phone && <p>Телефон: {supplier.contacts.phone}</p>}
                {supplier.contacts?.email && <p>Email: {supplier.contacts.email}</p>}
                {supplier.delivery_address && <p>Адрес доставки: {supplier.delivery_address}</p>}
                {supplier.payment_terms && <p>Условия оплаты: {supplier.payment_terms}</p>}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
