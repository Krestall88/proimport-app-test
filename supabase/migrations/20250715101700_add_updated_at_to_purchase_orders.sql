-- Add updated_at column to purchase_orders for audit
ALTER TABLE public.purchase_orders
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Create or replace the function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remove existing trigger to avoid conflicts
DROP TRIGGER IF EXISTS on_purchase_orders_update ON public.purchase_orders;

-- Create a trigger to automatically update the updated_at timestamp on any row update
CREATE TRIGGER on_purchase_orders_update
  BEFORE UPDATE ON public.purchase_orders
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();
