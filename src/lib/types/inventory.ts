// This file defines the shared types for inventory items to ensure consistency across the application.

export interface InventoryProduct {
  product_id: string;
  name: string;
  sku: string;
  available_quantity: number; // Standardized field for available stock
  expiry_date?: string | null;
  description?: string | null;
  batch_number?: string;
  unit?: string | null;
  final_price: number;
}
