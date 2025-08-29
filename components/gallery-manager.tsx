'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Badge } from './ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Plus, Edit, Trash2, Image, Eye, Upload } from 'lucide-react'

interface GalleryItem {
  id: number
  title: string
  description: string
  imageUrl: string
  category: 'nail_art' | 'manicure' | 'pedicure' | 'special_design'
  tags: string[]
  featured: boolean
  createdAt: string
  updatedAt: string
}

export function GalleryManager() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    category: 'nail_art' as const,
    tags: '',
    featured: false
  })
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchGalleryItems()
  }, [])

  const fetchGalleryItems = async () => {
    try {
      setLoading(true)
      // Mock data for now - replace with actual API call
      const mockData: GalleryItem[] = [
        {
          id: 1,
          title: "French Manicure Classic",
          description: "Elegant classic French manicure with perfect white tips",
          imageUrl: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400",
          category: "manicure",
          tags: ["classic", "french", "elegant"],
          featured: true,
          createdAt: "2025-08-01",
          updatedAt: "2025-08-01"
        },
        {
          id: 2,
          title: "Floral Nail Art",
          description: "Beautiful hand-painted floral designs with delicate details",
          imageUrl: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400",
          category: "nail_art",
          tags: ["floral", "artistic", "detailed"],
          featured: false,
          createdAt: "2025-08-02",
          updatedAt: "2025-08-02"
        },
        {
          id: 3,
          title: "Geometric Design",
          description: "Modern geometric patterns with metallic accents",
          imageUrl: "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=400",
          category: "special_design",
          tags: ["geometric", "modern", "metallic"],
          featured: true,
          createdAt: "2025-08-03",
          updatedAt: "2025-08-03"
        }
      ]
      setGalleryItems(mockData)
    } catch (error) {
      console.error('Error fetching gallery items:', error)
      toast({
        title: "Error",
        description: "Failed to load gallery items",
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
      category: 'nail_art',
      tags: '',
      featured: false
    })
  }

  const handleAdd = async () => {
    try {
      const newItem: GalleryItem = {
        id: Date.now(),
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      }
      
      setGalleryItems(prev => [newItem, ...prev])
      setShowAddDialog(false)
      resetForm()
      
      toast({
        title: "Success",
        description: "Gallery item added successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add gallery item",
        variant: "destructive",
      })
    }
  }

  const handleEdit = async () => {
    if (!selectedItem) return
    
    try {
      const updatedItem: GalleryItem = {
        ...selectedItem,
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        updatedAt: new Date().toISOString().split('T')[0]
      }
      
      setGalleryItems(prev => prev.map(item => 
        item.id === selectedItem.id ? updatedItem : item
      ))
      setShowEditDialog(false)
      setSelectedItem(null)
      resetForm()
      
      toast({
        title: "Success",
        description: "Gallery item updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update gallery item",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: number) => {
    try {
      setGalleryItems(prev => prev.filter(item => item.id !== id))
      toast({
        title: "Success",
        description: "Gallery item deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete gallery item",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (item: GalleryItem) => {
    setSelectedItem(item)
    setFormData({
      title: item.title,
      description: item.description,
      imageUrl: item.imageUrl,
      category: item.category,
      tags: item.tags.join(', '),
      featured: item.featured
    })
    setShowEditDialog(true)
  }

  const getCategoryBadge = (category: string) => {
    const styles = {
      nail_art: "bg-purple-100 text-purple-800",
      manicure: "bg-pink-100 text-pink-800",
      pedicure: "bg-blue-100 text-blue-800",
      special_design: "bg-green-100 text-green-800"
    }
    return styles[category as keyof typeof styles] || "bg-gray-100 text-gray-800"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Gallery Management</CardTitle>
            <CardDescription>Manage nail art gallery and portfolio</CardDescription>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-gallery-item">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Gallery Item</DialogTitle>
                <DialogDescription>
                  Add a new item to your nail art gallery
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter title"
                    data-testid="input-gallery-title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter description"
                    data-testid="textarea-gallery-description"
                  />
                </div>
                <div>
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="Enter image URL"
                    data-testid="input-gallery-image-url"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full p-2 border rounded-md"
                    data-testid="select-gallery-category"
                  >
                    <option value="nail_art">Nail Art</option>
                    <option value="manicure">Manicure</option>
                    <option value="pedicure">Pedicure</option>
                    <option value="special_design">Special Design</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="elegant, classic, modern"
                    data-testid="input-gallery-tags"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                    data-testid="checkbox-gallery-featured"
                  />
                  <Label htmlFor="featured">Featured</Label>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAdd} className="flex-1" data-testid="button-save-gallery-item">
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="aspect-square bg-gray-100 relative">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    data-testid={`image-gallery-${item.id}`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                {item.featured && (
                  <Badge className="absolute top-2 right-2 bg-yellow-500">
                    Featured
                  </Badge>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                <div className="flex items-center justify-between mb-3">
                  <Badge className={getCategoryBadge(item.category)}>
                    {item.category.replace('_', ' ')}
                  </Badge>
                  <span className="text-xs text-gray-500">{item.createdAt}</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(item)}
                    className="flex-1"
                    data-testid={`button-edit-gallery-${item.id}`}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:text-red-700"
                    data-testid={`button-delete-gallery-${item.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Gallery Item</DialogTitle>
              <DialogDescription>
                Update the gallery item details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter title"
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter description"
                />
              </div>
              <div>
                <Label htmlFor="edit-imageUrl">Image URL</Label>
                <Input
                  id="edit-imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="Enter image URL"
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <select
                  id="edit-category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="nail_art">Nail Art</option>
                  <option value="manicure">Manicure</option>
                  <option value="pedicure">Pedicure</option>
                  <option value="special_design">Special Design</option>
                </select>
              </div>
              <div>
                <Label htmlFor="edit-tags">Tags (comma separated)</Label>
                <Input
                  id="edit-tags"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="elegant, classic, modern"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                />
                <Label htmlFor="edit-featured">Featured</Label>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleEdit} className="flex-1">
                  Update
                </Button>
                <Button variant="outline" onClick={() => setShowEditDialog(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {galleryItems.length === 0 && (
          <div className="text-center py-12">
            <Image className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-4">No gallery items yet</p>
            <Button onClick={() => setShowAddDialog(true)} data-testid="button-add-first-gallery-item">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Item
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}