'use client'

import { useState, useEffect } from 'react'
import { CustomerBookingFlow } from '@/components/customer-booking-flow'
// Remove Header import - using Navigation from LayoutContent
import { Footer } from '@/components/Footer'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function HomePage() {
  const [showBooking, setShowBooking] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [galleryImages, setGalleryImages] = useState<any[]>([])
  
  // 하드코딩된 기본 갤러리 이미지 (데이터베이스 실패시 fallback)
  const defaultGalleryImages = [
    {
      id: 1,
      title: "Professional Nail Art",
      description: "Expert nail artistry and design",
      image_url: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&h=600&fit=crop",
      gradient_color: "from-pink-400 to-rose-400"
    },
    {
      id: 2,
      title: "Nail Technician at Work", 
      description: "Skilled professionals creating beautiful nails",
      image_url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=600&fit=crop",
      gradient_color: "from-purple-400 to-indigo-400"
    },
    {
      id: 3,
      title: "Gel Polish Application",
      description: "Precise application techniques", 
      image_url: "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=800&h=600&fit=crop",
      gradient_color: "from-blue-400 to-cyan-400"
    },
    {
      id: 4,
      title: "Creative Nail Designs",
      description: "Artistic expression on nails",
      image_url: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800&h=600&fit=crop", 
      gradient_color: "from-green-400 to-emerald-400"
    },
    {
      id: 5,
      title: "Pedicure Service",
      description: "Complete foot and nail care",
      image_url: "https://images.unsplash.com/photo-1595348020949-87cdfbb44174?w=800&h=600&fit=crop",
      gradient_color: "from-indigo-400 to-purple-400"
    },
    {
      id: 6,
      title: "Manicure Treatment",
      description: "Professional hand and nail care",
      image_url: "https://images.unsplash.com/photo-1562887250-3c85ee2151e5?w=800&h=600&fit=crop",
      gradient_color: "from-teal-400 to-blue-400"
    }
  ]

  // 갤러리 이미지 로드
  useEffect(() => {
    const loadGalleryImages = async () => {
      try {
        const response = await fetch('/api/gallery')
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.images && data.images.length > 0) {
            console.log('✅ Using database gallery images:', data.images.length)
            setGalleryImages(data.images)
          } else {
            console.log('📦 Using default hardcoded gallery images')
            setGalleryImages(defaultGalleryImages)
          }
        } else {
          console.log('📦 Gallery API failed, using default images')
          setGalleryImages(defaultGalleryImages)
        }
      } catch (error) {
        console.error('Gallery API error:', error)
        console.log('📦 Using default hardcoded gallery images')
        setGalleryImages(defaultGalleryImages)
      }
    }

    loadGalleryImages()
  }, [])

  // 자동 슬라이드
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % galleryImages.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [galleryImages.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % galleryImages.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)
  }

  if (showBooking) {
    return <CustomerBookingFlow />
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #E6E6FA 0%, #F8BBD9 25%, #E0BBE4 50%, #F5E6D3 75%, #E6F3FF 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
      margin: 0,
      padding: 0
    }} className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100">
      {/* Navigation handled by LayoutContent */}

      {/* Gallery Carousel - positioned right after the header */}
      <section className="-mt-0">
        <div className="relative">
          {/* Carousel Container */}
          <div className="relative h-screen overflow-hidden">
              {galleryImages.map((image, index) => (
                <div
                  key={image.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === currentSlide ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <div className="h-full relative">
                    <div 
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${image.image_url})` }}
                    ></div>
                    <div className={`absolute inset-0 bg-gradient-to-r ${image.gradient_color} opacity-20`}></div>
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative z-10 flex items-center justify-center h-full text-center text-white">
                      <div>
                        <h3 className="text-4xl font-bold mb-4">{image.title}</h3>
                        <p className="text-xl mb-8">{image.description}</p>
                        <button 
                          onClick={() => setShowBooking(true)}
                          className="bg-white text-gray-800 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors shadow-lg"
                        >
                          Book This Service
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
          
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-8 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-4 rounded-full shadow-lg transition-all z-20"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-8 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-4 rounded-full shadow-lg transition-all z-20"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
          
          {/* Dots Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
            {galleryImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-4 h-4 rounded-full transition-all ${
                  index === currentSlide 
                    ? 'bg-white scale-125' 
                    : 'bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </div>
      </section>


      {/* Services Section */}
      <section style={{
        padding: '64px 20px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(216, 180, 254, 0.1)'
      }} id="services" className="py-16 bg-white">
        <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '0 16px', textAlign: 'center' }} className="max-w-6xl mx-auto px-4 text-center">
          <div style={{ marginBottom: '48px' }} className="mb-12">
            <h2 style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: '#1F2937',
              marginBottom: '16px',
              background: 'linear-gradient(135deg, #E91E63, #9C27B0)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent'
            }} className="text-3xl font-bold text-gray-800 mb-4">
              💅 Connie's Nail Premium Services
            </h2>
            <p style={{ color: '#6B7280', fontSize: '18px' }} className="text-gray-600">
              From traditional nail care to innovative AI nail art, perfect beauty care experience awaits you.
            </p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '32px'
          }} className="grid md:grid-cols-4 gap-8">
            <div style={{ textAlign: 'center' }} className="text-center">
              <div style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #FCE7F3, #F8BBD9)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                boxShadow: '0 4px 15px rgba(248, 187, 217, 0.3)'
              }} className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span style={{ fontSize: '24px' }} className="text-2xl">💅</span>
              </div>
              <h3 style={{ fontWeight: '600', marginBottom: '8px', color: '#1F2937', fontSize: '18px' }} className="font-semibold mb-2">Spa Manicure</h3>
              <p style={{ fontSize: '14px', color: '#6B7280' }} className="text-sm text-gray-600">Perfect nail care with premium spa treatment</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="font-semibold mb-2">AI Nail Art Generation</h3>
              <p className="text-sm text-gray-600">AI creates unique personalized nail designs just for you</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💆</span>
              </div>
              <h3 className="font-semibold mb-2">Professional Waxing</h3>
              <p className="text-sm text-gray-600">Professional waxing care service from toe to full body</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💚</span>
              </div>
              <h3 className="font-semibold mb-2">Massage Therapy</h3>
              <p className="text-sm text-gray-600">Complete relaxation for body and mind with aromatherapy massage</p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Nail Art Section */}
      <section style={{
        padding: '64px 20px',
        background: 'linear-gradient(135deg, #F3E8FF, #FCE7F3)',
        position: 'relative'
      }} className="py-16 bg-gradient-to-r from-purple-50 to-pink-50">
        <div style={{ maxWidth: '896px', margin: '0 auto', padding: '0 16px', textAlign: 'center' }} className="max-w-4xl mx-auto px-4 text-center">
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 20px 40px rgba(216, 180, 254, 0.2)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(216, 180, 254, 0.3)'
          }} className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-white text-2xl">✨</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              🤖 AI Nail Art - Revolutionary Nail Art Service
            </h3>
            <p className="text-gray-600 mb-6">
              Register your nails → select nail art design → payment → visit date process. Connie's Nail AI
              analyzes your nails and pre-creates your selected nail art design, dramatically reducing
              treatment time and cost during your visit.
            </p>
            <Link href="/ai-nail-art">
              <button style={{
                background: 'linear-gradient(135deg, #9C27B0, #E91E63)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '25px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 8px 25px rgba(156, 39, 176, 0.3)',
                transition: 'all 0.3s ease',
                fontSize: '16px'
              }} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all">
                ✨ Go to AI Nail Art
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Treatment Process */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-2xl font-bold text-center mb-12">Treatment Process</h3>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">Step 1</span>
              </div>
              <h4 className="font-semibold mb-2">Nail Preparation</h4>
              <p className="text-sm text-gray-600">Cuticle care and nail trimming</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">Step 2</span>
              </div>
              <h4 className="font-semibold mb-2">Base Coating</h4>
              <p className="text-sm text-gray-600">Base work for healthy nails</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">Step 3</span>
              </div>
              <h4 className="font-semibold mb-2">Color Application</h4>
              <p className="text-sm text-gray-600">Precise color application process</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">Step 4</span>
              </div>
              <h4 className="font-semibold mb-2">Finish Coating</h4>
              <p className="text-sm text-gray-600">Top coating for long-lasting shine</p>
            </div>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="py-16 bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-800">Visit Our Salon</h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-xl">📞</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2">Contact Us</h4>
                  <p className="text-gray-600 mb-2">
                    <a href="tel:202-898-0826" className="hover:text-purple-600">
                      📞 (202) 898-0826
                    </a>
                  </p>
                  <p className="text-gray-600 text-sm">Monday - Friday: 10:00am - 7:00pm</p>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 text-xl">📍</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-gray-800 mb-3">Our Location</h4>
                  <div className="text-gray-600 text-sm mb-4">
                    <p className="font-medium">The Ronald Reagan Building</p>
                    <p>Space C-044</p>
                    <p>1300 Pennsylvania Avenue NW</p>
                    <p>Washington, DC 20004</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Embedded Google Map */}
          <div className="mt-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                🗺️ Location Map
              </h4>
              <p className="text-gray-600 mb-4">1300 Pennsylvania Avenue NW, Washington, DC 20004</p>
              <div className="relative w-full h-80 rounded-lg overflow-hidden shadow-md">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3104.2659!2d-77.032!3d38.896!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89b7b7bcdecbb1df%3A0x715969d86d0b76bf!2sRonald%20Reagan%20Building%20and%20International%20Trade%20Center!5e0!3m2!1sen!2sus!4v1640995200000!5m2!1sen!2sus"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-lg"
                  data-testid="embedded-google-maps"
                ></iframe>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  Interactive Map - Click "Open in Google Maps" to view full map
                </p>
                <button 
                  onClick={() => {
                    const address = "The Ronald Reagan Building & International Trade Center, 1300 Pennsylvania Avenue NW, Washington, DC 20004"
                    const encodedAddress = encodeURIComponent(address)
                    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank')
                  }}
                  className="mt-2 bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  data-testid="button-google-maps-homepage"
                >
                  🗺️ Open in Google Maps
                </button>
              </div>
            </div>
          </div>

          {/* Quick Booking Button */}
          <div className="text-center mt-12">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h4 className="text-2xl font-bold text-gray-800 mb-4">Ready to Book?</h4>
              <p className="text-gray-600 mb-6">Experience our professional nail services with convenient online booking</p>
              <button 
                onClick={() => setShowBooking(true)}
                className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-lg transition-all"
                data-testid="button-quick-booking"
              >
                ✨ Book Your Appointment Now
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}