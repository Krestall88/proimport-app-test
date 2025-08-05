'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateOrderStatus(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'warehouse_manager') {
    return redirect(`/agent/customer-orders?message=У вас нет прав для изменения статуса.&type=error`)
  }

  const orderId = formData.get('orderId') as string;
  const newStatus = formData.get('status') as string;

  if (!orderId || !newStatus) {
    return redirect(`/agent/customer-orders/${orderId}?message=Ошибка: ID заказа или статус не указаны.&type=error`)
  }

  const { error } = await supabase
    .from('customer_orders')
    .update({ status: newStatus })
    .eq('id', orderId)

  if (error) {
    console.error('Error updating order status:', error)
    return redirect(`/agent/customer-orders/${orderId}?message=Не удалось обновить статус заказа.&type=error`)
  }

  // Revalidate paths to ensure data is fresh across the app
  revalidatePath(`/agent/customer-orders/${orderId}`)
  revalidatePath('/') // For the dashboard
  revalidatePath('/agent/customer-orders') // For the orders list

  redirect(`/agent/customer-orders/${orderId}?message=Статус заказа успешно обновлен.&type=success`)
}

export async function uploadDeliveryPhoto(formData: FormData) {
  const supabase = await createClient();
  const orderId = formData.get('orderId') as string;
  const photoFile = formData.get('photo') as File;

  if (!orderId || !photoFile || photoFile.size === 0) {
    return redirect(`/agent/customer-orders/${orderId}?message=Файл не выбран.&type=error`);
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'driver') {
    return redirect(`/agent/customer-orders/${orderId}?message=У вас нет прав.&type=error`);
  }

  const fileName = `${orderId}/${Date.now()}-${photoFile.name}`;
  const { error: uploadError } = await supabase.storage
    .from('delivery_photos')
    .upload(fileName, photoFile);

  if (uploadError) {
    console.error('Error uploading photo:', uploadError);
    return redirect(`/agent/customer-orders/${orderId}?message=Ошибка загрузки фото.&type=error`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from('delivery_photos')
    .getPublicUrl(fileName);

  const { error: updateError } = await supabase
    .from('customer_orders')
    .update({ delivery_photo_url: publicUrl, status: 'delivered' })
    .eq('id', orderId);

  if (updateError) {
    console.error('Error updating order with photo URL:', updateError);
    return redirect(`/agent/customer-orders/${orderId}?message=Ошибка сохранения фото в заказе.&type=error`);
  }

  revalidatePath(`/agent/customer-orders/${orderId}`);
  revalidatePath('/');
  revalidatePath('/agent/customer-orders');

  redirect(`/agent/customer-orders/${orderId}?message=Фото доставки загружено, заказ отмечен как доставленный.&type=success`);
}
