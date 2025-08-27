'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Plus, Edit, Trash2, Clock, DollarSign, Search } from 'lucide-react'

interface Service {
  id: string | number
  code?: string
  name: string
  duration: number
  duration_min?: number
  price: number
  base_price_cents?: number
  description: string
  category: string
  created_at: string
  updated_at: string
  is_active?: boolean
  service_details?: Array<{
    id: number
    variant: string
    description: string
    duration_min: number
    price: number
    currency: string
    sort_order: number
    notes?: string
  }>
  variants?: Array<{
    id: number
    variant: string
    description: string
    duration_min: number
    price: number
    currency: string
    sort_order: number
    notes?: string
  }>
}

export function ServicesManagement() {
  const [services, setServices] = useState<Service[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [formData, setFormData] = useState({
    name: '',
    duration: '',
    price: '',
    description: '',
    category: 'Spa Specials'
  })
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/services?include_details=true')
      if (response.ok) {
        const data = await response.json()
        console.log('Loaded services:', data)
        setServices(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to load services",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error fetching services:', error)
      toast({
        title: "Error",
        description: "Failed to load services",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      duration: '',
      price: '',
      description: '',
      category: 'manicure'
    })
  }

  const handleAdd = async () => {
    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          duration: parseInt(formData.duration),
          price: parseFloat(formData.price)
        })
      })

      if (response.ok) {
        await fetchServices()
        setShowAddDialog(false)
        resetForm()
        toast({
          title: "Success",
          description: "Service added successfully",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to add service",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add service",
        variant: "destructive",
      })
    }
  }

  const handleEdit = async () => {
    if (!selectedService) return

    try {
      const response = await fetch(`/api/services/${selectedService.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          duration: parseInt(formData.duration),
          price: parseFloat(formData.price)
        })
      })

      if (response.ok) {
        await fetchServices()
        setShowEditDialog(false)
        setSelectedService(null)
        resetForm()
        toast({
          title: "Success",
          description: "Service updated successfully",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to update service",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update service",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/services/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchServices()
        toast({
          title: "Success",
          description: "Service deleted successfully",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to delete service",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete service",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (service: Service) => {
    setSelectedService(service)
    setFormData({
      name: service.name,
      duration: service.duration.toString(),
      price: service.price.toString(),
      description: service.description,
      category: service.category
    })
    setShowEditDialog(true)
  }

  const getCategoryBadge = (category: string) => {
    const styles = {
      "Spa Specials": "bg-purple-100 text-purple-800",
      "Nail Treatments": "bg-pink-100 text-pink-800",
      manicure: "bg-pink-100 text-pink-800",
      nail_art: "bg-purple-100 text-purple-800",
      pedicure: "bg-blue-100 text-blue-800",
      extension: "bg-green-100 text-green-800",
      repair: "bg-yellow-100 text-yellow-800",
      basic: "bg-gray-100 text-gray-800",
      care: "bg-orange-100 text-orange-800"
    }
    return styles[category as keyof typeof styles] || "bg-gray-100 text-gray-800"
  }

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Pagination logic
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedServices = filteredServices.slice(startIndex, endIndex)

  // Reset page when search term changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Services Management</CardTitle>
              <CardDescription>Manage salon services, pricing, and categories</CardDescription>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-service">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Service</DialogTitle>
                  <DialogDescription>
                    Create a new service for your salon
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Service Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter service name"
                      data-testid="input-service-name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={formData.duration}
                        onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                        placeholder="30"
                        data-testid="input-service-duration"
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Price ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="35000"
                        data-testid="input-service-price"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full p-2 border rounded-md"
                      data-testid="select-service-category"
                    >
                      <option value="Spa Specials">Spa Specials</option>
                      <option value="Nail Treatments">Nail Treatments</option>
                      <option value="manicure">Manicure</option>
                      <option value="nail_art">Nail Art</option>
                      <option value="pedicure">Pedicure</option>
                      <option value="extension">Extension</option>
                      <option value="repair">Repair</option>
                      <option value="basic">Basic</option>
                      <option value="care">Care</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter service description"
                      data-testid="textarea-service-description"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAdd} className="flex-1" data-testid="button-save-service">
                      Save Service
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
          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-service-search"
              />
            </div>
          </div>

          {/* Services Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>
                      <Badge className={getCategoryBadge(service.category)}>
                        {service.category.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-500" />
                        {service.duration_min || service.duration} min
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        ${service.base_price_cents ? (service.base_price_cents / 100).toFixed(2) : (service.price ? service.price.toFixed(2) : '0.00')}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div>{service.description}</div>
                      {service.service_details && service.service_details.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <div className="text-xs text-gray-500 font-medium">Variants:</div>
                          {service.service_details.map((variant, idx) => (
                            <div key={variant.id} className="text-xs bg-gray-50 rounded px-2 py-1">
                              <span className="font-medium">{variant.variant}</span> - ${variant.price} ({variant.duration_min}min)
                            </div>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(service)}
                          data-testid={`button-edit-service-${service.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(service.id as number)}
                          className="text-red-600 hover:text-red-700"
                          data-testid={`button-delete-service-${service.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredServices.length)} of {filteredServices.length} services
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      className="w-8 h-8"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {filteredServices.length === 0 && (
            <div className="text-center py-12">
              <DollarSign className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'No services match your search' : 'No services found'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowAddDialog(true)} data-testid="button-add-first-service">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Service
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>
              Update the service details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Service Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter service name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-duration">Duration (minutes)</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="30"
                />
              </div>
              <div>
                <Label htmlFor="edit-price">Price ($)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="35000"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-category">Category</Label>
              <select
                id="edit-category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="Spa Specials">Spa Specials</option>
                <option value="Nail Treatments">Nail Treatments</option>
                <option value="manicure">Manicure</option>
                <option value="nail_art">Nail Art</option>
                <option value="pedicure">Pedicure</option>
                <option value="extension">Extension</option>
                <option value="repair">Repair</option>
                <option value="basic">Basic</option>
                <option value="care">Care</option>
              </select>
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter service description"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleEdit} className="flex-1">
                Update Service
              </Button>
              <Button variant="outline" onClick={() => setShowEditDialog(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}