import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
console.log('LAYOUT: globals.css imported');
import SiteHeader from '@/components/SiteHeader';

import { Suspense } from 'react';

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'ProImport App',
  description: 'Product Supply Management System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" className="dark">
      <body className="bg-background text-foreground">
        <div className="min-h-screen flex flex-col">
          <SiteHeader />
          <main className="flex-1 w-full">
            {children}
          </main>
        </div>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
