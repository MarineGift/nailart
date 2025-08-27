'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Users, Search, TrendingUp, Calendar, DollarSign, Star, Clock, Phone, Mail } from 'lucide-react'
import { format } from 'date-fns'
import { enUS } from 'date-fns/locale'

interface Customer {
  id: number
  firstName: string
  lastName: string
  email?: string
  phone_number: string
  created_at: string
  totalSpent: number
  totalVisits: number
  averageSpending: number
  lastVisit: string
  preferredServices: string[]
  bookings: Booking[]
}

interface Booking {
  id: number
  booking_date: string
  time_slot: string
  status: string
  price: number
  notes?: string
  source?: string
  service: {
    id: number
    name: string
    duration: number
    price: number
  }
  assigned_staff?: {
    firstName: string
    lastName: string
  }
}

interface Service {
  id: number
  name: string
  duration: number
  price: number
  description: string
}

export function CustomerSpendingManagement() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch customers, bookings, and services
      const [customersRes, servicesRes] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/services')
      ])

      const customersData = await customersRes.json()
      const servicesData = await servicesRes.json()
      
      setServices(servicesData)

      // Fetch all bookings once
      const bookingsRes = await fetch('/api/bookings')
      const allBookings = await bookingsRes.json()

      // Calculate spending data for each customer
      const customersWithSpending = customersData.map((customer: any) => {
        try {
          // Filter bookings for this customer
          const customerBookings = Array.isArray(allBookings) ? allBookings.filter((booking: any) => booking.customer_id === customer.id) : []

          const totalSpent = customerBookings.reduce((sum: number, booking: any) => sum + (booking.price || 0), 0)
          const completedBookings = customerBookings.filter((b: any) => b.status === 'completed' || b.status === 'confirmed')
          const totalVisits = completedBookings.length
          const averageSpending = totalVisits > 0 ? totalSpent / totalVisits : 0
          
          // Find last visit
          const sortedBookings = customerBookings.sort((a: any, b: any) => new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime())
          const lastVisit = sortedBookings.length > 0 ? sortedBookings[0].booking_date : customer.created_at

          // Get preferred services (most booked services)
          const serviceCount: { [key: string]: number } = {}
          customerBookings.forEach((booking: any) => {
            const service = servicesData.find((s: Service) => s.id === booking.service_id)
            if (service?.name) {
              serviceCount[service.name] = (serviceCount[service.name] || 0) + 1
            }
          })
          const preferredServices = Object.entries(serviceCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([service]) => service)

          return {
            ...customer,
            totalSpent,
            totalVisits,
            averageSpending,
            lastVisit,
            preferredServices,
            bookings: customerBookings.map((booking: any) => ({
              ...booking,
              service: servicesData.find((s: Service) => s.id === booking.service_id) || { name: 'Unknown Service', duration: 0, price: 0 },
              assigned_staff: booking.assigned_staff_first && booking.assigned_staff_last ? {
                firstName: booking.assigned_staff_first,
                lastName: booking.assigned_staff_last
              } : null
            }))
          }
        } catch (error) {
          console.error(`Error processing data for customer ${customer.id}:`, error)
          return {
            ...customer,
            totalSpent: 0,
            totalVisits: 0,
            averageSpending: 0,
            lastVisit: customer.created_at,
            preferredServices: [],
            bookings: []
          }
        }
      })

      // Sort by total spending (highest first)
      customersWithSpending.sort((a: any, b: any) => b.totalSpent - a.totalSpent)
      setCustomers(customersWithSpending)
    } catch (error) {
      console.error('Error fetching customer data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(customer => 
    `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone_number.includes(searchTerm) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600 mt-1">View customer spending and booking history</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-lg px-3 py-1">
            <Users className="h-4 w-4 mr-2" />
            {customers.length} Total Customers
          </Badge>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search customers by name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-customer-search"
          />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-xl font-bold">${customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Active Customers</p>
                <p className="text-xl font-bold">{customers.filter(c => c.totalVisits > 0).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Average Spending</p>
                <p className="text-xl font-bold">
                  ${customers.length > 0 ? Math.round(customers.reduce((sum, c) => sum + c.averageSpending, 0) / customers.length) : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Total Visits</p>
                <p className="text-xl font-bold">{customers.reduce((sum, c) => sum + c.totalVisits, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Customers by Total Spending
          </CardTitle>
          <CardDescription>
            {filteredCustomers.length} customers found, sorted by total spending
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCustomers.map((customer, index) => (
              <div key={customer.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                          {customer.firstName?.[0] || 'C'}{customer.lastName?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{customer.firstName} {customer.lastName}</h3>
                        {index < 3 && (
                          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                            <Star className="h-3 w-3 mr-1" />
                            Top Customer
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {customer.phone_number}
                        </div>
                        {customer.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {customer.email}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Last visit: {format(new Date(customer.lastVisit), 'MMM dd, yyyy', { locale: enUS })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        ${customer.totalSpent.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        {customer.totalVisits} visits • ${Math.round(customer.averageSpending)}/avg
                      </div>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          onClick={() => setSelectedCustomer(customer)}
                          data-testid={`button-view-customer-${customer.id}`}
                        >
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm">
                                {customer.firstName?.[0] || 'C'}{customer.lastName?.[0] || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            {customer.firstName} {customer.lastName} - Customer Details
                          </DialogTitle>
                          <DialogDescription>
                            Complete booking and service history
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6">
                          {/* Customer Summary */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-green-50 p-3 rounded-lg">
                              <div className="text-2xl font-bold text-green-600">${customer.totalSpent}</div>
                              <div className="text-sm text-green-700">Total Spent</div>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <div className="text-2xl font-bold text-blue-600">{customer.totalVisits}</div>
                              <div className="text-sm text-blue-700">Total Visits</div>
                            </div>
                            <div className="bg-purple-50 p-3 rounded-lg">
                              <div className="text-2xl font-bold text-purple-600">${Math.round(customer.averageSpending)}</div>
                              <div className="text-sm text-purple-700">Avg per Visit</div>
                            </div>
                            <div className="bg-orange-50 p-3 rounded-lg">
                              <div className="text-2xl font-bold text-orange-600">{customer.preferredServices.length}</div>
                              <div className="text-sm text-orange-700">Favorite Services</div>
                            </div>
                          </div>

                          {/* Preferred Services */}
                          {customer.preferredServices.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-2">Preferred Services</h4>
                              <div className="flex flex-wrap gap-2">
                                {customer.preferredServices.map((service, idx) => (
                                  <Badge key={idx} variant="secondary">
                                    {service}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Booking History */}
                          <div>
                            <h4 className="font-semibold mb-3">Booking History ({customer.bookings.length} total)</h4>
                            <div className="space-y-3 max-h-60 overflow-y-auto">
                              {customer.bookings
                                .sort((a, b) => new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime())
                                .map((booking) => (
                                <div key={booking.id} className="border border-gray-200 rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <Badge className={getStatusColor(booking.status)}>
                                        {booking.status}
                                      </Badge>
                                      <span className="font-medium">{booking.service?.name || 'Unknown Service'}</span>
                                    </div>
                                    <div className="text-lg font-bold text-green-600">
                                      ${booking.price}
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-4 w-4" />
                                      {format(new Date(booking.booking_date), 'MMM dd, yyyy', { locale: enUS })}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-4 w-4" />
                                      {booking.time_slot}
                                    </div>
                                    {booking.assigned_staff && (
                                      <div>
                                        Staff: {booking.assigned_staff.firstName} {booking.assigned_staff.lastName}
                                      </div>
                                    )}
                                  </div>
                                  
                                  {booking.source && (
                                    <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                      <strong>Source:</strong> {booking.source}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Preferred Services Preview */}
                {customer.preferredServices.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Preferred services:</span>
                      <div className="flex flex-wrap gap-1">
                        {customer.preferredServices.slice(0, 3).map((service, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}