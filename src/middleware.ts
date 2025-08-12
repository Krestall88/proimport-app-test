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
  const { pathname } = request.nextUrl;

  // Если пользователь не аутентифицирован, разрешаем доступ только к странице входа
  if (!user) {
    if (pathname !== '/login') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return response;
  }

  // Если пользователь аутентифицирован
  const role = user.user_metadata?.role as string;

  // Определяем домашнюю страницу для каждой роли
  const homeRoutes: Record<string, string> = {
    owner: '/manager',
    agent: '/agent',
    driver: '/driver',
    warehouse: '/warehouse',
  };

  const userHome = homeRoutes[role] || '/';

  // Если пользователь пытается получить доступ к странице входа, перенаправляем его на домашнюю страницу
  if (pathname === '/login') {
    return NextResponse.redirect(new URL(userHome, request.url));
  }

  // Если пользователь находится на главной странице, перенаправляем на его домашнюю страницу
  if (pathname === '/' && userHome !== '/') {
    return NextResponse.redirect(new URL(userHome, request.url));
  }

  // Проверяем, имеет ли пользователь доступ к запрашиваемому разделу
  const protectedRoute = Object.values(homeRoutes).find(route => pathname.startsWith(route));
  if (protectedRoute && userHome !== protectedRoute) {
    // Если пользователь пытается получить доступ к чужому разделу, перенаправляем на его домашнюю страницу
    return NextResponse.redirect(new URL(userHome, request.url));
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
