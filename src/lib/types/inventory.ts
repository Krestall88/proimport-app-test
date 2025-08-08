// This file defines the shared types for inventory items to ensure consistency across the application.

export interface InventoryProduct {
  product_id: string;
  title: string; // вместо name
  nomenclature_code: string;
  available_quantity: number;
  expiry_date?: string | null;
  description: string; // теперь всегда строка, даже если поле пустое
  batch_number: string;
  unit: string;
  final_price: number;
  category: string;
}

// Универсальный тип для wishlist/cart, всегда содержит qty и comment
export interface WishlistItem extends InventoryProduct {
  qty: number;
  comment?: string;
  // Для совместимости с продуктами, где используется product_name
  product_name?: string;
}
