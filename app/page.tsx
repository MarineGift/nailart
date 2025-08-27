'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/navigation'
import Link from 'next/link'

export default function HomePage() {
  // 기본 갤러리 이미지 (정적)
  const galleryImages = [
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
  const [mounted, setMounted] = useState(false)

  // Hydration 문제 해결
  useEffect(() => {
    setMounted(true)
  }, [])

  // 자동 슬라이드
  useEffect(() => {
    if (!mounted) return
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % galleryImages.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [mounted, galleryImages.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % galleryImages.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        </div>
      </div>
    )
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
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${image.image_url})` }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-4">
                  <h1 className="text-5xl md:text-7xl font-bold mb-6 text-center">
                    ConnieNail
                  </h1>
                  <p className="text-xl md:text-2xl mb-8 text-center max-w-2xl">
                    Luxury Nail Salon & AI Art Experience in Washington DC
                  </p>
                  <Link href="/booking">
                    <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      Book Appointment
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
          
          {/* Carousel Controls */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all"
          >
            ←
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all"
          >
            →
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
            {galleryImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Our Premium Services
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">💅</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Classic Manicure</h3>
                <p className="text-gray-600 mb-6">Professional nail care with premium polish application</p>
                <div className="text-3xl font-bold text-purple-600">$35</div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">✨</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Gel Polish</h3>
                <p className="text-gray-600 mb-6">Long-lasting gel polish with UV curing technology</p>
                <div className="text-3xl font-bold text-purple-600">$45</div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">🎨</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">AI Nail Art</h3>
                <p className="text-gray-600 mb-6">Custom designs created with AI-powered technology</p>
                <div className="text-3xl font-bold text-purple-600">$65</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-white/90 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Visit ConnieNail
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">📍 Location</h3>
              <p className="text-gray-600">
                The Ronald Reagan Building<br />
                Space C-044<br />
                1300 Pennsylvania Avenue NW<br />
                Washington, DC 20004
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">📞 Contact</h3>
              <p className="text-gray-600">
                Phone: (202) 898-0826<br />
                Open 7 days a week<br />
                Walk-ins welcome
              </p>
            </div>
          </div>
          <div className="mt-12">
            <Link href="/booking">
              <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-12 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                Book Your Appointment
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}