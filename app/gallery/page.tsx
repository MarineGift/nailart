'use client'

import { useState, useEffect } from 'react'
import { Footer } from '@/components/Footer'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

interface GalleryItem {
  id: string
  title: string
  description: string
  image_url: string
  category: string
  is_featured: boolean
  created_at: string
}

export default function GalleryPage() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const itemsPerPage = 12

  // Fallback images for demonstration
  const fallbackImages = [
    {
      id: '1',
      title: 'French Manicure',
      description: 'Classic French nail design',
      image_url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=400&fit=crop',
      category: 'Classic',
      is_featured: true,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Gel Polish Art',
      description: 'Colorful gel nail art',
      image_url: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=400&h=400&fit=crop',
      category: 'Artistic',
      is_featured: false,
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      title: 'Nail Extension',
      description: 'Beautiful nail extensions',
      image_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop',
      category: 'Extension',
      is_featured: true,
      created_at: new Date().toISOString()
    },
    {
      id: '4',
      title: 'Spa Treatment',
      description: 'Relaxing spa nail treatment',
      image_url: 'https://images.unsplash.com/photo-1562887250-3c85ee2151e5?w=400&h=400&fit=crop',
      category: 'Spa',
      is_featured: false,
      created_at: new Date().toISOString()
    },
    {
      id: '5',
      title: 'Pedicure Service',
      description: 'Professional pedicure treatment',
      image_url: 'https://images.unsplash.com/photo-1595348020949-87cdfbb44174?w=400&h=400&fit=crop',
      category: 'Pedicure',
      is_featured: true,
      created_at: new Date().toISOString()
    },
    {
      id: '6',
      title: 'Nail Art Design',
      description: 'Creative nail art patterns',
      image_url: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=400&h=400&fit=crop',
      category: 'Artistic',
      is_featured: false,
      created_at: new Date().toISOString()
    },
    {
      id: '7',
      title: 'Ombre Nails',
      description: 'Gradient ombre nail design',
      image_url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=400&fit=crop',
      category: 'Gradient',
      is_featured: true,
      created_at: new Date().toISOString()
    },
    {
      id: '8',
      title: 'Glitter Polish',
      description: 'Sparkly glitter nail polish',
      image_url: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=400&h=400&fit=crop',
      category: 'Glitter',
      is_featured: false,
      created_at: new Date().toISOString()
    },
    {
      id: '9',
      title: 'Acrylic Nails',
      description: 'Strong and durable acrylic nails',
      image_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop',
      category: 'Acrylic',
      is_featured: true,
      created_at: new Date().toISOString()
    },
    {
      id: '10',
      title: 'Natural Look',
      description: 'Clean and natural nail appearance',
      image_url: 'https://images.unsplash.com/photo-1562887250-3c85ee2151e5?w=400&h=400&fit=crop',
      category: 'Natural',
      is_featured: false,
      created_at: new Date().toISOString()
    },
    {
      id: '11',
      title: 'Seasonal Design',
      description: 'Special seasonal nail themes',
      image_url: 'https://images.unsplash.com/photo-1595348020949-87cdfbb44174?w=400&h=400&fit=crop',
      category: 'Seasonal',
      is_featured: true,
      created_at: new Date().toISOString()
    },
    {
      id: '12',
      title: 'Bridal Nails',
      description: 'Elegant bridal nail designs',
      image_url: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=400&h=400&fit=crop',
      category: 'Bridal',
      is_featured: false,
      created_at: new Date().toISOString()
    }
  ]

  useEffect(() => {
    fetchGalleryItems()
  }, [currentPage])

  const fetchGalleryItems = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/gallery?page=${currentPage}&limit=${itemsPerPage}`)
      if (response.ok) {
        const data = await response.json()
        setGalleryItems(data.data || data)
      } else {
        // Use fallback data
        setGalleryItems(fallbackImages.slice(0, itemsPerPage))
      }
    } catch (error) {
      console.error('Failed to fetch gallery items:', error)
      // Use fallback data
      setGalleryItems(fallbackImages.slice(0, itemsPerPage))
    }
    setLoading(false)
  }

  const totalPages = Math.ceil(fallbackImages.length / itemsPerPage)

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return fallbackImages.slice(startIndex, endIndex)
  }

  const handleImageClick = (item: GalleryItem) => {
    setSelectedImage(item)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedImage(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Hero Carousel Header - Nail Art Gallery */}
      <section className="-mt-0">
        <div className="relative overflow-hidden shadow-2xl">
          <div className="h-96 bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-200 relative">
            <div className="absolute inset-0">
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-40"
                style={{
                  backgroundImage: 'url(https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200&h=400&fit=crop)'
                }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-300/30 via-purple-300/30 to-indigo-300/30"></div>
            </div>
            <div className="relative z-10 flex items-center justify-center h-full text-center px-8">
              <div>
                <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
                  Nail Art Gallery
                </h1>
                <p className="text-xl text-white/90 drop-shadow-md max-w-2xl mx-auto">
                  Browse our professional nail art designs and choose your preferred style
                </p>
                <div className="mt-6 flex justify-center space-x-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                    <span className="text-white font-medium">✨ Featured Designs</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                    <span className="text-white font-medium">🎨 Art Categories</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                    <span className="text-white font-medium">📱 Easy Booking</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="pt-16 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <>
              {/* 3x4 Gallery Grid (12 images) */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
                {getCurrentPageItems().map((item) => (
                  <div key={item.id} className="group cursor-pointer" onClick={() => handleImageClick(item)}>
                    <div className="aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                      <Image
                        src={item.image_url}
                        alt={item.title}
                        width={400}
                        height={400}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="mt-3 text-center">
                      <h3 className="font-semibold text-gray-800">{item.title}</h3>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {item.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-center items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="flex items-center space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 ${
                        currentPage === page
                          ? "bg-purple-600 hover:bg-purple-700"
                          : "hover:bg-purple-100"
                      }`}
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6">Found a design you love?</h2>
          <p className="text-xl mb-8 opacity-90">Book now and experience our professional nail artist services</p>
          <div className="flex justify-center gap-4">
            <Link 
              href="/booking" 
              className="bg-white text-purple-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-colors text-lg"
            >
              Book Appointment
            </Link>
          </div>
        </div>
      </section>

      {/* Image Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
          {selectedImage && (
            <div className="relative">
              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={closeModal}
                className="absolute top-4 right-4 z-10 bg-black/20 hover:bg-black/40 text-white rounded-full h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Image */}
              <div className="relative aspect-square max-h-[60vh] overflow-hidden">
                <Image
                  src={selectedImage.image_url}
                  alt={selectedImage.title}
                  width={800}
                  height={800}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Image Details */}
              <div className="p-6 bg-white">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
                        {selectedImage.title}
                      </DialogTitle>
                    </DialogHeader>
                    <span className="inline-block bg-purple-100 text-purple-600 text-sm font-medium px-3 py-1 rounded-full mb-3">
                      {selectedImage.category}
                    </span>
                  </div>
                  {selectedImage.is_featured && (
                    <span className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Featured
                    </span>
                  )}
                </div>
                
                <p className="text-gray-600 leading-relaxed mb-4">
                  {selectedImage.description}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <Link href="/booking" className="w-full">
                      Book This Design
                    </Link>
                  </Button>
                  <Button variant="outline" onClick={closeModal} className="px-6">
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}