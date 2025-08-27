'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/navigation'
import Link from 'next/link'

export default function HomePage() {
  // 기본 갤러리 이미지
  const defaultGalleryImages = [
    {
      id: 1,
      title: "Professional Nail Art",
      description: "Expert nail artistry and design",
      image_url: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&h=600&fit=crop",
    },
    {
      id: 2,
      title: "Nail Technician at Work", 
      description: "Skilled professionals creating beautiful nails",
      image_url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=600&fit=crop",
    },
    {
      id: 3,
      title: "Gel Polish Application",
      description: "Precise application techniques", 
      image_url: "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=800&h=600&fit=crop",
    }
  ]

  const [currentSlide, setCurrentSlide] = useState(0)
  const [galleryImages, setGalleryImages] = useState<any[]>(defaultGalleryImages)

  // 갤러리 이미지 로드
  useEffect(() => {
    const loadGalleryImages = async () => {
      try {
        const response = await fetch('/api/gallery')
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.images && data.images.length > 0) {
            setGalleryImages(data.images.slice(0, 3)) // 첫 3개만 사용
          }
        }
      } catch (error) {
        console.log('Using default images')
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100">
      <Navigation />
      
      {/* Hero Carousel */}
      <section className="relative">
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
                <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 to-purple-400/20"></div>
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10 flex items-center justify-center h-full text-center text-white px-8">
                  <div>
                    <h3 className="text-4xl md:text-5xl font-bold mb-4">{image.title}</h3>
                    <p className="text-xl mb-8 max-w-2xl mx-auto">{image.description}</p>
                    <Link href="/booking">
                      <button className="bg-white text-gray-800 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors shadow-lg">
                        Book This Service
                      </button>
                    </Link>
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
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-8 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-4 rounded-full shadow-lg transition-all z-20"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
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
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              💅 Connie's Nail Premium Services
            </h2>
            <p className="text-gray-600 text-lg">
              From traditional nail care to innovative AI nail art, perfect beauty care experience awaits you.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💅</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Spa Manicure</h3>
              <p className="text-sm text-gray-600">Perfect nail care with premium spa treatment</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Nail Art Generation</h3>
              <p className="text-sm text-gray-600">AI creates unique personalized nail designs just for you</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💆</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Professional Waxing</h3>
              <p className="text-sm text-gray-600">Professional waxing care service from toe to full body</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💚</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Massage Therapy</h3>
              <p className="text-sm text-gray-600">Complete relaxation for body and mind with aromatherapy massage</p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Nail Art Section */}
      <section className="py-16 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
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
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all">
                ✨ Go to AI Nail Art
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-gray-800 mb-12">Visit Our Salon</h3>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Contact Information */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h4 className="text-xl font-bold text-gray-800 mb-4">📞 Contact Us</h4>
              <p className="text-gray-600 mb-2">
                <a href="tel:202-898-0826" className="hover:text-purple-600 text-lg font-semibold">
                  (202) 898-0826
                </a>
              </p>
              <p className="text-gray-600 text-sm">Monday - Friday: 10:00am - 7:00pm</p>
            </div>

            {/* Location Information */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h4 className="text-xl font-bold text-gray-800 mb-4">📍 Our Location</h4>
              <div className="text-gray-600 text-sm">
                <p className="font-medium">The Ronald Reagan Building</p>
                <p>Space C-044</p>
                <p>1300 Pennsylvania Avenue NW</p>
                <p>Washington, DC 20004</p>
              </div>
            </div>
          </div>

          {/* Quick Booking Button */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h4 className="text-2xl font-bold text-gray-800 mb-4">Ready to Book?</h4>
            <p className="text-gray-600 mb-6">Experience our professional nail services with convenient online booking</p>
            <Link href="/booking">
              <button className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-lg transition-all">
                ✨ Book Your Appointment Now
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}