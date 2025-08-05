// This script is designed to be run with a tool like tsx.
// It populates the database with sample data for development and testing.
// Before running, ensure your .env.local file has the correct Supabase URL and a SERVICE_ROLE_KEY.

import { createClient } from '@supabase/supabase-js';

// --- Configuration ---
// IMPORTANT: These should be in your .env.local file.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL or Service Role Key is missing in .env.local');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// --- Sample Data ---

const suppliers = [
  { name: 'ООО "Продуктовый Мир"', contact_person: 'Иван Петров', phone: '+79001234567', email: 'ivan.p@prodmir.ru' },
  { name: 'АО "Свежие Фрукты"', contact_person: 'Анна Сидорова', phone: '+79007654321', email: 'anna.s@freshfruits.com' },
];

const products = [
  { name: 'Молоко "Домик в деревне" 3.2%', sku: 'MILK001', purchase_price: 70, selling_price: 90, category: 'Молочные продукты', unit: 'шт' },
  { name: 'Хлеб "Бородинский"', sku: 'BRD001', purchase_price: 40, selling_price: 55, category: 'Хлебобулочные изделия', unit: 'шт' },
  { name: 'Сыр "Российский"', sku: 'CHS001', purchase_price: 500, selling_price: 650, category: 'Сыры', unit: 'кг' },
  { name: 'Яблоки "Гренни Смит"', sku: 'APL001', purchase_price: 120, selling_price: 160, category: 'Фрукты', unit: 'кг' },
  { name: 'Картофель молодой', sku: 'POT001', purchase_price: 50, selling_price: 75, category: 'Овощи', unit: 'кг' },
  { name: 'Куриное филе "Петелинка"', sku: 'CHK001', purchase_price: 350, selling_price: 450, category: 'Мясо', unit: 'кг' },
  { name: 'Вода "Святой Источник" 5л', sku: 'WTR001', purchase_price: 80, selling_price: 110, category: 'Напитки', unit: 'шт' },
];

async function main() {
  console.log('Starting to seed the database...');

  // 1. Seed Suppliers
  const { data: seededSuppliers, error: supplierError } = await supabase.from('suppliers').upsert(suppliers).select();
  if (supplierError) throw new Error(`Failed to seed suppliers: ${supplierError.message}`);
  console.log(`Seeded ${seededSuppliers.length} suppliers.`);

  // 2. Seed Products
  const { data: seededProducts, error: productError } = await supabase.from('products').upsert(products, { onConflict: 'sku' }).select();
  if (productError) throw new Error(`Failed to seed products: ${productError.message}`);
  console.log(`Seeded ${seededProducts.length} products.`);

  // 3. Seed a Purchase Order
  const { data: po, error: poError } = await supabase
    .from('purchase_orders')
    .insert({
      supplier_id: seededSuppliers[0].id, // From 'ООО "Продуктовый Мир"'
      status: 'pending',
      expected_delivery_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
      notes: 'Тестовый заказ для демонстрации.',
    })
    .select()
    .single();
  if (poError) throw new Error(`Failed to seed purchase order: ${poError.message}`);
  console.log(`Created pending purchase order with ID: ${po.id}`);

  // 4. Seed Purchase Order Items
  const poItems = [
    { purchase_order_id: po.id, product_id: seededProducts[0].id, quantity_ordered: 50, price_per_unit: 70 }, // Молоко
    { purchase_order_id: po.id, product_id: seededProducts[1].id, quantity_ordered: 100, price_per_unit: 40 }, // Хлеб
    { purchase_order_id: po.id, product_id: seededProducts[2].id, quantity_ordered: 20, price_per_unit: 500 }, // Сыр
    { purchase_order_id: po.id, product_id: seededProducts[5].id, quantity_ordered: 30, price_per_unit: 350 }, // Куриное филе
  ];

  const { error: poItemsError } = await supabase.from('purchase_order_items').insert(poItems);
  if (poItemsError) throw new Error(`Failed to seed purchase order items: ${poItemsError.message}`);
  console.log(`Added ${poItems.length} items to purchase order ${po.id}.`);

  console.log('Database seeding completed successfully!');
}

main().catch((err) => {
  console.error('An error occurred during database seeding:');
  console.error(err);
  process.exit(1);
});
