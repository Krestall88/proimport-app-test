-- Create warehouse_manager role and grant necessary permissions
-- This role is needed for warehouse staff to view customer orders and order items

-- Create the role if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'warehouse_manager') THEN
        CREATE ROLE warehouse_manager;
    END IF;
END $$;

-- Grant necessary permissions to warehouse_manager role
GRANT USAGE ON SCHEMA public TO warehouse_manager;
GRANT SELECT ON customer_orders TO warehouse_manager;
GRANT SELECT ON customer_order_items TO warehouse_manager;
GRANT SELECT ON customers TO warehouse_manager;
GRANT SELECT ON products TO warehouse_manager;
GRANT SELECT ON profiles TO warehouse_manager;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO warehouse_manager;

-- Grant execute on functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO warehouse_manager;
