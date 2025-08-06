'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// NOTE: The 'invoices' table does not exist in the current database schema
// This code is commented out until the table is created
/*
export async function createInvoice(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'accountant') {
    return redirect('/?message=У вас нет прав для создания счетов.&type=error');
  }

  const orderId = formData.get('orderId') as string;
  const totalAmount = parseFloat(formData.get('totalAmount') as string);

  if (!orderId || isNaN(totalAmount)) {
    return redirect(`/agent/customer-orders/${orderId}?message=Ошибка: неверные данные для создания счета.&type=error`);
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30); // Due in 30 days

  const { data: newInvoice, error } = await supabase
    .from('invoices')
    .insert({
      order_id: orderId,
      total_amount: totalAmount,
      due_date: dueDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating invoice:', error);
    if (error.code === '23505') {
         return redirect(`/agent/customer-orders/${orderId}?message=Счет для этого заказа уже существует.&type=error`);
    }
    return redirect(`/agent/customer-orders/${orderId}?message=Не удалось создать счет: ${error.message}&type=error`);
  }

  revalidatePath(`/agent/customer-orders/${orderId}`);
  revalidatePath('/'); // For accountant dashboard
  
  if (newInvoice) {
    redirect(`/invoices/${newInvoice.id}?message=Счет успешно создан.&type=success`);
  } else {
    redirect(`/agent/customer-orders/${orderId}?message=Счет создан, но не удалось получить ID.&type=warning`);
  }
}
*/
