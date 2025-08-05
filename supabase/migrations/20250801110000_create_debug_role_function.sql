-- This function is for debugging purposes only.
-- It helps identify the role under which the client-side RPC call is being executed.
CREATE OR REPLACE FUNCTION debug_get_role()
RETURNS TABLE (current_user_role NAME, session_user_role NAME)
LANGUAGE sql
AS $$
  SELECT current_user, session_user;
$$;
