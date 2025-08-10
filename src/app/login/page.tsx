'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { Suspense } from 'react';

function LoginFormWithParams() {
  const searchParams = useSearchParams();
  const message = searchParams?.get('message');

  return (
    <form action="/auth/sign-in" method="post" className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          name="email"
          placeholder="m@example.com"
          required
        />
      </div>
      <div className="grid gap-2">
        <div className="flex items-center">
          <Label htmlFor="password">Password</Label>
        </div>
        <Input id="password" name="password" type="password" required />
      </div>
      {message && (
        <div className="text-sm font-medium text-destructive">
          {message}
        </div>
      )}
      <Button type="submit" className="w-full">
        Login
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
        <Suspense>
          <LoginFormWithParams />
        </Suspense>
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/login/sign-up" className="underline">
            Sign up
          </Link>
        </div>
      </CardContent>
      </Card>
    </div>
  )
}
