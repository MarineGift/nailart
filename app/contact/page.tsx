'use client'

import { Footer } from '@/components/Footer'
import Link from 'next/link'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Hero Carousel Header - Salon Location */}
      <section className="-mt-0">
        <div className="relative overflow-hidden shadow-2xl">
          <div className="h-96 bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-200 relative">
            <div className="absolute inset-0">
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-40"
                style={{
                  backgroundImage: 'url(https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=400&fit=crop)'
                }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-300/30 via-purple-300/30 to-indigo-300/30"></div>
            </div>
            <div className="relative z-10 flex items-center justify-center h-full text-center px-8">
              <div>
                <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
                  Salon Location
                </h1>
                <p className="text-xl text-white/90 drop-shadow-md max-w-2xl mx-auto">
                  Find us at the heart of Washington DC
                </p>
                <div className="mt-6 flex justify-center space-x-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                    <span className="text-white font-medium">📍 Downtown DC</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                    <span className="text-white font-medium">🚇 Metro Access</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                    <span className="text-white font-medium">📞 Easy Contact</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Us Section - Moved up */}
      <section className="pt-8 pb-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-8 shadow-xl border border-pink-200 mb-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-pink-200">
                <span className="text-purple-600 text-xl">💌</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-purple-800 mb-2">Contact Us</h3>
                <p className="text-purple-600">Get in touch with our team</p>
              </div>
            </div>

            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-purple-700 mb-2">Full Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-400 outline-none bg-white/70 backdrop-blur-sm"
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-purple-700 mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-400 outline-none bg-white/70 backdrop-blur-sm"
                  placeholder="Enter your phone number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-purple-700 mb-2">Message</label>
                <textarea 
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-400 outline-none resize-none bg-white/70 backdrop-blur-sm"
                  placeholder="How can we help you?"
                ></textarea>
              </div>
              
              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto px-4 space-y-8">
          
          {/* Phone Contact */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 text-xl">📞</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-purple-600 mb-2">Nail Salon</h3>
                <p className="text-gray-700 mb-2">Call us @ 202.898.0826</p>
                <p className="text-gray-600 mb-4">We are here Monday - Friday from 10:00am to 7:00pm</p>
                <p className="text-gray-600">Kindly make your appointments by giving us a call. We look forward to seeing you!</p>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 text-xl">📍</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-purple-600 mb-4">Where are we?</h3>
                <div className="mb-4">
                  <p className="font-semibold text-gray-800">The Ronald Reagan Building & International Trade Center</p>
                  <p className="text-gray-600">Space C-044</p>
                  <p className="text-gray-600">1300 Pennsylvania Avenue</p>
                  <p className="text-gray-600">Washington, DC 20004</p>
                </div>
                <div className="relative w-full h-64 rounded-lg overflow-hidden shadow-md mb-4">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3104.2659!2d-77.032!3d38.896!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89b7b7bcdecbb1df%3A0x715969d86d0b76bf!2sRonald%20Reagan%20Building%20and%20International%20Trade%20Center!5e0!3m2!1sen!2sus!4v1640995200000!5m2!1sen!2sus"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-lg"
                    data-testid="embedded-google-maps-contact"
                  ></iframe>
                </div>
                <button 
                  onClick={() => {
                    const address = "The Ronald Reagan Building & International Trade Center, 1300 Pennsylvania Avenue NW, Washington, DC 20004"
                    const encodedAddress = encodeURIComponent(address)
                    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank')
                  }}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                  data-testid="button-google-maps-location"
                >
                  📍 Open in Google Maps
                </button>
              </div>
            </div>
          </div>

          {/* Directions */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 text-xl">✅</span>
              </div>
              <div className="w-full">
                <h3 className="text-xl font-bold text-green-600 mb-4">Directions</h3>
                
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-2">Metro Access</h4>
                  <p className="text-gray-600 text-sm">Take Metro to Federal Triangle station (Blue/Orange/Silver Line), then 2-minute walk. Exit towards 12th Street and Pennsylvania Avenue.</p>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-2">Walking Directions</h4>
                  <p className="text-gray-600 text-sm">Enter through the main entrance, take elevator to C level, and look for room C-044.</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-800 text-sm">Located inside the building and may be hard to find. If you get lost, call us at 202.898.0826!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Location Map */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 text-xl">📍</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-purple-600 mb-2">Location Map</h3>
                <p className="text-gray-600">1300 Pennsylvania Avenue NW, Washington, DC 20004</p>
              </div>
            </div>
            
            <button 
              onClick={() => {
                const address = "1300 Pennsylvania Avenue NW, Washington, DC 20004"
                const encodedAddress = encodeURIComponent(address)
                window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank')
              }}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors mb-4"
              data-testid="button-google-maps-main"
            >
              🗺️ Open in Google Maps
            </button>

            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">🗺️</div>
                <p className="text-gray-600">Interactive Map</p>
                <p className="text-sm text-gray-500">Click "Open in Google Maps" to view full map</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  )
}