'use server'

import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function createProduct(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login');
  }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'owner' && profile?.role !== 'warehouse_manager') {
    return redirect('/?message=Нет прав на создание товара.&type=error');
  }

  const name = formData.get('name') as string;
  const sku = (formData.get('sku') as string) || '';
  const payload = {
    title: name,
    nomenclature_code: sku || name || crypto.randomUUID(),
    description: (formData.get('description') as string) || '',
    category: (formData.get('category') as string) || '',
    unit: (formData.get('unit') as string) || '',
    purchase_price: formData.get('purchase_price') ? Number(formData.get('purchase_price')) : null,
  };

  if (!payload.title) {
    return redirect('/products/create?message=Название обязательно.&type=error');
  }

  const { error } = await supabase.from('products').insert(payload);
  if (error) {
    console.error('Error inserting product', error);
    return redirect('/products/create?message=Ошибка при добавлении.&type=error');
  }

  revalidatePath('/inventory');
  redirect('/inventory?message=Товар добавлен&type=success');
}

export async function createProductAction(productData: {
  title: string
  nomenclature_code: string
  purchase_price?: number

}) {
  'use server'

  // Эта проверка должна быть первой!
  if (!productData.title || !productData.nomenclature_code) {
    return { success: false, error: 'Название и артикул являются обязательными.' }
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Пользователь не авторизован.' }
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

    if (profile?.role !== 'owner' && profile?.role !== 'warehouse_manager') {
      return { success: false, error: 'У вас нет прав для создания товара.' }
    }

    // Создаем АДМИН КЛИЕНТ для обхода RLS. Это ключевой момент.
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: newProduct, error } = await supabaseAdmin
      .from('products')
      .insert({
        title: productData.title,
        nomenclature_code: productData.nomenclature_code,
        purchase_price: productData.purchase_price,
        // created_by: user.id, // Можно добавить, если есть такая колонка
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error in createProductAction:', error)
      return { success: false, error: `Ошибка базы данных: ${error.message}` }
    }

    revalidatePath('/manager/create-purchase-order')
    return { success: true, product: newProduct }

  } catch (e: any) {
    console.error('Unexpected server error in createProductAction:', e)
    return { success: false, error: 'Непредвиденная ошибка на сервере.' }
  }
}
