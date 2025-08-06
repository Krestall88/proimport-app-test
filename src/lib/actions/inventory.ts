'use server';


import { createClient } from '@/lib/supabase/server';

export interface InventoryItem {
  product_id: string;
  batch_number: string;
  expiry_date: string;
  description: string;
  characteristics: string;
  total_received: number;
  total_reserved: number;
  available_quantity: number;
  product_name: string;
  sku: string;
  unit: string;
  category: string;
  final_price: number;
  purchase_price: number;
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

  return data || [];
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
