// This file defines the shared types for inventory items to ensure consistency across the application.

export interface InventoryProduct {
  product_id: string;
  title: string; // Наименование
  description: string; // Описание
  category: string; // Категория
  unit: string; // Единица измерения
  nomenclature_code: string; // Артикул
  batch_number: string; // Номер партии
  expiry_date?: string; // Срок годности
  available_quantity: number; // Доступное количество
  final_price: number; // Цена
}

// Универсальный тип для wishlist/cart, всегда содержит qty и comment
export interface WishlistItem extends InventoryProduct {
  qty: number;
  comment?: string;
  // Для совместимости с продуктами, где используется product_name
  product_name?: string;
}
