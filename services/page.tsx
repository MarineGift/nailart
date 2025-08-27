'use client'

import { useState, useEffect } from 'react'
import { Footer } from '@/components/Footer'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ChevronLeft, ChevronRight, Clock, DollarSign, Star } from 'lucide-react'

// Default image function
const getDefaultImage = (category: string) => {
  const imageMap: { [key: string]: string } = {
    'manicure': 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop',
    'pedicure': 'https://images.unsplash.com/photo-1595348020949-87cdfbb44174?w=400&h=300&fit=crop',
    'art': 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=400&h=300&fit=crop',
    'gel': 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=400&h=300&fit=crop',
    'spa': 'https://images.unsplash.com/photo-1562887250-3c85ee2151e5?w=400&h=300&fit=crop'
  }
  return imageMap[category] || imageMap['manicure']
}

// Services Carousel Component
function ServicesCarousel({ services }: { services: Service[] }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  
  const convertToDollars = (cents: number) => {
    return (cents / 100).toFixed(2)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % services.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + services.length) % services.length)
  }

  // Auto-advance carousel
  useEffect(() => {
    if (services.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % services.length)
      }, 4000)
      return () => clearInterval(timer)
    }
  }, [services.length])

  if (services.length === 0) return null

  return (
    <div className="relative">
      {/* Carousel Container */}
      <div className="relative h-screen overflow-hidden">
        {services.map((service, index) => (
          <div
            key={service.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="h-full relative">
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${service.imageUrl || getDefaultImage(service.category || 'manicure')})` }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-600/20"></div>
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10 flex items-center justify-center h-full text-center text-white p-8">
                <div>
                  <Badge className="mb-4 bg-white/20 text-white border-white/30">
                    {service.category?.toUpperCase() || 'SERVICE'}
                  </Badge>
                  <h3 className="text-4xl font-bold mb-4">{service.name}</h3>
                  <p className="text-xl mb-6 max-w-2xl">{service.description}</p>
                  <div className="flex items-center justify-center gap-6 mb-8">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      <span className="text-2xl font-bold">${convertToDollars(service.base_price_cents)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      <span className="text-lg">{service.duration_min} min</span>
                    </div>
                  </div>
                  <Link href="/booking">
                    <Button 
                      size="lg"
                      className="bg-white text-purple-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors shadow-lg"
                    >
                      Book This Service
                    </Button>
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
        {services.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-4 h-4 rounded-full transition-all ${
              index === currentSlide ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

interface Service {
  id: string
  name: string
  description: string
  base_price_cents: number
  category: string
  duration_min: number
  is_active: boolean
  code?: string
  imageUrl?: string
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const servicesPerPage = 8
  
  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services')
      if (response.ok) {
        const data = await response.json()
        console.log('Services page loaded data:', data)
        // Remove filter since all loaded services are active
        setServices(data || [])
      }
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoading(false)
    }
  }

  // Convert cents to dollars
  const convertToDollars = (cents: number) => {
    return (cents / 100).toFixed(2)
  }

  // Pagination logic
  const totalPages = Math.ceil(services.length / servicesPerPage)
  const indexOfLastService = currentPage * servicesPerPage
  const indexOfFirstService = indexOfLastService - servicesPerPage
  const currentServices = services.slice(indexOfFirstService, indexOfLastService)

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
    // 서비스 그리드 섹션으로 스크롤 (carousel 건너뛰기)
    const servicesSection = document.getElementById('services-grid')
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'manicure': return 'bg-pink-100 text-pink-800'
      case 'pedicure': return 'bg-blue-100 text-blue-800'
      case 'art': return 'bg-purple-100 text-purple-800'
      case 'extensions': return 'bg-green-100 text-green-800'
      case 'repair': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDefaultImage = (category: string) => {
    const images = {
      'manicure': 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&h=300&fit=crop',
      'pedicure': 'https://images.unsplash.com/photo-1595348020949-87cdfbb44174?w=400&h=300&fit=crop',
      'art': 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop',
      'extensions': 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=400&h=300&fit=crop',
      'repair': 'https://images.unsplash.com/photo-1562887250-3c85ee2151e5?w=400&h=300&fit=crop'
    }
    return images[category.toLowerCase() as keyof typeof images] || images['manicure']
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Services Carousel - positioned right after the header */}
      <section className="-mt-0">
        <div className="relative">
          <ServicesCarousel services={services.slice(0, 6)} />
        </div>
      </section>

      {/* Services Grid */}
      <section id="services-grid" className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Our Services</h2>
            <div className="text-sm text-gray-500">
              Showing {indexOfFirstService + 1}-{Math.min(indexOfLastService, services.length)} of {services.length} services
            </div>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {currentServices.map((service) => (
                  <Card key={service.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-0 bg-white/80 backdrop-blur-sm">
                    <div className="relative overflow-hidden">
                      <img
                        src={service.imageUrl || getDefaultImage(service.category || 'manicure')}
                        alt={service.name}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = getDefaultImage(service.category || 'manicure')
                        }}
                      />
                      <div className="absolute top-3 right-3">
                        <Badge className={getCategoryColor(service.category || 'default')}>
                          {service.category}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{service.name}</h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{service.description}</p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          {service.duration_min} min
                        </div>
                        <div className="flex items-center font-bold text-purple-600">
                          <DollarSign className="w-4 h-4" />
                          ${convertToDollars(service.base_price_cents)}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => setSelectedService(service)}
                            >
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-2xl">{service.name}</DialogTitle>
                              <DialogDescription className="text-base">
                                <Badge className={getCategoryColor(service.category || 'default')}>
                                  {service.category}
                                </Badge>
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6">
                              <img
                                src={service.imageUrl || getDefaultImage(service.category || 'manicure')}
                                alt={service.name}
                                className="w-full h-64 object-cover rounded-lg"
                              />
                              <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                  <h4 className="font-semibold mb-2">Description</h4>
                                  <p className="text-gray-600">{service.description}</p>
                                </div>
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Duration:</span>
                                    <div className="flex items-center">
                                      <Clock className="w-4 h-4 mr-1 text-gray-500" />
                                      {service.duration_min} minutes
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Price:</span>
                                    <div className="flex items-center font-bold text-purple-600 text-xl">
                                      <DollarSign className="w-5 h-5" />
                                      ${convertToDollars(service.base_price_cents)}
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Category:</span>
                                    <Badge className={getCategoryColor(service.category || 'default')}>
                                      {service.category}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-3 pt-4">
                                <Link href="/booking" className="flex-1">
                                  <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
                                    Book This Service
                                  </Button>
                                </Link>
                                <Button variant="outline">
                                  <Star className="w-4 h-4 mr-2" />
                                  Save
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Link href="/booking">
                          <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
                            Book
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center space-x-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className={currentPage === page ? "bg-gradient-to-r from-pink-500 to-purple-500" : ""}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Ready to Book Your Appointment?</h2>
          <p className="text-lg text-gray-600 mb-8">Choose your preferred service and schedule your visit with our expert nail technicians.</p>
          <Link href="/booking">
            <Button size="lg" className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-lg px-8 py-6">
              Book Now - Starting from ${services.length > 0 ? Math.min(...services.map(s => Number(convertToDollars(s.base_price_cents)))) : 25}
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}