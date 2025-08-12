import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  // Только для роли manager: можно добавить проверку auth
  const { data, error } = await supabase
    .from("customer_wishlist")
    .select(`
      id, 
      customer_id, 
      agent_id, 
      wishlist_items, 
      created_at, 
      updated_at,
      customer:customers!inner(name, contacts, tin, kpp, delivery_address, payment_terms),
      agent:profiles!inner(full_name)
    `);

  if (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}
