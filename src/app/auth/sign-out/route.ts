import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  const requestUrl = new URL(request.url)

  if (error) {
    console.error('Error signing out:', error)
    return NextResponse.redirect(`${requestUrl.origin}/login?error=Could not sign out`)
  }

  return NextResponse.redirect(`${requestUrl.origin}/login`)
}
