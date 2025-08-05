-- This migration fixes the duplicate reservation triggers that were causing double reservation of inventory

-- Drop the duplicate trigger
DROP TRIGGER IF EXISTS on_new_order_item_reserve_inventory ON customer_order_items;

-- Ensure only one trigger exists for reservation
-- The reserve_inventory_for_order function is called by trg_reserve_inventory (BEFORE INSERT)
