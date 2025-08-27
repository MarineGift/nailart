'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Trash2, Plus, Edit, MoveUp, MoveDown, Eye, Upload, Shuffle, RotateCcw, Image as ImageIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'

interface CarouselItem {
  id: string
  title: string
  description: string
  image_url: string
  position: number
  location: 'homepage' | 'services'
  is_active: boolean
  button_text?: string
  button_action?: string
  created_at: string
}

interface CarouselManagementProps {
  currentUser: any
}

export function CarouselManagement({ currentUser }: CarouselManagementProps) {
  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([])
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CarouselItem | null>(null)
  const [activeLocation, setActiveLocation] = useState<'homepage' | 'services'>('homepage')
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    location: 'homepage' as 'homepage' | 'services',
    is_active: true,
    button_text: 'Book Service',
    button_action: 'booking'
  })

  // High-quality nail art images from Unsplash
  const nailArtImages = [
    {
      url: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&h=600&fit=crop",
      title: "Professional Manicure",
      description: "Expert nail care and design services"
    },
    {
      url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=600&fit=crop",
      title: "Nail Art Creation",
      description: "Skilled nail technician creating beautiful designs"
    },
    {
      url: "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=800&h=600&fit=crop",
      title: "Gel Polish Application",
      description: "Precise gel polish application techniques"
    },
    {
      url: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800&h=600&fit=crop",
      title: "Creative Nail Designs",
      description: "Artistic nail art expressions"
    },
    {
      url: "https://images.unsplash.com/photo-1595348020949-87cdfbb44174?w=800&h=600&fit=crop",
      title: "Luxury Pedicure",
      description: "Complete foot and nail care treatment"
    },
    {
      url: "https://images.unsplash.com/photo-1562887250-3c85ee2151e5?w=800&h=600&fit=crop",
      title: "Hand Treatment",
      description: "Professional hand and nail care"
    },
    {
      url: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&h=600&fit=crop",
      title: "Nail Salon Interior",
      description: "Modern and comfortable nail salon environment"
    },
    {
      url: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop", 
      title: "Colorful Nail Polish",
      description: "Wide selection of premium nail polish colors"
    }
  ]

  useEffect(() => {
    fetchCarouselItems()
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services')
      if (response.ok) {
        const data = await response.json()
        setServices(data)
      }
    } catch (error) {
      console.error('Failed to fetch services:', error)
    }
  }

  const fetchCarouselItems = async () => {
    setLoading(true)
    try {
      // Real carousel items from main homepage and services
      const homepageItems: CarouselItem[] = [
        {
          id: '1',
          title: 'Professional Nail Art',
          description: 'Expert nail artistry and design',
          image_url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&h=600&fit=crop',
          position: 1,
          location: 'homepage',
          is_active: true,
          button_text: 'Book This Service',
          button_action: 'booking',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Nail Technician at Work',
          description: 'Skilled professionals creating beautiful nails',
          image_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=600&fit=crop',
          position: 2,
          location: 'homepage',
          is_active: true,
          button_text: 'Book This Service',
          button_action: 'booking',
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          title: 'Gel Polish Application',
          description: 'Precise application techniques',
          image_url: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=800&h=600&fit=crop',
          position: 3,
          location: 'homepage',
          is_active: true,
          button_text: 'Book This Service',
          button_action: 'booking',
          created_at: new Date().toISOString()
        },
        {
          id: '4',
          title: 'Creative Nail Designs',
          description: 'Artistic expression on nails',
          image_url: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800&h=600&fit=crop',
          position: 4,
          location: 'homepage',
          is_active: true,
          button_text: 'Book This Service',
          button_action: 'booking',
          created_at: new Date().toISOString()
        },
        {
          id: '5',
          title: 'Pedicure Service',
          description: 'Complete foot and nail care',
          image_url: 'https://images.unsplash.com/photo-1595348020949-87cdfbb44174?w=800&h=600&fit=crop',
          position: 5,
          location: 'homepage',
          is_active: true,
          button_text: 'Book This Service',
          button_action: 'booking',
          created_at: new Date().toISOString()
        },
        {
          id: '6',
          title: 'Manicure Treatment',
          description: 'Professional hand and nail care',
          image_url: 'https://images.unsplash.com/photo-1562887250-3c85ee2151e5?w=800&h=600&fit=crop',
          position: 6,
          location: 'homepage',
          is_active: true,
          button_text: 'Book This Service',
          button_action: 'booking',
          created_at: new Date().toISOString()
        }
      ]

      const serviceItems: CarouselItem[] = [
        {
          id: 's1',
          title: 'Acrylic Extensions',
          description: 'Durable and beautiful acrylic nail extensions',
          image_url: nailArtImages[0].url,
          position: 1,
          location: 'services',
          is_active: true,
          button_text: 'Book Now',
          button_action: 'booking',
          created_at: new Date().toISOString()
        },
        {
          id: 's2',
          title: 'Gel Manicure',
          description: 'Long-lasting gel polish application',
          image_url: nailArtImages[1].url,
          position: 2,
          location: 'services',
          is_active: true,
          button_text: 'Book Now',
          button_action: 'booking',
          created_at: new Date().toISOString()
        },
        {
          id: 's3',
          title: 'Nail Art Design',
          description: 'Custom nail art and creative designs',
          image_url: nailArtImages[2].url,
          position: 3,
          location: 'services',
          is_active: true,
          button_text: 'Book Now',
          button_action: 'booking',
          created_at: new Date().toISOString()
        },
        {
          id: 's4',
          title: 'French Manicure',
          description: 'Classic French tip manicure',
          image_url: nailArtImages[3].url,
          position: 4,
          location: 'services',
          is_active: true,
          button_text: 'Book Now',
          button_action: 'booking',
          created_at: new Date().toISOString()
        },
        {
          id: 's5',
          title: 'Spa Pedicure',
          description: 'Relaxing spa pedicure treatment',
          image_url: nailArtImages[4].url,
          position: 5,
          location: 'services',
          is_active: true,
          button_text: 'Book Now',
          button_action: 'booking',
          created_at: new Date().toISOString()
        },
        {
          id: 's6',
          title: 'Chrome Nails',
          description: 'Stunning chrome mirror finish',
          image_url: nailArtImages[5].url,
          position: 6,
          location: 'services',
          is_active: true,
          button_text: 'Book Now',
          button_action: 'booking',
          created_at: new Date().toISOString()
        },
        {
          id: 's7',
          title: 'Luxury Manicure',
          description: 'Premium nail treatment and design',
          image_url: nailArtImages[6].url,
          position: 7,
          location: 'services',
          is_active: true,
          button_text: 'Book Now',
          button_action: 'booking',
          created_at: new Date().toISOString()
        },
        {
          id: 's8',
          title: 'Ombre Effect',
          description: 'Beautiful gradient color blending',
          image_url: nailArtImages[7].url,
          position: 8,
          location: 'services',
          is_active: true,
          button_text: 'Book Now',
          button_action: 'booking',
          created_at: new Date().toISOString()
        }
      ]

      const allItems = [...homepageItems, ...serviceItems]
      setCarouselItems(allItems)
    } catch (error) {
      console.error('Failed to fetch carousel items:', error)
      toast({
        title: 'Error',
        description: 'Failed to load carousel items',
        variant: 'destructive'
      })
    }
    setLoading(false)
  }

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.image_url) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      })
      return
    }

    try {
      const newItem: CarouselItem = {
        id: Date.now().toString(),
        ...formData,
        position: getNextPosition(formData.location),
        created_at: new Date().toISOString()
      }

      if (editingItem) {
        // Update existing item
        setCarouselItems(prev => prev.map(item => 
          item.id === editingItem.id ? { ...newItem, id: editingItem.id, position: editingItem.position } : item
        ))
        toast({
          title: 'Success',
          description: 'Carousel item updated successfully'
        })
      } else {
        // Add new item
        setCarouselItems(prev => [...prev, newItem])
        toast({
          title: 'Success',
          description: 'Carousel item created successfully'
        })
      }

      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error saving carousel item:', error)
      toast({
        title: 'Error',
        description: 'Failed to save carousel item',
        variant: 'destructive'
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this carousel item?')) return

    try {
      setCarouselItems(prev => prev.filter(item => item.id !== id))
      toast({
        title: 'Success',
        description: 'Carousel item deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting carousel item:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete carousel item',
        variant: 'destructive'
      })
    }
  }

  const handleMoveUp = (id: string) => {
    setCarouselItems(prev => {
      const items = [...prev]
      const locationItems = items.filter(item => item.location === activeLocation)
      const itemIndex = locationItems.findIndex(item => item.id === id)
      
      if (itemIndex > 0) {
        const currentItem = locationItems[itemIndex]
        const previousItem = locationItems[itemIndex - 1]
        
        // Swap positions
        const tempPosition = currentItem.position
        currentItem.position = previousItem.position
        previousItem.position = tempPosition
        
        // Update the full array
        const currentFullIndex = items.findIndex(item => item.id === currentItem.id)
        const previousFullIndex = items.findIndex(item => item.id === previousItem.id)
        
        items[currentFullIndex] = currentItem
        items[previousFullIndex] = previousItem
      }
      
      return items
    })
  }

  const handleMoveDown = (id: string) => {
    setCarouselItems(prev => {
      const items = [...prev]
      const locationItems = items.filter(item => item.location === activeLocation)
      const itemIndex = locationItems.findIndex(item => item.id === id)
      
      if (itemIndex < locationItems.length - 1) {
        const currentItem = locationItems[itemIndex]
        const nextItem = locationItems[itemIndex + 1]
        
        // Swap positions
        const tempPosition = currentItem.position
        currentItem.position = nextItem.position
        nextItem.position = tempPosition
        
        // Update the full array
        const currentFullIndex = items.findIndex(item => item.id === currentItem.id)
        const nextFullIndex = items.findIndex(item => item.id === nextItem.id)
        
        items[currentFullIndex] = currentItem
        items[nextFullIndex] = nextItem
      }
      
      return items
    })
  }

  const toggleActive = (id: string) => {
    setCarouselItems(prev => prev.map(item => 
      item.id === id ? { ...item, is_active: !item.is_active } : item
    ))
  }

  const getNextPosition = (location: 'homepage' | 'services') => {
    const locationItems = carouselItems.filter(item => item.location === location)
    return locationItems.length > 0 ? Math.max(...locationItems.map(item => item.position)) + 1 : 1
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_url: '',
      location: 'homepage',
      is_active: true,
      button_text: 'Book Service',
      button_action: 'booking'
    })
    setEditingItem(null)
  }

  const openEditDialog = (item: CarouselItem) => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      description: item.description,
      image_url: item.image_url,
      location: item.location,
      is_active: item.is_active,
      button_text: item.button_text || 'Book Service',
      button_action: item.button_action || 'booking'
    })
    setIsDialogOpen(true)
  }

  const addPredefinedImages = () => {
    const newItems: CarouselItem[] = nailArtImages.map((image, index) => ({
      id: (Date.now() + index).toString(),
      title: image.title,
      description: image.description,
      image_url: image.url,
      position: getNextPosition(activeLocation) + index,
      location: activeLocation,
      is_active: true,
      button_text: 'Book Service',
      button_action: 'booking',
      created_at: new Date().toISOString()
    }))

    setCarouselItems(prev => [...prev, ...newItems])
    toast({
      title: 'Success',
      description: `Added ${nailArtImages.length} nail art images to ${activeLocation} carousel`
    })
  }

  const filteredItems = carouselItems
    .filter(item => item.location === activeLocation)
    .sort((a, b) => a.position - b.position)

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Carousel Management
          </CardTitle>
          <CardDescription>
            Manage carousel images for homepage and services page. Add, edit, delete, and reorder images.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeLocation} onValueChange={(value) => setActiveLocation(value as 'homepage' | 'services')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="homepage">Homepage Carousel</TabsTrigger>
          <TabsTrigger value="services">Services Carousel</TabsTrigger>
        </TabsList>

        <TabsContent value={activeLocation} className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {activeLocation === 'homepage' ? 'Homepage' : 'Services'} Carousel Items ({filteredItems.length})
            </h3>
            <div className="flex gap-2">
              <Button onClick={addPredefinedImages} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Nail Art Images
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Custom Image
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingItem ? 'Edit Carousel Item' : 'Add New Carousel Item'}
                    </DialogTitle>
                    <DialogDescription>
                      Create or edit a carousel slide with image, title, and description.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="title" className="text-right">Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="col-span-3"
                        placeholder="Carousel slide title"
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="col-span-3"
                        placeholder="Carousel slide description"
                        rows={3}
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="image_url" className="text-right">Image URL</Label>
                      <Input
                        id="image_url"
                        value={formData.image_url}
                        onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                        className="col-span-3"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="location" className="text-right">Location</Label>
                      <Select value={formData.location} onValueChange={(value) => setFormData(prev => ({ ...prev, location: value as 'homepage' | 'services' }))}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="homepage">Homepage Carousel</SelectItem>
                          <SelectItem value="services">Services Carousel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="button_text" className="text-right">Button Text</Label>
                      <Input
                        id="button_text"
                        value={formData.button_text}
                        onChange={(e) => setFormData(prev => ({ ...prev, button_text: e.target.value }))}
                        className="col-span-3"
                        placeholder="Book Service"
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="is_active" className="text-right">Active</Label>
                      <Checkbox
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked as boolean }))}
                      />
                    </div>

                    {formData.image_url && (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Preview</Label>
                        <div className="col-span-3">
                          <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                            <Image
                              src={formData.image_url}
                              alt="Preview"
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <DialogFooter>
                    <Button onClick={handleSubmit} disabled={!formData.title || !formData.description || !formData.image_url}>
                      {editingItem ? 'Update' : 'Create'} Carousel Item
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full"></div>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredItems.length === 0 ? (
                <Card className="p-8 text-center">
                  <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No carousel items</h3>
                  <p className="text-gray-500 mb-4">Add your first carousel item to get started.</p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Item
                  </Button>
                </Card>
              ) : (
                filteredItems.map((item, index) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="flex">
                      <div className="relative w-48 h-32 flex-shrink-0">
                        <Image
                          src={item.image_url}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                        {!item.is_active && (
                          <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
                            <Badge variant="secondary">Inactive</Badge>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{item.title}</h4>
                              <Badge variant="outline">Position {item.position}</Badge>
                              {item.is_active ? (
                                <Badge className="bg-green-100 text-green-800">Active</Badge>
                              ) : (
                                <Badge variant="secondary">Inactive</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                            <p className="text-xs text-gray-500">Button: "{item.button_text}"</p>
                          </div>
                          
                          <div className="flex items-center gap-1 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMoveUp(item.id)}
                              disabled={index === 0}
                            >
                              <MoveUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMoveDown(item.id)}
                              disabled={index === filteredItems.length - 1}
                            >
                              <MoveDown className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleActive(item.id)}
                            >
                              <Eye className={`h-4 w-4 ${item.is_active ? 'text-green-600' : 'text-gray-400'}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}