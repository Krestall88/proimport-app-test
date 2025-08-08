'use server';


import { createClient } from '@/lib/supabase/server';

export interface InventoryItem {
  product_id: string;
  product: {
    title: string;
    nomenclature_code: string;
    batch_number: string;
    expiry_date: string;
    unit: string;
    category: string;
    description: string;
  };
  available_quantity: number;
  final_price: number;
  purchase_price: number;
  total_received: number;
  total_reserved: number;
  characteristics: string;
}

/**
 * Fetches inventory with actual available quantities accounting for customer order reservations
 * This function provides real-time inventory data for all roles (agent, warehouse, manager)
 */
export async function getInventoryWithReservations(): Promise<InventoryItem[]> {

  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_inventory_with_reservations');

  if (error) {
    console.error('Error fetching inventory with reservations:', error);
    return [];
  }

  return (data ?? []).map((item: any) => ({
    product_id: item.product_id,
    product: {
      title: item.product_name,
      nomenclature_code: item.nomenclature_code ?? '',
      batch_number: item.batch_number,
      expiry_date: item.expiry_date,
      unit: item.unit,
      category: item.category,
      description: item.description,
    },
    available_quantity: item.available_quantity,
    final_price: item.final_price,
    purchase_price: item.purchase_price,
    total_received: item.total_received,
    total_reserved: item.total_reserved,
    characteristics: item.characteristics,
  }));
}

/**
 * Fetches inventory for agent view (customer order creation)
 * Uses the new inventory view that accounts for reservations
 */
export async function getAgentInventory(): Promise<InventoryItem[]> {
  return getInventoryWithReservations();
}

/**
 * Fetches inventory for warehouse view
 * Uses the new inventory view that accounts for reservations
 */
export async function getWarehouseInventory(): Promise<InventoryItem[]> {
  return getInventoryWithReservations();
}

/**
 * Fetches inventory for manager view
 * Uses the new inventory view that accounts for reservations
 */
export async function getManagerInventory(): Promise<InventoryItem[]> {
  return getInventoryWithReservations();
}
