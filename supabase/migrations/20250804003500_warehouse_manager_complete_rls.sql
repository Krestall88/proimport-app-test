-- Comprehensive RLS policies for warehouse_manager role
-- Ensuring warehouse_manager can access customer orders and order items

-- Check and create policies for warehouse_manager on customer_orders
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'customer_orders' 
        AND policyname = 'warehouse_manager_select_customer_orders'
    ) THEN
        CREATE POLICY "warehouse_manager_select_customer_orders"
        ON customer_orders
        FOR SELECT
        TO warehouse_manager
        USING (true);
    END IF;
END $$;

-- Check and create policies for warehouse_manager on customer_order_items
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'customer_order_items' 
        AND policyname = 'warehouse_manager_select_customer_order_items'
    ) THEN
        CREATE POLICY "warehouse_manager_select_customer_order_items"
        ON customer_order_items
        FOR SELECT
        TO warehouse_manager
        USING (true);
    END IF;
END $$;

-- Ensure all roles have SELECT access for consistency
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'customer_orders' 
        AND policyname = 'owner_select_customer_orders'
    ) THEN
        CREATE POLICY "owner_select_customer_orders"
        ON customer_orders
        FOR SELECT
        TO owner
        USING (true);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'customer_order_items' 
        AND policyname = 'owner_select_customer_order_items'
    ) THEN
        CREATE POLICY "owner_select_customer_order_items"
        ON customer_order_items
        FOR SELECT
        TO owner
        USING (true);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'customer_orders' 
        AND policyname = 'agent_select_customer_orders'
    ) THEN
        CREATE POLICY "agent_select_customer_orders"
        ON customer_orders
        FOR SELECT
        TO agent
        USING (true);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'customer_order_items' 
        AND policyname = 'agent_select_customer_order_items'
    ) THEN
        CREATE POLICY "agent_select_customer_order_items"
        ON customer_order_items
        FOR SELECT
        TO agent
        USING (true);
    END IF;
END $$;
