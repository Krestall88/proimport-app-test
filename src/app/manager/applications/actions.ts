"use server";
import { createClient } from "@/lib/supabase/server";

export async function deleteApplication(applicationId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('customer_applications')
    .delete()
    .eq('id', applicationId);

  if (error) {
    return { success: false, message: `Ошибка при удалении заявки: ${error.message}` };
  }

  return { success: true, message: 'Заявка успешно удалена.' };
}
