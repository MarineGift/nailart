'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { format } from 'date-fns'
import { Calendar, Users, TrendingUp, Clock, CheckCircle, AlertCircle, Star, Phone, Mail, MapPin, User } from 'lucide-react'
import { AnalyticsDetailDialog } from '@/components/analytics-detail-dialog'

interface Booking {
  id: string
  booking_date: string
  time_slot: string
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled'
  customer_id: string
  service_id: string
  staff_id: string | null
  price: number
  duration: number
  notes: string
  customerName: string
  serviceName: string
  staffName: string
}

interface Customer {
  id: string
  name: string
  phone_number: string
  email?: string
  total_visits: number
  vip_level: 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
  address?: string
  last_visit?: string
  preferred_services?: string[]
}

interface AdminDashboardOverviewProps {
  onNavigateToBookings?: () => void
  onNavigateToCustomers?: () => void
}

export function AdminDashboardOverview({ onNavigateToBookings, onNavigateToCustomers }: AdminDashboardOverviewProps = {}) {
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState(false)
  const [showCustomerDialog, setShowCustomerDialog] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [selectedAnalytics, setSelectedAnalytics] = useState<any>(null)
  
  const [bookings, setBookings] = useState<Booking[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  const today = new Date()
  const todayStr = today.getFullYear() + '-' + 
                   String(today.getMonth() + 1).padStart(2, '0') + '-' +
                   String(today.getDate()).padStart(2, '0')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [bookingsRes, customersRes] = await Promise.all([
        fetch(`/api/bookings?date=${todayStr}`),
        fetch('/api/customers')
      ])

      const bookingsData = bookingsRes.ok ? await bookingsRes.json() : []
      const customersData = customersRes.ok ? await customersRes.json() : []

      setBookings(bookingsData)
      setCustomers(customersData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Real data calculations
  const todayBookings = bookings
  const completedBookings = todayBookings.filter(b => b.status === 'completed')
  const pendingBookings = todayBookings.filter(b => b.status === 'pending')
  const unassignedBookings = todayBookings.filter(b => !b.staff_id)
  
  const todayRevenue = completedBookings.reduce((sum, booking) => sum + (booking.price || 0), 0)
  const todayCompletedCount = completedBookings.length
  const todayBookedCount = todayBookings.length

  const getStatusBadge = (status: string) => {
    const variants = {
      confirmed: 'default',
      pending: 'secondary',
      completed: 'outline',
      cancelled: 'destructive'
    } as const
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getVipBadgeColor = (level: string) => {
    switch (level) {
      case 'Platinum': return 'bg-purple-100 text-purple-800'
      case 'Gold': return 'bg-yellow-100 text-yellow-800'
      case 'Silver': return 'bg-gray-100 text-gray-800'
      default: return 'bg-orange-100 text-orange-800'
    }
  }

  const handleAnalyticsClick = (period: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    const title = `${period.charAt(0).toUpperCase() + period.slice(1)} Analytics`
    
    setSelectedAnalytics({
      title,
      period,
      data: {
        bookings: todayBookings,
        totalBookings: todayBookedCount,
        completedBookings: todayCompletedCount,
        totalRevenue: todayRevenue,
        completedRevenue: todayRevenue
      }
    })
    setShowAnalyticsDialog(true)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 admin-gradient min-h-screen p-6">
      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Analytics */}
        <Card 
          className="admin-card pastel-card-blue cursor-pointer luxury-hover transition-shadow"
          onClick={() => handleAnalyticsClick('daily')}
          data-testid="card-today-bookings"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Today's Bookings & Payment</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{todayBookedCount}/{todayCompletedCount}</div>
            <p className="text-xs text-blue-600">
              Booked / Completed
            </p>
            <p className="text-xs text-blue-700 font-medium">
              ${todayRevenue ? todayRevenue.toLocaleString() : '0'} revenue
            </p>
          </CardContent>
        </Card>

        {/* Pending Bookings */}
        <Card 
          className="admin-card pastel-card-yellow cursor-pointer luxury-hover transition-shadow"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Pending Actions</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{pendingBookings.length}</div>
            <p className="text-xs text-yellow-600">
              Pending bookings
            </p>
            <p className="text-xs text-yellow-700 font-medium">
              {unassignedBookings.length} unassigned
            </p>
          </CardContent>
        </Card>

        {/* Customer Stats */}
        <Card 
          className="admin-card pastel-card-green luxury-hover"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{customers.length}</div>
            <p className="text-xs text-green-600">
              Registered customers
            </p>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card 
          className="admin-card pastel-card luxury-hover"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Today's Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {todayBookedCount > 0 ? Math.round((todayCompletedCount / todayBookedCount) * 100) : 0}%
            </div>
            <p className="text-xs text-purple-600">
              Completion rate
            </p>
          </CardContent>
        </Card>
      </div>


      {/* Analytics Detail Dialog */}
      {selectedAnalytics && (
        <AnalyticsDetailDialog
          isOpen={showAnalyticsDialog}
          onClose={() => setShowAnalyticsDialog(false)}
          analytics={selectedAnalytics}
        />
      )}

      {/* Customer Detail Dialog */}
      <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Details
            </DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="text-center">
                <Avatar className="h-20 w-20 mx-auto mb-3">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-lg">
                    {selectedCustomer.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-lg">{selectedCustomer.name}</h3>
                <Badge className={getVipBadgeColor(selectedCustomer.vip_level)}>
                  {selectedCustomer.vip_level}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  {selectedCustomer.phone_number}
                </div>
                {selectedCustomer.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    {selectedCustomer.email}
                  </div>
                )}
                {selectedCustomer.address && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    {selectedCustomer.address}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{selectedCustomer.total_visits}</div>
                  <div className="text-xs text-gray-600">Total Visits</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {selectedCustomer.last_visit ? format(new Date(selectedCustomer.last_visit), 'MMM dd') : '-'}
                  </div>
                  <div className="text-xs text-gray-600">Last Visit</div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}