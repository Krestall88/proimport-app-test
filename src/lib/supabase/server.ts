// src/lib/supabase/server.ts
// src/lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { Database } from '../database.types';

// Универсальный SSR Supabase client: работает и в app-directory (через next/headers), и в pages/server actions (через параметр)
export async function createClient(customCookies?: any) {
  let cookies;
  let isCustom = false;
  try {
    // В app-directory и server components (Next.js 15+) используем асинхронный API
    cookies = (await import('next/headers')).cookies;
    if (typeof cookies === 'function') {
      cookies = await cookies(); // cookies() теперь асинхронный
    }
  } catch {
    // В pages-directory или при ошибке — используем переданные cookies
    cookies = customCookies;
    isCustom = true;
  }

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookies?.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // set разрешён только если явно переданы customCookies (Server Action/Route Handler)
          if (isCustom && cookies?.set) {
            cookies.set({ name, value, ...options });
          }
        },
        remove(name: string, options: CookieOptions) {
          // remove разрешён только если явно переданы customCookies
          if (isCustom && cookies?.set) {
            cookies.set({ name, value: '', ...options });
          }
        },
      },
    }
  );
}


