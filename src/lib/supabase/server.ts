// src/lib/supabase/server.ts
// src/lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { Database } from '../database.types';

// Универсальный SSR Supabase client: работает и в app-directory (через next/headers), и в pages/server actions (через параметр)
export function createClient(customCookies?: any) {
  let cookies;
  try {
    // В app-directory и server components
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    cookies = require('next/headers').cookies?.();
  } catch {
    // В pages-directory или при ошибке — используем переданные cookies
    cookies = customCookies;
  }

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: cookies
        ? {
            get(name: string) {
              return cookies.get(name)?.value;
            },
            set(name: string, value: string, options: CookieOptions) {
              cookies.set({ name, value, ...options });
            },
            remove(name: string, options: CookieOptions) {
              cookies.set({ name, value: '', ...options });
            },
          }
        : undefined,
    }
  );
}

