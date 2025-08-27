'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { User, Phone, Mail, Search, Edit, Trash2, Plus, UserPlus } from 'lucide-react'

interface Customer {
  phone_number: string
  name: string
  email: string
  birth_date?: string
  gender?: string
  is_vip: boolean
  loyalty_points: number
  total_spent_cents: number
  total_visits: number
  notes?: string
  created_at?: string
}

export default function SignUpPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [searchPhone, setSearchPhone] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [formData, setFormData] = useState<Partial<Customer>>({
    phone_number: '',
    name: '',
    email: '',
    birth_date: '',
    gender: '',
    notes: ''
  })
  const { toast } = useToast()

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      const response = await fetch('/api/customers')
      if (response.ok) {
        const data = await response.json()
        setCustomers(data)
      }
    } catch (error) {
      console.error('Failed to load customers:', error)
    }
  }

  const searchCustomerByPhone = async () => {
    if (!searchPhone.trim()) {
      toast({
        title: 'Phone Number Required',
        description: 'Please enter a phone number to search',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/customers?phone=${encodeURIComponent(searchPhone)}`)
      if (response.ok) {
        const data = await response.json()
        if (data.length > 0) {
          setSelectedCustomer(data[0])
          toast({
            title: 'Customer Found',
            description: `Found customer: ${data[0].name}`,
          })
        } else {
          setSelectedCustomer(null)
          toast({
            title: 'Customer Not Found',
            description: 'No customer found with this phone number',
            variant: 'destructive'
          })
        }
      }
    } catch (error) {
      console.error('Search error:', error)
      toast({
        title: 'Search Error',
        description: 'Failed to search customer',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCustomer = async () => {
    if (!formData.phone_number || !formData.name) {
      toast({
        title: 'Required Fields Missing',
        description: 'Phone number and name are required',
        variant: 'destructive'
      })
      return
    }

    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          is_vip: false,
          loyalty_points: 0,
          total_spent_cents: 0,
          total_visits: 0
        })
      })

      if (response.ok) {
        const newCustomer = await response.json()
        setCustomers([...customers, newCustomer])
        setFormData({
          phone_number: '',
          name: '',
          email: '',
          birth_date: '',
          gender: '',
          notes: ''
        })
        setShowCreateDialog(false)
        toast({
          title: 'Customer Created',
          description: `${newCustomer.name} has been registered successfully`,
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create customer')
      }
    } catch (error: any) {
      console.error('Create error:', error)
      toast({
        title: 'Registration Failed',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const handleUpdateCustomer = async () => {
    if (!selectedCustomer || !formData.phone_number || !formData.name) {
      toast({
        title: 'Required Fields Missing',
        description: 'Phone number and name are required',
        variant: 'destructive'
      })
      return
    }

    try {
      const response = await fetch(`/api/customers/${selectedCustomer.phone_number}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const updatedCustomer = await response.json()
        setCustomers(customers.map(c => 
          c.phone_number === selectedCustomer.phone_number ? updatedCustomer : c
        ))
        setSelectedCustomer(updatedCustomer)
        setShowEditDialog(false)
        toast({
          title: 'Customer Updated',
          description: `${updatedCustomer.name}'s information has been updated`,
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update customer')
      }
    } catch (error: any) {
      console.error('Update error:', error)
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const handleDeleteCustomer = async () => {
    if (!selectedCustomer) return

    try {
      const response = await fetch(`/api/customers/${selectedCustomer.phone_number}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setCustomers(customers.filter(c => c.phone_number !== selectedCustomer.phone_number))
        setSelectedCustomer(null)
        toast({
          title: 'Customer Deleted',
          description: `${selectedCustomer.name} has been removed from the system`,
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete customer')
      }
    } catch (error: any) {
      console.error('Delete error:', error)
      toast({
        title: 'Delete Failed',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const openEditDialog = (customer: Customer) => {
    setFormData(customer)
    setSelectedCustomer(customer)
    setShowEditDialog(true)
  }

  const openCreateDialog = () => {
    setFormData({
      phone_number: '',
      name: '',
      email: '',
      birth_date: '',
      gender: '',
      notes: ''
    })
    setShowCreateDialog(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100">
      <div className="max-w-6xl mx-auto -mt-0">
        {/* Hero Carousel Header - Customer Registration & Management */}
        <div className="relative overflow-hidden shadow-2xl">
          <div className="h-96 bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-200 relative">
            <div className="absolute inset-0">
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-40"
                style={{
                  backgroundImage: 'url(https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=1200&h=400&fit=crop)'
                }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-300/30 via-purple-300/30 to-indigo-300/30"></div>
            </div>
            <div className="relative z-10 flex items-center justify-center h-full text-center px-8">
              <div>
                <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
                  Customer Registration & Management
                </h1>
                <p className="text-xl text-white/90 drop-shadow-md max-w-2xl mx-auto">
                  Manage your customer relationships with ease
                </p>
                <div className="mt-6 flex justify-center space-x-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                    <span className="text-white font-medium">👥 Customer Search</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                    <span className="text-white font-medium">✨ Quick Registration</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                    <span className="text-white font-medium">📊 Loyalty Management</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <Card className="mt-8 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Customer Search
            </CardTitle>
            <CardDescription>
              Search for existing customer by phone number
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter phone number (e.g., 571-513-8278)"
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  data-testid="input-phone-search"
                />
              </div>
              <Button 
                onClick={searchCustomerByPhone}
                disabled={loading}
                data-testid="button-search-customer"
              >
                <Search className="h-4 w-4 mr-2" />
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Customer Details */}
        {selectedCustomer && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => openEditDialog(selectedCustomer)}
                    data-testid="button-edit-customer"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={handleDeleteCustomer}
                    data-testid="button-delete-customer"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Name</Label>
                    <p className="text-lg font-semibold">{selectedCustomer.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Phone Number</Label>
                    <p className="text-lg">{selectedCustomer.phone_number}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Email</Label>
                    <p className="text-lg">{selectedCustomer.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Status</Label>
                    <div className="mt-1">
                      {selectedCustomer.is_vip ? (
                        <Badge className="bg-gold-100 text-gold-800">VIP Customer</Badge>
                      ) : (
                        <Badge variant="secondary">Regular Customer</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Total Visits</Label>
                    <p className="text-lg font-semibold">{selectedCustomer.total_visits}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Total Spent</Label>
                    <p className="text-lg font-semibold">
                      ${(selectedCustomer.total_spent_cents / 100).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Loyalty Points</Label>
                    <p className="text-lg font-semibold">{selectedCustomer.loyalty_points}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Notes</Label>
                    <p className="text-sm text-gray-700">{selectedCustomer.notes || 'No notes'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* New Customer Registration - Expanded */}
        <Card className="shadow-xl border-0 bg-gradient-to-br from-pink-50 to-purple-50">
          <CardHeader className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <UserPlus className="h-5 w-5 text-pink-600" />
              New Customer Registration
            </CardTitle>
            <CardDescription className="text-purple-600">
              Register a new customer in the system - Fill out the form below
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-phone" className="text-purple-700 font-medium">Phone Number *</Label>
                  <Input
                    id="new-phone"
                    value={formData.phone_number || ''}
                    onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                    placeholder="e.g., 571-513-8278"
                    className="border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-400 bg-white/70 backdrop-blur-sm"
                    data-testid="input-new-phone"
                  />
                </div>
                <div>
                  <Label htmlFor="new-name" className="text-purple-700 font-medium">Name *</Label>
                  <Input
                    id="new-name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Customer name"
                    className="border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-400 bg-white/70 backdrop-blur-sm"
                    data-testid="input-new-name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-email" className="text-purple-700 font-medium">Email</Label>
                  <Input
                    id="new-email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="customer@email.com"
                    className="border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-400 bg-white/70 backdrop-blur-sm"
                    data-testid="input-new-email"
                  />
                </div>
                <div>
                  <Label htmlFor="new-birth-date" className="text-purple-700 font-medium">Birth Date</Label>
                  <Input
                    id="new-birth-date"
                    type="date"
                    value={formData.birth_date || ''}
                    onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                    className="border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-400 bg-white/70 backdrop-blur-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-gender" className="text-purple-700 font-medium">Gender</Label>
                  <select
                    id="new-gender"
                    value={formData.gender || ''}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-400 outline-none bg-white/70 backdrop-blur-sm"
                  >
                    <option value="">Select Gender</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="new-notes" className="text-purple-700 font-medium">Notes</Label>
                  <Input
                    id="new-notes"
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Additional notes"
                    className="border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-400 bg-white/70 backdrop-blur-sm"
                    data-testid="input-new-notes"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  onClick={handleCreateCustomer}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  disabled={!formData.phone_number || !formData.name}
                  data-testid="button-confirm-create"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Register Customer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Edit Customer Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Customer Information</DialogTitle>
              <DialogDescription>
                Update customer details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-phone">Phone Number *</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone_number || ''}
                  onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                  data-testid="input-edit-phone"
                />
              </div>
              <div>
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  data-testid="input-edit-name"
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  data-testid="input-edit-email"
                />
              </div>
              <div>
                <Label htmlFor="edit-notes">Notes</Label>
                <Input
                  id="edit-notes"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  data-testid="input-edit-notes"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleUpdateCustomer}
                  className="flex-1"
                  data-testid="button-confirm-update"
                >
                  Update Customer
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowEditDialog(false)}
                  data-testid="button-cancel-update"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}