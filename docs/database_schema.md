# Схема базы данных

Этот документ содержит структуру таблиц и представлений (views) в схеме `public`.

---

### Таблицы

**action_logs**
- `id` (uuid, NOT NULL)
- `user_id` (uuid)
- `action` (text, NOT NULL)
- `details` (jsonb)
- `created_at` (timestamp with time zone, NOT NULL)

**customer_order_items**
- `id` (uuid, NOT NULL)
- `customer_order_id` (uuid, NOT NULL)
- `product_id` (uuid, NOT NULL)
- `quantity` (integer, NOT NULL)
- `price_per_unit` (numeric, NOT NULL)

**customer_orders**
- `id` (uuid, NOT NULL)
- `customer_id` (uuid, NOT NULL)
- `status` (text, NOT NULL)
- `priority` (boolean)
- `created_by` (uuid, NOT NULL)
- `created_at` (timestamp with time zone, NOT NULL)

**customers**
- `id` (uuid, NOT NULL)
- `name` (text, NOT NULL)
- `tin` (text)
- `kpp` (text)
- `bank_details` (jsonb)
- `contacts` (jsonb)
- `delivery_address` (text)
- `payment_terms` (text)
- `comments` (text)
- `created_by` (uuid, NOT NULL)
- `created_at` (timestamp with time zone, NOT NULL)

**deliveries**
- `id` (uuid, NOT NULL)
- `order_id` (uuid, NOT NULL)
- `photo_url` (text)
- `status` (text, NOT NULL)
- `delivered_at` (timestamp with time zone)
- `created_by` (uuid, NOT NULL)
- `created_at` (timestamp with time zone, NOT NULL)

**goods_receipt_items**
- `id` (uuid, NOT NULL)
- `goods_receipt_id` (uuid, NOT NULL)
- `product_id` (uuid, NOT NULL)
- `quantity_received` (integer, NOT NULL)
- `notes` (text)

**goods_receipts**
- `id` (uuid, NOT NULL)
- `purchase_order_id` (uuid, NOT NULL)
- `status` (text, NOT NULL)
- `notes` (text)
- `created_at` (timestamp with time zone, NOT NULL)
- `created_by` (uuid, NOT NULL)
- `receipt_date` (timestamp with time zone)
- `updated_at` (timestamp with time zone)

**inventory**
- `id` (uuid, NOT NULL)
- `product_id` (uuid, NOT NULL)
- `quantity` (integer, NOT NULL)
- `status` (text, NOT NULL)
- `batch_number` (text)
- `received_date` (timestamp with time zone)
- `expiry_date` (date)
- `created_at` (timestamp with time zone)

**payments**
- `id` (uuid, NOT NULL)
- `order_id` (uuid, NOT NULL)
- `status` (text, NOT NULL)
- `due_date` (date, NOT NULL)
- `comments` (text)
- `created_by` (uuid, NOT NULL)
- `created_at` (timestamp with time zone, NOT NULL)

**products**
- `id` (uuid, NOT NULL)
- `nomenclature_code` (text, NOT NULL)
- `title` (text, NOT NULL)
- `description` (text)
- `purchase_price` (numeric)
- `selling_price` (numeric)
- `unit` (text)
- `category` (text)
- `created_at` (timestamp with time zone, NOT NULL)
- `characteristics` (jsonb)

**profiles**
- `id` (uuid, NOT NULL)
- `updated_at` (timestamp with time zone)
- `full_name` (text)
- `avatar_url` (text)
- `role` (text, NOT NULL)

**purchase_order_items**
- `id` (uuid, NOT NULL)

---

### Представления (Views)

**manager_customer_orders_view**
- `id` (uuid)
- `created_at` (timestamp with time zone)
- `status` (text)
- `customer_name` (text)
- `customer_phone` (text)
- `items` (json)

**manager_inventory_view**
- `id` (uuid)
- `product_title` (text)
- `sku` (text)
- `quantity` (integer)
- `status` (text)
- `purchase_price` (numeric)
- `delivery_cost` (integer)
- `final_price` (numeric)
- `expiry_date` (date)

**manager_receipts_view**
- `receipt_id` (uuid)
- `receipt_date` (timestamp with time zone)
- `purchase_order_id` (uuid)
- `item_id` (uuid)
- `product_title` (text)
- `quantity_received` (integer)
- `comment` (text)
