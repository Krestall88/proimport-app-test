import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => request.cookies.get(name)?.value,
        set: (name: string, value: string, options) => {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove: (name: string, options) => {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const url = new URL(request.url);

  // Если пользователь не залогинен и пытается зайти не на страницу логина
  if (!user && url.pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Если пользователь залогинен
  if (user) {
    const role = user.user_metadata?.role;

    // Если залогиненный пользователь на странице логина, редиректим его
    if (url.pathname === '/login') {
      const redirectUrl = role === 'manager' ? '/manager' : role === 'agent' ? '/agent' : '/';
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    // Редирект с главной страницы в зависимости от роли
    if (url.pathname === '/') {
      const redirectUrl = role === 'manager' ? '/manager' : role === 'agent' ? '/agent' : '/';
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    // Проверка доступа к роутам
    if (url.pathname.startsWith('/manager') && role !== 'manager') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    if (url.pathname.startsWith('/agent') && role !== 'agent') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
