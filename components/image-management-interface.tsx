'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
// Switch component not available, using Button toggle instead
import { Trash2, Edit, Plus, Eye, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from 'next/image'

interface ImageData {
  id: number
  name: string
  url: string
  description: string
  category: string
  sort_order: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

interface ImageFormData {
  name: string
  url: string
  description: string
  category: string
  sort_order: number
  is_active: boolean
}

export function ImageManagementInterface() {
  const [images, setImages] = useState<ImageData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingImage, setEditingImage] = useState<ImageData | null>(null)
  const [formData, setFormData] = useState<ImageFormData>({
    name: '',
    url: '',
    description: '',
    category: 'gallery',
    sort_order: 0,
    is_active: true
  })
  const { toast } = useToast()

  // Fetch images from API
  const fetchImages = async (category?: string) => {
    try {
      const queryParam = category && category !== 'all' ? `?category=${category}` : ''
      const response = await fetch(`/api/images${queryParam}`)
      if (response.ok) {
        const data = await response.json()
        setImages(data)
      } else {
        console.error('Failed to fetch images')
        toast({
          title: "Error",
          description: "Failed to fetch images",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching images:', error)
      toast({
        title: "Error",
        description: "Error fetching images",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchImages(selectedCategory)
  }, [selectedCategory])

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const method = editingImage ? 'PUT' : 'POST'
      const url = '/api/images'
      const body = editingImage 
        ? { ...formData, id: editingImage.id }
        : formData

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: editingImage ? "Image updated successfully" : "Image created successfully",
        })
        setIsDialogOpen(false)
        resetForm()
        fetchImages(selectedCategory)
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to save image",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error saving image:', error)
      toast({
        title: "Error",
        description: "Error saving image",
        variant: "destructive"
      })
    }
  }

  // Handle delete
  const handleDelete = async (imageId: number) => {
    if (!confirm('Are you sure you want to delete this image?')) return

    try {
      const response = await fetch(`/api/images?id=${imageId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Image deleted successfully",
        })
        fetchImages(selectedCategory)
      } else {
        toast({
          title: "Error",
          description: "Failed to delete image",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error deleting image:', error)
      toast({
        title: "Error",
        description: "Error deleting image",
        variant: "destructive"
      })
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      description: '',
      category: 'gallery',
      sort_order: 0,
      is_active: true
    })
    setEditingImage(null)
  }

  // Open edit dialog
  const openEditDialog = (image: ImageData) => {
    setEditingImage(image)
    setFormData({
      name: image.name,
      url: image.url,
      description: image.description,
      category: image.category,
      sort_order: image.sort_order,
      is_active: image.is_active
    })
    setIsDialogOpen(true)
  }

  // Open add dialog
  const openAddDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'gallery', label: 'Gallery' },
    { value: 'carousel', label: 'Carousel' },
    { value: 'service', label: 'Service' },
    { value: 'general', label: 'General' }
  ]

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Image Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Image Management</CardTitle>
          <Button onClick={openAddDialog} data-testid="button-add-image">
            <Plus className="w-4 h-4 mr-2" />
            Add Image
          </Button>
        </div>
        <div className="flex items-center gap-4 mt-4">
          <Label htmlFor="category-filter">Filter by Category:</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {images.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No images found for the selected category.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image) => (
              <div key={image.id} className="border rounded-lg p-4 space-y-3">
                <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={image.url}
                    alt={image.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/placeholder-image.jpg'
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm" data-testid={`text-image-name-${image.id}`}>
                      {image.name}
                    </h3>
                    <div className="flex items-center gap-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        image.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {image.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {image.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="capitalize bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {image.category}
                    </span>
                    <span>Order: {image.sort_order}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(image.url, '_blank')}
                    data-testid={`button-view-image-${image.id}`}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(image)}
                    data-testid={`button-edit-image-${image.id}`}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(image.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    data-testid={`button-delete-image-${image.id}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Image Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingImage ? 'Edit Image' : 'Add New Image'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Image Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter image name"
                  data-testid="input-image-name"
                />
              </div>

              <div>
                <Label htmlFor="url">Image URL</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                  data-testid="input-image-url"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter image description"
                  rows={3}
                  data-testid="input-image-description"
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger data-testid="select-image-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gallery">Gallery</SelectItem>
                    <SelectItem value="carousel">Carousel</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  data-testid="input-image-sort-order"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant={formData.is_active ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                  data-testid="button-toggle-image-active"
                >
                  {formData.is_active ? "Active" : "Inactive"}
                </Button>
                <Label>Status</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleSubmit}
                  className="flex-1"
                  disabled={!formData.name || !formData.url}
                  data-testid="button-save-image"
                >
                  {editingImage ? 'Update' : 'Create'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  data-testid="button-cancel-image"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

export default ImageManagementInterface