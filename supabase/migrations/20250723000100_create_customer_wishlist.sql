-- Создать таблицу customer_wishlist для хранения хотелок клиентов
CREATE TABLE IF NOT EXISTS public.customer_wishlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
    wishlist_items JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Триггер для обновления updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS handle_updated_at ON public.customer_wishlist;
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.customer_wishlist
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

-- Включить RLS
ALTER TABLE public.customer_wishlist ENABLE ROW LEVEL SECURITY;

-- RLS: Агент и владелец могут создавать wishlist только для своих клиентов
CREATE POLICY "agent_insert_wishlist" ON public.customer_wishlist
  FOR INSERT
  WITH CHECK (
    agent_id = auth.uid() AND wishlist_items IS NOT NULL AND customer_id IS NOT NULL
  );

-- RLS: Агент видит только свои wishlist, владелец — все
CREATE POLICY "agent_select_own_wishlist" ON public.customer_wishlist
  FOR SELECT
  USING (
    agent_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- RLS: Агент может обновлять только свои wishlist
CREATE POLICY "agent_update_own_wishlist" ON public.customer_wishlist
  FOR UPDATE
  USING (
    agent_id = auth.uid()
  );

-- RLS: Владелец может делать всё
DROP POLICY IF EXISTS "owner_all" ON public.customer_wishlist;
DROP POLICY IF EXISTS "owner_select_delete" ON public.customer_wishlist; -- Удаляем старую некорректную
DROP POLICY IF EXISTS "owner_insert_update" ON public.customer_wishlist;
DROP POLICY IF EXISTS "owner_select" ON public.customer_wishlist;
DROP POLICY IF EXISTS "owner_delete" ON public.customer_wishlist;
DROP POLICY IF EXISTS "owner_update" ON public.customer_wishlist;
DROP POLICY IF EXISTS "owner_insert" ON public.customer_wishlist;


CREATE POLICY "owner_select" ON public.customer_wishlist
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner'));

CREATE POLICY "owner_delete" ON public.customer_wishlist
  FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner'));

CREATE POLICY "owner_update" ON public.customer_wishlist
  FOR UPDATE
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner'));

CREATE POLICY "owner_insert" ON public.customer_wishlist
  FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner'));
