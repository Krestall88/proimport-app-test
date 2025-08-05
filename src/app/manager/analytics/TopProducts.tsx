import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { TopProduct } from '@/lib/types';

interface TopProductsProps {
  data: TopProduct[];
}

import { formatCurrency } from '@/app/utils/formatCurrency';

export default function TopProducts({ data }: TopProductsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Топ-5 продаваемых товаров</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-8">
        {data.map((product, idx) => (
          <div className="flex items-center gap-4" key={product.id ?? product.name + '_' + product.initial + '_' + idx}>
            <Avatar className="hidden h-9 w-9 sm:flex">
              <AvatarFallback>{product.initial}</AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <p className="text-sm font-medium leading-none">{product.name}</p>
            </div>
            <div className="ml-auto font-medium">{formatCurrency(product.sales)}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
