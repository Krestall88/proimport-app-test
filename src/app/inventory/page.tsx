import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { InventoryListItem } from '@/lib/types';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

import { formatCurrency } from '@/app/utils/formatCurrency';

export default async function InventoryPage() {
  const supabase = createClient();

  const { data: products, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      description,
      sku,
      category,
      unit,
      purchase_price,
      expiration_date,
      storage_place,
      inventory:inventory_items (quantity, last_updated_at)
    `)
    .order('name')
    .returns<any[]>();

  if (error) {
    console.error('Error fetching inventory:', error);
    return <p>Не удалось загрузить данные инвентаря. Убедитесь, что таблицы 'products' и 'inventory_items' созданы.</p>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Инвентарь</h1>
        <Link href="/" className="text-sm hover:underline">
            На главную
        </Link>
      </div>

      <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-700">
                <tr>
                <th className="p-4">SKU</th>
                 <th className="p-4">Товар</th>
                 <th className="p-4">Категория</th>
                 <th className="p-4">Ед.</th>
                 <th className="p-4 text-center">Кол-во</th>
                 <th className="p-4">Цена</th>
                 <th className="p-4">Срок годности</th>
                 <th className="p-4">Место</th>
                 <th className="p-4 text-right">Обновлено</th>
                </tr>
            </thead>
            <tbody>
                {products?.map((p: any) => (
                <tr key={p.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                    <td className="p-4">{p.sku ?? '-'}</td>
                     <td className="p-4 font-medium">{p.name ?? 'N/A'}</td>
                     <td className="p-4">{p.category ?? '-'}</td>
                     <td className="p-4">{p.unit ?? '-'}</td>
                     <td className="p-4 text-center font-bold">{p.inventory?.[0]?.quantity ?? 0}</td>
                     <td className="p-4">{p.purchase_price ? formatCurrency(p.purchase_price) : '-'}</td>
                     <td className="p-4 whitespace-nowrap">{p.expiration_date ? formatDate(p.expiration_date) : '-'}</td>
                     <td className="p-4">{p.storage_place ?? '-'}</td>
                     <td className="p-4 text-right whitespace-nowrap">{p.inventory?.[0]?.last_updated_at ? formatDate(p.inventory[0].last_updated_at) : '-'}</td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
