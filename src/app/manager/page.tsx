import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import ManagerClientPage from './ManagerClientPage';
import type { Product } from '@/lib/types';

export default async function ManagerPage() {
  const supabase = await createClient();

  const { data: productsData, error } = await supabase.from('products').select('*');

  if (error) {
    console.error('Error fetching products:', error);
    return <div>Ошибка при загрузке данных. Пожалуйста, попробуйте позже.</div>;
  }

  const initialProducts: Product[] = (productsData ?? []).map((p: any) => ({
    ...p,
    description: p.description ?? '',
  }));

  return <ManagerClientPage initialProducts={initialProducts} />;
}
