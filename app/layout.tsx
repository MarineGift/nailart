import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/components/auth-provider'
import { LayoutContent } from '@/components/layout-content'

export const metadata: Metadata = {
  title: 'ConnieNail Admin Dashboard',
  description: 'Luxury nail salon management platform for ConnieNail',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <LayoutContent>{children}</LayoutContent>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}