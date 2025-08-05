-- Add RLS policy for customers to allow authenticated users to read customer data

-- 1. Enable RLS on the table if not already enabled
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- 2. Create a policy to allow read access to any authenticated user
DROP POLICY IF EXISTS "Allow authenticated read access on customers" ON public.customers;

CREATE POLICY "Allow authenticated read access on customers"
ON public.customers
FOR SELECT
TO authenticated
USING (true);
