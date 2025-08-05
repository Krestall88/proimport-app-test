"use client";

import * as React from "react"
import Link from "next/link"
import { Bell, CircleUser, Home, LineChart, Menu, Package, Package2, Search, ShoppingCart, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input";
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Toaster } from "@/components/ui/toaster";
import { Badge } from "@/components/ui/badge";

import { type User } from '@supabase/supabase-js';
import { UserRoleProvider } from './UserRoleContext';

interface AppShellProps {
  user: User | null;
  navLinks: { href: string; label: string; icon: React.ReactNode; notificationBadgeCount?: number }[];
  title: string;
  children: React.ReactNode;
  role: 'owner' | 'warehouse_manager' | 'agent';
}

export function AppShell({
  user,
  navLinks,
  title,
  children,
  role
}: AppShellProps) {
  const pathname = usePathname();
  const activeLink = navLinks.find(link => pathname === link.href);

  return (
    <UserRoleProvider role={role}>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-muted/40 md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <Package2 className="h-6 w-6" />
                <span className="">ProImport</span>
              </Link>
            </div>
            <div className="flex-1">
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                {navLinks.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${pathname === item.href ? 'bg-muted text-primary' : ''}`}>
                    {item.icon}
                    <span className="flex items-center gap-1">
                      {item.label}
                      {item.notificationBadgeCount && item.notificationBadgeCount > 0 && (
                        <Badge variant="outline" className="ml-1">{item.notificationBadgeCount}</Badge>
                      )}
                    </span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 md:hidden"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col">
                <nav className="grid gap-2 text-lg font-medium">
                  <Link
                    href="#"
                    className="flex items-center gap-2 text-lg font-semibold mb-4"
                  >
                    <Package2 className="h-6 w-6" />
                    <span className="">ProImport</span>
                  </Link>
                  {navLinks.map(item => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground ${pathname === item.href ? 'bg-muted text-foreground' : ''}`}>
                      {item.icon}
                      <span className="flex items-center gap-1">
                        {item.label}
                        {item.notificationBadgeCount && item.notificationBadgeCount > 0 && (
                          <Badge variant="outline" className="ml-1">{item.notificationBadgeCount}</Badge>
                        )}
                      </span>
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            <div className="w-full flex-1">
              <h1 className="text-lg font-semibold">{activeLink?.label || title}</h1>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full">
                  <CircleUser className="h-5 w-5" />
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Настройки</DropdownMenuItem>
                <DropdownMenuSeparator />
                <form action="/auth/signout" method="post">
                  <Button type="submit" className='w-full text-left justify-start pl-2 font-normal' variant='ghost'>Выйти</Button>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-auto">
            {children}
          </main>
          <Toaster />
        </div>
      </div>
    </UserRoleProvider>
  );
}
