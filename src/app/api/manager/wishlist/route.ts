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
      customer:customers(name),
      agent:profiles(full_name)
    `);
  if (error) {
    return NextResponse.json([], { status: 500 });
  }
  return NextResponse.json(data);
}
