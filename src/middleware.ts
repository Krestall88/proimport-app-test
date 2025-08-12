import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { 
        cookies: { 
            get: (name) => request.cookies.get(name)?.value,
            set: (name, value, options) => response.cookies.set({ name, value, ...options }),
            remove: (name, options) => response.cookies.set({ name, value: '', ...options }),
        }
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  const homeRoutes: Record<string, string> = {
    owner: '/manager',
    agent: '/agent',
    driver: '/driver',
    warehouse: '/warehouse',
  };

  // Если пользователь не залогинен, пускаем только на страницу входа
  if (!user) {
    if (pathname !== '/login') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return response;
  }

  // Если пользователь залогинен
  const role = user.user_metadata?.role as string;
  const userHome = homeRoutes[role];

  // Если пользователь на странице входа или на главной, перенаправляем на его домашнюю страницу
  if (userHome && (pathname === '/login' || pathname === '/')) {
    return NextResponse.redirect(new URL(userHome, request.url));
  }

  // Проверяем доступ к защищенным разделам
  if (pathname.startsWith('/manager') && role !== 'owner') {
    return NextResponse.redirect(new URL(homeRoutes[role] || '/login', request.url));
  }
  if (pathname.startsWith('/agent') && role !== 'agent') {
    return NextResponse.redirect(new URL(homeRoutes[role] || '/login', request.url));
  }
  if (pathname.startsWith('/driver') && role !== 'driver') {
    return NextResponse.redirect(new URL(homeRoutes[role] || '/login', request.url));
  }
  if (pathname.startsWith('/warehouse') && role !== 'warehouse') {
    return NextResponse.redirect(new URL(homeRoutes[role] || '/login', request.url));
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
