import { createProduct } from './actions';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function CreateProductPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'owner' && profile?.role !== 'warehouse_manager') {
    redirect('/?message=Нет доступа&type=error');
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Добавить новый товар</h1>
      <form action={createProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1">
          Название*
          <input name="name" required className="p-2 rounded bg-gray-700 border border-gray-600" />
        </label>
        <label className="flex flex-col gap-1">
          SKU
          <input name="sku" className="p-2 rounded bg-gray-700 border border-gray-600" />
        </label>
        <label className="flex flex-col gap-1">
          Категория
          <input name="category" className="p-2 rounded bg-gray-700 border border-gray-600" />
        </label>
        <label className="flex flex-col gap-1">
          Ед. изм.
          <input name="unit" className="p-2 rounded bg-gray-700 border border-gray-600" />
        </label>
        <label className="flex flex-col gap-1">
          Цена закупки
          <input type="number" step="0.01" name="purchase_price" className="p-2 rounded bg-gray-700 border border-gray-600" />
        </label>
        <label className="flex flex-col gap-1">
          Срок годности
          <input type="date" name="expiration_date" className="p-2 rounded bg-gray-700 border border-gray-600" />
        </label>
        <label className="flex flex-col gap-1 md:col-span-2">
          Место хранения
          <input name="storage_place" className="p-2 rounded bg-gray-700 border border-gray-600" />
        </label>
        <label className="flex flex-col gap-1 md:col-span-2">
          Штрих-код
          <input name="barcode" className="p-2 rounded bg-gray-700 border border-gray-600" />
        </label>
        <label className="flex flex-col gap-1 md:col-span-2">
          Описание / комментарий
          <textarea name="comment" rows={3} className="p-2 rounded bg-gray-700 border border-gray-600" />
        </label>
        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded md:col-span-2">Сохранить</button>
      </form>
    </div>
  );
}
