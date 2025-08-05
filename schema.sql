-- =============================================================================
-- ProImport Database Schema
-- Version: 2.0
-- Description: This script sets up a normalized schema for Supply Chain Management.
-- =============================================================================

-- =============================================================================
-- Section 1: User Management and Access Control
-- =============================================================================

-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  full_name text,
  avatar_url text,
  role text default 'agent' not null -- Roles: owner, warehouse_manager, agent, driver, accountant
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile." on profiles for update using (auth.uid() = id);

-- This trigger automatically creates a profile entry when a new user signs up.
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'role');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================================================
-- Section 2: Core SCM Tables (Products, Suppliers, Purchasing)
-- =============================================================================

-- Table for Suppliers
create table suppliers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  contact jsonb,
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table suppliers enable row level security;
create policy "Owners can manage suppliers" on suppliers for all using ((select role from profiles where id = auth.uid()) = 'owner');
create policy "Authenticated users can view suppliers" on suppliers for select using (auth.role() = 'authenticated');

-- Table for Products
create table products (
  id uuid default gen_random_uuid() primary key,
  sku text not null unique,
  name text not null,
  description text,
  purchase_price numeric(10, 2),
  selling_price numeric(10, 2),
  unit text, -- e.g., 'pcs', 'kg', 'm'
  category text,
  created_at timestamptz default timezone('utc'::text, now()) not null
);
alter table products enable row level security;
create policy "Authenticated users can view products" on products for select using (auth.role() = 'authenticated');
create policy "Owners can manage products" on products for all using ((select role from profiles where id = auth.uid()) = 'owner');

-- Table for Purchase Orders
create table purchase_orders (
  id uuid default gen_random_uuid() primary key,
  supplier_id uuid references suppliers(id) not null,
  status text not null default 'pending', -- pending, completed, cancelled
  expected_delivery_date date,
  notes text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users(id) not null
);
alter table purchase_orders enable row level security;
create policy "Owners can create purchase orders" on purchase_orders for insert with check ((select role from profiles where id = auth.uid()) = 'owner' and created_by = auth.uid());
create policy "Owners and warehouse managers can view POs" on purchase_orders for select using ((select role from profiles where id = auth.uid()) in ('owner', 'warehouse_manager'));
create policy "Owners can update purchase orders" on purchase_orders for update using ((select role from profiles where id = auth.uid()) = 'owner');

-- Table for Purchase Order Line Items
create table purchase_order_items (
  id uuid default gen_random_uuid() primary key,
  purchase_order_id uuid references purchase_orders(id) on delete cascade not null,
  product_id uuid references products(id) not null,
  quantity_ordered integer not null check (quantity_ordered > 0),
  price_per_unit numeric(10, 2),
  unique (purchase_order_id, product_id)
);
alter table purchase_order_items enable row level security;
create policy "Users who can see PO can see its items" on purchase_order_items for select using ((select role from profiles where id = auth.uid()) in ('owner', 'warehouse_manager'));
create policy "Owners can manage PO items" on purchase_order_items for all using ((select role from profiles where id = auth.uid()) = 'owner');

-- =============================================================================
-- Section 3: Warehouse and Inventory Management
-- =============================================================================

-- Table for Goods Receipts
create table goods_receipts (
  id uuid default gen_random_uuid() primary key,
  purchase_order_id uuid references purchase_orders(id) not null,
  status text not null default 'in_progress', -- in_progress, completed
  notes text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users(id) not null
);
alter table goods_receipts enable row level security;
create policy "Warehouse managers can manage goods receipts" on goods_receipts for all using ((select role from profiles where id = auth.uid()) = 'warehouse_manager');
create policy "Owners can view goods receipts" on goods_receipts for select using ((select role from profiles where id = auth.uid()) = 'owner');

-- Table for Goods Receipt Line Items
create table goods_receipt_items (
  id uuid default gen_random_uuid() primary key,
  goods_receipt_id uuid references goods_receipts(id) on delete cascade not null,
  product_id uuid references products(id) not null,
  quantity_received integer not null default 0,
  notes text,
  unique (goods_receipt_id, product_id)
);
alter table goods_receipt_items enable row level security;
create policy "Users who can see GR can see its items" on goods_receipt_items for select using ((select role from profiles where id = auth.uid()) in ('owner', 'warehouse_manager'));
create policy "Warehouse managers can manage GR items" on goods_receipt_items for all using ((select role from profiles where id = auth.uid()) = 'warehouse_manager');

