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
      <body className="antialiased bg-gradient-to-br from-purple-100 via-pink-100 to-blue-50 min-h-screen">
        <AuthProvider>
          <LayoutContent>{children}</LayoutContent>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}