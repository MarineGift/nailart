'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Navigation() {
  const pathname = usePathname()
  
  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-pink-200 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* ConnieNail Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">CN</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              ConnieNail
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className={`relative py-2 font-medium transition-colors ${
                pathname === '/' 
                  ? "text-pink-600" 
                  : "text-gray-700 hover:text-pink-600"
              }`}
            >
              Home
              {pathname === '/' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-200 via-pink-300 to-purple-200 rounded-full"></div>
              )}
            </Link>
            <Link 
              href="/services" 
              className={`relative py-2 font-medium transition-colors ${
                pathname === '/services' 
                  ? "text-pink-600" 
                  : "text-gray-700 hover:text-pink-600"
              }`}
            >
              Services
              {pathname === '/services' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-200 via-pink-300 to-purple-200 rounded-full"></div>
              )}
            </Link>
            <Link 
              href="/booking" 
              className={`relative py-2 font-medium transition-colors ${
                pathname === '/booking' 
                  ? "text-pink-600" 
                  : "text-gray-700 hover:text-pink-600"
              }`}
            >
              Booking
              {pathname === '/booking' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-200 via-pink-300 to-purple-200 rounded-full"></div>
              )}
            </Link>
            <Link 
              href="/gallery" 
              className={`relative py-2 font-medium transition-colors ${
                pathname === '/gallery' 
                  ? "text-pink-600" 
                  : "text-gray-700 hover:text-pink-600"
              }`}
            >
              Gallery
              {pathname === '/gallery' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-200 via-pink-300 to-purple-200 rounded-full"></div>
              )}
            </Link>
            <Link 
              href="/ai-nail-art" 
              className={`relative py-2 font-medium transition-colors ${
                pathname === '/ai-nail-art' 
                  ? "text-pink-600" 
                  : "text-gray-700 hover:text-pink-600"
              }`}
            >
              AI Nail Art
              {pathname === '/ai-nail-art' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-200 via-pink-300 to-purple-200 rounded-full"></div>
              )}
            </Link>
            <Link 
              href="/contact" 
              className={`relative py-2 font-medium transition-colors ${
                pathname === '/contact' 
                  ? "text-pink-600" 
                  : "text-gray-700 hover:text-pink-600"
              }`}
            >
              Contact
              {pathname === '/contact' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-200 via-pink-300 to-purple-200 rounded-full"></div>
              )}
            </Link>
            <Link 
              href="/admin" 
              className={`relative py-2 font-medium transition-colors ${
                pathname === '/admin' 
                  ? "text-pink-600" 
                  : "text-gray-700 hover:text-pink-600"
              }`}
            >
              Admin
              {pathname === '/admin' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-200 via-pink-300 to-purple-200 rounded-full"></div>
              )}
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-600 hover:text-pink-600 p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}