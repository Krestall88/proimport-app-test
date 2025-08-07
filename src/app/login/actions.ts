'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return redirect('/login?message=Не удалось аутентифицировать пользователя.&type=error')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // emailRedirectTo: 'http://localhost:3000/auth/callback',
      // В реальном приложении здесь будет ссылка на ваш сайт
    },
  })

  if (error) {
    console.error(error)
    return redirect('/login?message=Не удалось зарегистрировать пользователя.&type=error')
  }

  revalidatePath('/', 'layout')
  redirect('/login?message=Проверьте почту для завершения регистрации.&type=success')
}

export async function signout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login?message=Вы успешно вышли из системы.&type=success')
}
