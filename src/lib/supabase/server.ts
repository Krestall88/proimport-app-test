// src/lib/supabase/server.ts
// src/lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { Database } from '../database.types';
import { cookies as getCookies } from 'next/headers';

export function createClient() {
  const cookies = getCookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookies.set({ name, value: '', ...options });
        },
      },
    }
  );
}

