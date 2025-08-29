'use client'

import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-bold text-xl mb-4">Connie's Nail</h4>
            <p className="text-gray-300 leading-relaxed">
              Professional nail salon in Washington, DC offering premium nail care, 
              spa treatments, and innovative AI nail art services.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Quick Links</h4>
            <div className="space-y-2">
              <Link href="/" className="text-gray-300 hover:text-white transition-colors block">Home</Link>
              <Link href="/services" className="text-gray-300 hover:text-white transition-colors block">Services</Link>
              <Link href="/booking" className="text-gray-300 hover:text-white transition-colors block">Booking</Link>
              <Link href="/gallery" className="text-gray-300 hover:text-white transition-colors block">Gallery</Link>
              <Link href="/ai-nail-art" className="text-gray-300 hover:text-white transition-colors block">AI Nail Art</Link>
              <Link href="/contact" className="text-gray-300 hover:text-white transition-colors block">Contact</Link>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Services</h4>
            <div className="space-y-2">
              <p className="text-gray-300">Spa Manicure & Pedicure</p>
              <p className="text-gray-300">AI Nail Art Generation</p>
              <p className="text-gray-300">Professional Waxing</p>
              <p className="text-gray-300">Massage Therapy</p>
              <p className="text-gray-300">Paraffin Treatments</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Contact Info</h4>
            <div className="space-y-2">
              <p className="text-gray-300">📍 The Ronald Reagan Building</p>
              <p className="text-gray-300">Space C-044</p>
              <p className="text-gray-300">1300 Pennsylvania Avenue NW</p>
              <p className="text-gray-300">Washington, DC 20004</p>
              <p className="text-gray-300">📞 202.898.0826</p>
              <p className="text-gray-300">✉️ info@conniesnail.com</p>
              <p className="text-gray-300">🕐 Mon-Fri: 10:00 AM - 7:00 PM</p>
              <p className="text-gray-300">Weekend: Closed</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-12 pt-8 text-center">
          <p className="text-gray-400">
            © 2025 Connie's Nail. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}