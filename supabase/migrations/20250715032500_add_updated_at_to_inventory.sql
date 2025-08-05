-- Create or replace the function to handle updated_at timestamp to make it available
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at column to the inventory table if it doesn't exist
ALTER TABLE public.inventory
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Remove existing trigger to avoid conflicts
DROP TRIGGER IF EXISTS on_inventory_update ON public.inventory;

-- Create a trigger to automatically update the updated_at timestamp on any row update
CREATE TRIGGER on_inventory_update
  BEFORE UPDATE ON public.inventory
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();
