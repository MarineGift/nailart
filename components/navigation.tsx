'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Navigation() {
  const pathname = usePathname()
  
  return (
    <header className="bg-white/90 backdrop-blur-sm border-b border-pink-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* ConnieNail Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">CN</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              ConnieNail
            </span>
          </Link>
          
          <nav className="flex items-center space-x-8">
            <Link href="/" className={`relative py-2 font-medium transition-colors ${pathname === '/' ? "text-pink-600" : "text-gray-700 hover:text-pink-600"}`}>
              Home
              {pathname === '/' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-200 via-pink-300 to-purple-200 rounded-full shadow-sm"></div>
              )}
            </Link>
            <Link href="/services" className={`relative py-2 font-medium transition-colors ${pathname === '/services' ? "text-pink-600" : "text-gray-700 hover:text-pink-600"}`}>
              Services
              {pathname === '/services' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-200 via-pink-300 to-purple-200 rounded-full shadow-sm"></div>
              )}
            </Link>
            <Link href="/booking" className={`relative py-2 font-medium transition-colors ${pathname === '/booking' ? "text-pink-600" : "text-gray-700 hover:text-pink-600"}`}>
              Booking
              {pathname === '/booking' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-200 via-pink-300 to-purple-200 rounded-full shadow-sm"></div>
              )}
            </Link>
            <Link href="/gallery" className={`relative py-2 font-medium transition-colors ${pathname === '/gallery' ? "text-pink-600" : "text-gray-700 hover:text-pink-600"}`}>
              Gallery
              {pathname === '/gallery' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-200 via-pink-300 to-purple-200 rounded-full shadow-sm"></div>
              )}
            </Link>
            <Link href="/ai-nail-art" className={`relative py-2 font-medium transition-colors ${pathname === '/ai-nail-art' ? "text-pink-600" : "text-gray-700 hover:text-pink-600"}`}>
              AI Nail Art
              {pathname === '/ai-nail-art' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-200 via-pink-300 to-purple-200 rounded-full shadow-sm"></div>
              )}
            </Link>
            <Link href="/contact" className={`relative py-2 font-medium transition-colors ${pathname === '/contact' ? "text-pink-600" : "text-gray-700 hover:text-pink-600"}`}>
              Contact
              {pathname === '/contact' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-200 via-pink-300 to-purple-200 rounded-full shadow-sm"></div>
              )}
            </Link>
            <Link href="/customer-login" className={`relative py-2 font-medium transition-colors ${pathname === '/customer-login' ? "text-pink-600" : "text-gray-700 hover:text-pink-600"}`}>
              Customer Login
              {pathname === '/customer-login' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-200 via-pink-300 to-purple-200 rounded-full shadow-sm"></div>
              )}
            </Link>
            <Link href="/staff-login" className={`relative py-2 font-medium transition-colors ${pathname === '/staff-login' ? "text-pink-600" : "text-gray-700 hover:text-pink-600"}`}>
              Staff Login
              {pathname === '/staff-login' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-200 via-pink-300 to-purple-200 rounded-full shadow-sm"></div>
              )}
            </Link>
            <Link href="/admin" className={`relative py-2 font-medium transition-colors ${pathname === '/admin' ? "text-pink-600" : "text-gray-700 hover:text-pink-600"}`}>
              Admin
              {pathname === '/admin' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-200 via-pink-300 to-purple-200 rounded-full shadow-sm"></div>
              )}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}