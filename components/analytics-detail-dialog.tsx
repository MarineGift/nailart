'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format } from 'date-fns'
import { Calendar, DollarSign, Users, TrendingUp, CheckCircle, Clock, XCircle } from 'lucide-react'

interface Booking {
  id: number
  booking_date: string
  time_slot: string
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled'
  customer_id: number
  service_id: number
  assigned_staff_id: string | null
  price: number
  duration: number
  notes: string
  customer_name: string
  service_name: string
  staff_name: string
}

interface AnalyticsDetailDialogProps {
  isOpen: boolean
  onClose: () => void
  analytics?: {
    title: string
    period: 'daily' | 'weekly' | 'monthly' | 'yearly'
    data: {
      bookings: Booking[]
      totalBookings: number
      completedBookings: number
      totalRevenue: number
      completedRevenue: number
    }
  }
}

export function AnalyticsDetailDialog({ isOpen, onClose, analytics }: AnalyticsDetailDialogProps) {
  if (!analytics) return null
  
  const { title, period, data } = analytics
  const [activeTab, setActiveTab] = useState('overview')

  const getStatusBadge = (status: string) => {
    const variants = {
      confirmed: { variant: 'default' as const, color: 'blue' },
      pending: { variant: 'secondary' as const, color: 'yellow' },
      completed: { variant: 'outline' as const, color: 'green' },
      cancelled: { variant: 'destructive' as const, color: 'red' }
    }
    
    const config = variants[status as keyof typeof variants] || variants.confirmed
    
    return (
      <Badge variant={config.variant}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Calendar className="h-4 w-4 text-blue-500" />
    }
  }

  const completionRate = data.totalBookings > 0 ? (data.completedBookings / data.totalBookings * 100).toFixed(1) : '0'
  const averageBookingValue = data.completedBookings > 0 ? (data.completedRevenue / data.completedBookings).toFixed(0) : '0'

  const statusSummary = {
    completed: data.bookings.filter(b => b.status === 'completed').length,
    confirmed: data.bookings.filter(b => b.status === 'confirmed').length,
    pending: data.bookings.filter(b => b.status === 'pending').length,
    cancelled: data.bookings.filter(b => b.status === 'cancelled').length,
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {title} - Detailed Analytics
          </DialogTitle>
          <DialogDescription>
            Comprehensive breakdown of bookings and revenue for the selected period
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">Booking Details</TabsTrigger>
            <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-blue-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700">Total Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900">{data.totalBookings}</div>
                </CardContent>
              </Card>

              <Card className="bg-green-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-700">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-900">{data.completedBookings}</div>
                  <p className="text-xs text-green-600">{completionRate}% completion rate</p>
                </CardContent>
              </Card>

              <Card className="bg-purple-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-purple-700">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900">₩{data.completedRevenue.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card className="bg-orange-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-orange-700">Avg. Booking Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-900">₩{averageBookingValue}</div>
                </CardContent>
              </Card>
            </div>

            {/* Status Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Booking Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Completed: {statusSummary.completed}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Confirmed: {statusSummary.confirmed}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Pending: {statusSummary.pending}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Cancelled: {statusSummary.cancelled}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Bookings ({data.bookings.length})</CardTitle>
                <CardDescription>
                  Complete list of bookings for the selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {data.bookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(booking.status)}
                        <div>
                          <div className="font-medium text-sm">{booking.customer_name}</div>
                          <div className="text-xs text-gray-600">
                            {format(new Date(booking.booking_date), 'MMM dd')} at {booking.time_slot}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">₩{booking.price.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{booking.service_name}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(booking.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Revenue Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Potential Revenue (All Bookings):</span>
                    <span className="font-medium">₩{data.totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Actual Revenue (Completed):</span>
                    <span className="font-medium">₩{data.completedRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Revenue Loss (Cancelled/Pending):</span>
                    <span className="font-medium text-red-600">₩{(data.totalRevenue - data.completedRevenue).toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between">
                      <span>Revenue Efficiency:</span>
                      <span className="font-medium">{((data.completedRevenue / data.totalRevenue) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Service Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Array.from(new Set(data.bookings.map(b => b.service_name))).map(serviceName => {
                      const serviceBookings = data.bookings.filter(b => b.service_name === serviceName)
                      const serviceRevenue = serviceBookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.price, 0)
                      return (
                        <div key={serviceName} className="flex justify-between items-center">
                          <span className="text-sm">{serviceName}</span>
                          <div className="text-right">
                            <div className="text-sm font-medium">₩{serviceRevenue.toLocaleString()}</div>
                            <div className="text-xs text-gray-500">{serviceBookings.length} bookings</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}