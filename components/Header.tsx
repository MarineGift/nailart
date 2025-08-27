'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Header() {
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
            <Link 
              href="/" 
              className={pathname === '/' ? "text-pink-600 font-medium" : "text-gray-700 hover:text-pink-600 font-medium transition-colors"}
            >
              Home
            </Link>
            <Link 
              href="/services" 
              className={pathname === '/services' ? "text-pink-600 font-medium" : "text-gray-700 hover:text-pink-600 font-medium transition-colors"}
            >
              Services
            </Link>
            <Link 
              href="/booking" 
              className={pathname === '/booking' ? "text-pink-600 font-medium" : "text-gray-700 hover:text-pink-600 font-medium transition-colors"}
            >
              Booking
            </Link>
            <Link 
              href="/gallery" 
              className={pathname === '/gallery' ? "text-pink-600 font-medium" : "text-gray-700 hover:text-pink-600 font-medium transition-colors"}
            >
              Gallery
            </Link>
            <Link 
              href="/ai-nail-art" 
              className={pathname === '/ai-nail-art' ? "text-pink-600 font-medium" : "text-gray-700 hover:text-pink-600 font-medium transition-colors"}
            >
              AI Nail Art
            </Link>
            <Link 
              href="/contact" 
              className={pathname === '/contact' ? "text-pink-600 font-medium" : "text-gray-700 hover:text-pink-600 font-medium transition-colors"}
            >
              Contact
            </Link>
            <Link 
              href="/admin" 
              className={pathname === '/admin' ? "text-pink-600 font-medium" : "text-gray-700 hover:text-pink-600 font-medium transition-colors"}
            >
              Admin
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}