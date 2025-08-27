import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ConnieNail - Luxury Nail Salon',
  description: 'Premium nail salon services with AI nail art in Washington DC',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-inter antialiased bg-gradient-to-br from-purple-100 via-pink-100 to-blue-50 min-h-screen">
        {children}
      </body>
    </html>
  )
}