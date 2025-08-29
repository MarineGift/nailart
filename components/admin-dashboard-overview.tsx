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
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'scheduled'
  customer_id: string
  service_id: string
  staff_id: string | null
  price: number
  duration: number
  notes: string
  source?: string
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
  const [staff, setStaff] = useState<any[]>([])
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
      const [bookingsRes, customersRes, staffRes] = await Promise.all([
        fetch(`/api/bookings?date=${todayStr}`),
        fetch('/api/customers'),
        fetch(`/api/staff?date=${todayStr}`)
      ])

      const bookingsData = bookingsRes.ok ? await bookingsRes.json() : []
      const customersData = customersRes.ok ? await customersRes.json() : []
      const staffData = staffRes.ok ? await staffRes.json() : []

      console.log('=== DASHBOARD STATS DEBUG ===')
      console.log('Today string for API:', todayStr)
      
      setBookings(bookingsData)
      setCustomers(customersData)
      setStaff(staffData)
      
      console.log('Dashboard fetched data:')
      console.log('- Bookings:', bookingsData)
      console.log('- Bookings count:', bookingsData.length)
      console.log('- Customers count:', customersData.length)
      console.log('- Working staff count:', staffData.length)
      
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
  const scheduledBookings = todayBookings.filter(b => b.status === 'scheduled')
  const unassignedBookings = todayBookings.filter(b => !b.staff_id)
  
  // Calculate data by source
  const homepageBookings = todayBookings.filter(b => b.source === 'Homepage')
  const callBookings = todayBookings.filter(b => b.source === 'Call')
  const visitBookings = todayBookings.filter(b => b.source === 'Visit')
  const rebookingBookings = todayBookings.filter(b => b.source === 'Rebooking')
  
  const todayRevenue = completedBookings.reduce((sum, booking) => sum + (booking.price || 0), 0)
  const todayCompletedCount = completedBookings.length
  const todayBookedCount = todayBookings.length
  
  console.log('Calculated stats:')
  console.log('- Total bookings:', todayBookedCount)
  console.log('- Completed today:', todayCompletedCount)
  console.log('- Scheduled today:', scheduledBookings.length)
  console.log('=== END DASHBOARD STATS DEBUG ===')

  // Function to check if staff works today (only works 2 days per week)
  const isStaffWorkingToday = (staffMember: any, date: string) => {
    // Generate consistent work pattern for each staff using simple hash function
    const staffHash = staffMember.id.split('').reduce((a: number, b: string) => a + b.charCodeAt(0), 0);
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay(); // 0=Sunday, 1=Monday, ... 6=Saturday
    
    // Generate unique 2-day work pattern for each staff (Monday-Friday)
    const workDays = [(staffHash % 5) + 1, ((staffHash + 2) % 5) + 1]; // 1~5 (Mon~Fri)
    
    return workDays.includes(dayOfWeek);
  }

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
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Bookings Simple */}
        <Card className="admin-card pastel-card-blue">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Today's Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{todayBookedCount}</div>
            <p className="text-xs text-blue-600">
              {todayCompletedCount} completed, {scheduledBookings.length} scheduled
            </p>
          </CardContent>
        </Card>

        {/* Total Customers Simple */}
        <Card className="admin-card pastel-card-cyan">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-cyan-700">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-cyan-900">{customers.length}</div>
            <p className="text-xs text-cyan-600">
              +12 new this month
            </p>
          </CardContent>
        </Card>

        {/* Monthly Revenue Simple */}
        <Card className="admin-card pastel-card-green">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">${todayRevenue}</div>
            <p className="text-xs text-green-600">
              +18% from last month
            </p>
          </CardContent>
        </Card>

        {/* Active Staff Simple */}
        <Card className="admin-card pastel-card-amber">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-700">Active Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-900">{staff.filter(s => isStaffWorkingToday(s, todayStr)).length}</div>
            <p className="text-xs text-amber-600">
              All available
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Dashboard */}
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
      
      {/* Today's Bookings & Working Staff Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Today's Bookings List */}
        <Card className="admin-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-purple-600" />
              Today's Bookings ({todayBookedCount})
            </CardTitle>
            <p className="text-sm text-gray-500">{format(new Date(), 'MMM dd, yyyy')}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {todayBookings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No bookings scheduled for today</p>
                </div>
              ) : (
                todayBookings.map((booking: any, index) => (
                  <div key={booking.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-l-4 border-purple-400">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {booking.time_slot || booking.booking_time?.split('T')[1]?.substring(0, 5) || 'Unknown'} - {booking.customer_name || booking.customers?.last_name || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-600">Unknown Service</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        booking.status === 'completed' ? 'bg-green-100 text-green-600' :
                        booking.status === 'confirmed' ? 'bg-blue-100 text-blue-600' :
                        'bg-orange-100 text-orange-600'
                      }`}>
                        {booking.status === 'completed' ? 'Completed' :
                         booking.status === 'confirmed' ? 'Confirmed' : 
                         booking.status === 'scheduled' ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Today's Working Staff List */}
        <Card className="admin-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
              <Users className="h-5 w-5 mr-2 text-amber-600" />
              Today's Working Staff ({staff.filter(s => isStaffWorkingToday(s, todayStr)).length})
            </CardTitle>
            <p className="text-sm text-gray-500">Active Staff</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {staff.filter(s => isStaffWorkingToday(s, todayStr)).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No staff working today</p>
                </div>
              ) : (
                staff.filter(s => isStaffWorkingToday(s, todayStr)).map((staffMember: any, index) => (
                  <div key={staffMember.id || index} className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center">
                          <span className="text-sm font-medium text-amber-700">
                            {staffMember.first_name?.[0] || staffMember.name?.[0] || 'S'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {staffMember.first_name && staffMember.last_name 
                              ? `${staffMember.first_name} ${staffMember.last_name}`
                              : staffMember.name || 'Unknown Staff'}
                          </p>
                          <p className="text-sm text-gray-600">{staffMember.position || 'Staff'}</p>
                        </div>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-600">
                        active
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      <p><strong>Skills & Specialties:</strong></p>
                      <p>Nail Care • Manicure</p>
                      <p><strong>Hours:</strong> 10:00 - 19:00</p>
                    </div>
                  </div>
                ))
              )}
            </div>
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