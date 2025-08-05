-- Add RLS policies for customers to allow UPDATE and DELETE operations

-- Policy for UPDATE: Allow agents and owner to update customer data
DROP POLICY IF EXISTS "Allow agent and owner update on customers" ON public.customers;

CREATE POLICY "Allow agent and owner update on customers"
ON public.customers
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND (profiles.role = 'agent' OR profiles.role = 'owner')
  )
);

-- Policy for DELETE: Allow only owner to delete customers
DROP POLICY IF EXISTS "Allow owner delete on customers" ON public.customers;

CREATE POLICY "Allow owner delete on customers"
ON public.customers
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'owner'
  )
);

-- Also ensure we have proper SELECT policies for all authenticated users
DROP POLICY IF EXISTS "Allow authenticated read access on customers" ON public.customers;

CREATE POLICY "Allow authenticated read access on customers"
ON public.customers
FOR SELECT
TO authenticated
USING (true);
