import { cookies as nextCookies } from 'next/headers';

export function getServerCookies() {
  // SSR-safe access to cookies for Supabase client
  return nextCookies();
}