-- Table for Inventory
create table inventory (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references products(id) on delete cascade not null unique,
  sku text not null,
  name text not null,
  quantity integer not null default 0,
  status text not null, -- 'in_stock', 'low_stock', 'out_of_stock'
  expiry_date date
);
alter table inventory enable row level security;
create policy "Authenticated users can view inventory" on inventory for select using (auth.role() = 'authenticated');
create policy "Warehouse managers can manage inventory" on inventory for all using ((select role from profiles where id = auth.uid()) = 'warehouse_manager');

-- =============================================================================
-- Section 4: Customer and Sales Management
-- =============================================================================

-- Table for Customers
create table customers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  tin text, -- ИНН
  kpp text, -- КПП
  bank_details jsonb,
  contacts jsonb,
  delivery_address text,
  payment_terms text,
  comments text,
  created_by uuid references auth.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table customers enable row level security;
create policy "Agents can manage their customers" on customers for all using ((select role from profiles where id = auth.uid()) = 'agent' and created_by = auth.uid());
create policy "Owners and accountants can view all customers" on customers for select using ((select role from profiles where id = auth.uid()) in ('owner', 'accountant'));

-- Table for Customer Orders
create table customer_orders (
  id uuid default gen_random_uuid() primary key,
  customer_id uuid references customers(id) not null,
  status text default 'Pending' not null, -- 'Pending', 'Collected', 'Delivered'
  priority boolean default false,
  created_by uuid references auth.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table customer_orders enable row level security;
create policy "Agents can create customer orders" on customer_orders for insert with check ((select role from profiles where id = auth.uid()) = 'agent' and created_by = auth.uid());
create policy "Relevant users can view customer orders" on customer_orders for select using ((select role from profiles where id = auth.uid()) in ('owner', 'warehouse_manager', 'agent', 'driver', 'accountant'));
create policy "Warehouse managers can update status to collected" on customer_orders for update using ((select role from profiles where id = auth.uid()) = 'warehouse_manager') with check (status = 'Collected');

-- Table for Customer Order Items
create table customer_order_items (
    id uuid default gen_random_uuid() primary key,
    customer_order_id uuid references customer_orders(id) on delete cascade not null,
    product_id uuid references products(id) not null,
    quantity integer not null check (quantity > 0),
    price_per_unit numeric(10, 2) not null,
    goods_receipt_item_id uuid references goods_receipt_items(id)
);
alter table customer_order_items enable row level security;
create policy "Users who can see customer order can see its items" on customer_order_items for select using ((select role from profiles where id = auth.uid()) in ('owner', 'warehouse_manager', 'agent', 'driver', 'accountant'));
create policy "Agents who created order can manage items" on customer_order_items for all using ((select role from profiles where id = auth.uid()) = 'agent' and (select created_by from customer_orders where id = customer_order_id) = auth.uid());

-- =============================================================================
-- Section 5: Logistics and Financials
-- =============================================================================

-- Table for Deliveries
create table deliveries (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references customer_orders(id) not null,
  photo_url text,
  status text default 'In Transit' not null, -- 'In Transit', 'Delivered'
  delivered_at timestamp with time zone,
  created_by uuid references auth.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table deliveries enable row level security;
create policy "Drivers can manage their deliveries" on deliveries for all using ((select role from profiles where id = auth.uid()) = 'driver' and created_by = auth.uid());
create policy "Relevant users can view deliveries" on deliveries for select using ((select role from profiles where id = auth.uid()) in ('owner', 'warehouse_manager', 'agent', 'accountant'));

-- Table for Payments
create table payments (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references customer_orders(id) not null,
  status text default 'Pending' not null, -- 'Pending', 'Paid', 'Overdue'
  due_date date not null,
  comments text,
  created_by uuid references auth.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table payments enable row level security;
create policy "Accountants can manage payments" on payments for all using ((select role from profiles where id = auth.uid()) = 'accountant');
create policy "Owners can view payments" on payments for select using ((select role from profiles where id = auth.uid()) = 'owner');

-- Table for Action Logs
create table action_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  action text not null,
  details jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table action_logs enable row level security;
create policy "Owners can view all logs" on action_logs for select using ((select role from profiles where id = auth.uid()) = 'owner');

-- Enable realtime on tables
alter publication supabase_realtime add table inventory, customer_orders, purchase_orders;
