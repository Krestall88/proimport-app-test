import { createClient } from "@/lib/supabase/server";
import CreateCustomerOrderClient from "./CreateCustomerOrderClient";
import { cookies } from "next/headers";
import { InventoryProduct } from "@/lib/types/inventory"; // Using the shared type

// This is the Server Component that fetches data
export default async function CreateCustomerOrderPage() {
  const supabase = await createClient();

  // Using the dedicated RPC function to get available inventory
  const { data: rpcData, error } = await supabase.rpc(
    'get_inventory_with_reservations' as string
  );

  // The RPC function returns data that is already in the InventoryProduct shape.
  // We just need to handle potential null data from the RPC call.
  const inventoryData = rpcData || [];

  if (error) {
    console.error("Error fetching inventory:", error);
    return (
      <div className="container mx-auto p-4">
        
        <p className="text-red-500">Не удалось загрузить остатки. Попробуйте позже.</p>
      </div>
    );
  }

  // The data from RPC is already in the correct shape.
  const inventory: InventoryProduct[] = (inventoryData as any[]).map(item => ({
  ...item,
  unit: item.unit === null ? undefined : item.unit,
}));

  return (
    <div className="container mx-auto p-4">
      
      <CreateCustomerOrderClient inventory={inventory} />
    </div>
  );
}
