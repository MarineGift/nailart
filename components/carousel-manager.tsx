'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Badge } from './ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { useToast } from '@/hooks/use-toast'
import { Plus, Edit, Trash2, Image, Eye, Upload, ArrowUp, ArrowDown } from 'lucide-react'

interface CarouselSlide {
  id: number
  title: string
  description: string
  imageUrl?: string
  color: string
  displayOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const colorOptions = [
  { value: 'from-purple-400 to-pink-400', label: 'Purple to Pink' },
  { value: 'from-blue-400 to-purple-400', label: 'Blue to Purple' },
  { value: 'from-pink-400 to-rose-400', label: 'Pink to Rose' },
  { value: 'from-indigo-400 to-blue-400', label: 'Indigo to Blue' },
  { value: 'from-green-400 to-teal-400', label: 'Green to Teal' },
  { value: 'from-yellow-400 to-orange-400', label: 'Yellow to Orange' }
]

export function CarouselManager() {
  const [carouselSlides, setCarouselSlides] = useState<CarouselSlide[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedSlide, setSelectedSlide] = useState<CarouselSlide | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    color: 'from-purple-400 to-pink-400',
    isActive: true
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchCarouselSlides()
  }, [])

  const fetchCarouselSlides = async () => {
    try {
      setLoading(true)
      // Initial data loading (can be replaced with actual API)
      const mockData: CarouselSlide[] = [
        {
          id: 1,
          title: "Premium Nail Art",
          description: "Professional nail art with custom designs",
          imageUrl: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=400",
          color: "from-purple-400 to-pink-400",
          displayOrder: 1,
          isActive: true,
          createdAt: "2025-08-20",
          updatedAt: "2025-08-20"
        },
        {
          id: 2,
          title: "Luxury Gel Manicure",
          description: "Long-lasting gel polish with premium care",
          imageUrl: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&h=400",
          color: "from-blue-400 to-purple-400",
          displayOrder: 2,
          isActive: true,
          createdAt: "2025-08-20",
          updatedAt: "2025-08-20"
        },
        {
          id: 3,
          title: "French Classic Style",
          description: "Timeless French manicure with modern touch",
          imageUrl: "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=600&h=400",
          color: "from-pink-400 to-rose-400",
          displayOrder: 3,
          isActive: true,
          createdAt: "2025-08-20",
          updatedAt: "2025-08-20"
        }
      ]
      setCarouselSlides(mockData)
    } catch (error) {
      console.error('Failed to load carousel slides:', error)
      toast({
        title: "Error",
        description: "Failed to load carousel slides",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      color: 'from-purple-400 to-pink-400',
      isActive: true
    })
  }

  const handleAdd = async () => {
    try {
      if (!formData.title.trim() || !formData.description.trim()) {
        toast({
          title: "Input Error",
          description: "Please enter both title and description",
          variant: "destructive",
        })
        return
      }

      const newSlide: CarouselSlide = {
        id: Date.now(),
        ...formData,
        displayOrder: carouselSlides.length + 1,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      }
      
      setCarouselSlides(prev => [...prev, newSlide])
      setShowAddDialog(false)
      resetForm()
      
      toast({
        title: "Success",
        description: "New carousel slide added successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add slide",
        variant: "destructive",
      })
    }
  }

  const handleEdit = async () => {
    try {
      if (!selectedSlide) return

      if (!formData.title.trim() || !formData.description.trim()) {
        toast({
          title: "Input Error",
          description: "Please enter both title and description",
          variant: "destructive",
        })
        return
      }

      const updatedSlide = {
        ...selectedSlide,
        ...formData,
        updatedAt: new Date().toISOString().split('T')[0]
      }
      
      setCarouselSlides(prev => prev.map(slide => 
        slide.id === selectedSlide.id ? updatedSlide : slide
      ))
      setShowEditDialog(false)
      setSelectedSlide(null)
      resetForm()
      
      toast({
        title: "Success",
        description: "Carousel slide updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update slide",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (slideId: number) => {
    try {
      setCarouselSlides(prev => prev.filter(slide => slide.id !== slideId))
      
      toast({
        title: "Success",
        description: "Carousel slide deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete slide",
        variant: "destructive",
      })
    }
  }

  const handleToggleActive = (slideId: number) => {
    setCarouselSlides(prev => prev.map(slide =>
      slide.id === slideId
        ? { ...slide, isActive: !slide.isActive, updatedAt: new Date().toISOString().split('T')[0] }
        : slide
    ))
  }

  const moveSlide = (slideId: number, direction: 'up' | 'down') => {
    const slideIndex = carouselSlides.findIndex(slide => slide.id === slideId)
    if (slideIndex === -1) return

    const newSlides = [...carouselSlides]
    const targetIndex = direction === 'up' ? slideIndex - 1 : slideIndex + 1

    if (targetIndex >= 0 && targetIndex < newSlides.length) {
      [newSlides[slideIndex], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[slideIndex]]
      
      // displayOrder update
      newSlides.forEach((slide, index) => {
        slide.displayOrder = index + 1
        slide.updatedAt = new Date().toISOString().split('T')[0]
      })
      
      setCarouselSlides(newSlides)
    }
  }

  const openEditDialog = (slide: CarouselSlide) => {
    setSelectedSlide(slide)
    setFormData({
      title: slide.title,
      description: slide.description,
      imageUrl: slide.imageUrl || '',
      color: slide.color,
      isActive: slide.isActive
    })
    setShowEditDialog(true)
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-6 w-6 text-purple-600" />
            Carousel Management
          </CardTitle>
          <CardDescription>
            Manage homepage carousel slides and images
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="mb-6">
                <Plus className="h-4 w-4 mr-2" />
                Add New Slide
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Carousel Slide</DialogTitle>
                <DialogDescription>
                  Enter information for the new carousel slide
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Slide Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Premium Nail Art"
                    data-testid="input-slide-title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Slide Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="e.g. Professional nail art with custom designs"
                    data-testid="input-slide-description"
                  />
                </div>
                <div>
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="imageUrl"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="https://example.com/image.jpg"
                      data-testid="input-slide-image"
                    />
                    <Button type="button" variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                  {formData.imageUrl && (
                    <div className="mt-2">
                      <img 
                        src={formData.imageUrl} 
                        alt="Preview" 
                        className="w-full h-32 object-cover rounded-lg border"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="color">Background Color</Label>
                  <Select 
                    value={formData.color} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}
                  >
                    <SelectTrigger data-testid="select-slide-color">
                      <SelectValue placeholder="Select background color" />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded bg-gradient-to-r ${option.value}`}></div>
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    data-testid="checkbox-slide-active"
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAdd} data-testid="button-save-slide">
                  Add Slide
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Slide List */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : carouselSlides.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No carousel slides registered</p>
              </div>
            ) : (
              carouselSlides.map((slide, index) => (
                <Card key={slide.id} className="border-l-4 border-purple-400">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4 flex-1">
                        {slide.imageUrl && (
                          <img 
                            src={slide.imageUrl} 
                            alt={slide.title}
                            className="w-24 h-24 object-cover rounded-lg border"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={slide.isActive ? "default" : "secondary"}>
                              #{slide.displayOrder} {slide.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <div className={`w-4 h-4 rounded bg-gradient-to-r ${slide.color}`}></div>
                          </div>
                          <h3 className="font-semibold text-lg mb-2">{slide.title}</h3>
                          <p className="text-gray-600 mb-4">{slide.description}</p>
                          <div className="text-xs text-gray-400">
                            Created: {slide.createdAt} | Updated: {slide.updatedAt}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moveSlide(slide.id, 'up')}
                          disabled={index === 0}
                          data-testid={`button-move-up-${slide.id}`}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moveSlide(slide.id, 'down')}
                          disabled={index === carouselSlides.length - 1}
                          data-testid={`button-move-down-${slide.id}`}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(slide.id)}
                          data-testid={`button-toggle-${slide.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(slide)}
                          data-testid={`button-edit-${slide.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(slide.id)}
                          data-testid={`button-delete-${slide.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Carousel Slide</DialogTitle>
            <DialogDescription>
              Update slide information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Slide Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Premium Nail Art"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Slide Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="e.g. Professional nail art with custom designs"
              />
            </div>
            <div>
              <Label htmlFor="edit-imageUrl">Image URL</Label>
              <div className="flex gap-2">
                <Input
                  id="edit-imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
                <Button type="button" variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
              {formData.imageUrl && (
                <div className="mt-2">
                  <img 
                    src={formData.imageUrl} 
                    alt="Preview" 
                    className="w-full h-32 object-cover rounded-lg border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="edit-color">Background Color</Label>
              <Select 
                value={formData.color} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select background color" />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded bg-gradient-to-r ${option.value}`}></div>
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              />
              <Label htmlFor="edit-isActive">Active</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>
              Update
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}