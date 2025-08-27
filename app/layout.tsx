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
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
            * { box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              margin: 0;
              padding: 0;
              background: linear-gradient(135deg, #E6E6FA 0%, #F8BBD9 25%, #E0BBE4 50%, #F5E6D3 75%, #E6F3FF 100%);
              min-height: 100vh;
            }
          `
        }} />
      </head>
      <body className="antialiased bg-gradient-to-br from-purple-100 via-pink-100 to-blue-50 min-h-screen">
        <AuthProvider>
          <LayoutContent>{children}</LayoutContent>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}