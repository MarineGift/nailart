import { Navigation } from '@/components/navigation'
import Link from 'next/link'

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
            ConnieNail Admin Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Luxury nail salon management system
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">📈 Today's Overview</h3>
            <div className="space-y-2">
              <p className="text-gray-600">Appointments: <span className="font-semibold text-pink-600">12</span></p>
              <p className="text-gray-600">Revenue: <span className="font-semibold text-purple-600">$850</span></p>
              <p className="text-gray-600">New Customers: <span className="font-semibold text-blue-600">3</span></p>
            </div>
          </div>

          {/* Services Management */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">💅 Services</h3>
            <div className="space-y-3">
              <Link href="/services" className="block">
                <div className="p-3 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors">
                  <p className="font-medium text-gray-700">Manage Services</p>
                  <p className="text-sm text-gray-500">Edit prices and descriptions</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Bookings */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">📅 Bookings</h3>
            <div className="space-y-3">
              <Link href="/booking" className="block">
                <div className="p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                  <p className="font-medium text-gray-700">View Bookings</p>
                  <p className="text-sm text-gray-500">Manage appointments</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Gallery Management */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">🎨 Gallery</h3>
            <div className="space-y-3">
              <Link href="/gallery" className="block">
                <div className="p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <p className="font-medium text-gray-700">Manage Gallery</p>
                  <p className="text-sm text-gray-500">Upload new images</p>
                </div>
              </Link>
            </div>
          </div>

          {/* AI Nail Art */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">🤖 AI Nail Art</h3>
            <div className="space-y-3">
              <Link href="/ai-nail-art" className="block">
                <div className="p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                  <p className="font-medium text-gray-700">AI Art System</p>
                  <p className="text-sm text-gray-500">Manage AI designs</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Customer Management */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">👥 Customers</h3>
            <div className="space-y-3">
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="font-medium text-gray-700">Customer Database</p>
                <p className="text-sm text-gray-500">View customer history</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">🚀 Quick Actions</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Link href="/booking">
              <button className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg transition-all">
                New Booking
              </button>
            </Link>
            <Link href="/contact">
              <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg transition-all">
                Contact Form
              </button>
            </Link>
            <Link href="/gallery">
              <button className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg transition-all">
                View Gallery
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}