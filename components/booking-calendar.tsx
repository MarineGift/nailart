'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, User, Phone } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { CustomerBookingInterface } from './customer-booking-interface'

interface Staff {
  id: string
  firstName: string
  lastName: string
  position: string
  schedule: {
    startTime: string
    endTime: string
  }
}

interface Booking {
  booking: {
    id: string
    bookingNumber: string
    bookingDate: string
    startTime: string
    endTime: string
    status: string
    price: string
  }
  customer: {
    firstName: string
    lastName: string
    phoneNumber: string
  }
  staff: {
    firstName: string
    lastName: string
  }
  service: {
    name: string
    duration: number
  }
}

export function BookingCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [staff, setStaff] = useState<Staff[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [showNewBooking, setShowNewBooking] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchStaffAndBookings()
  }, [selectedDate])

  const fetchStaffAndBookings = async () => {
    setLoading(true)
    try {
      const [staffRes, bookingsRes] = await Promise.all([
        fetch(`/api/staff?date=${selectedDate}`),
        fetch(`/api/new-bookings?date=${selectedDate}`)
      ])

      if (staffRes.ok) {
        const staffData = await staffRes.json()
        setStaff(staffData)
      }

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json()
        setBookings(bookingsData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getEmployeeBookings = (staffId: string) => {
    return bookings.filter(booking => booking.staff.firstName + ' ' + booking.staff.lastName === 
      staff.find(emp => emp.id === staffId)?.firstName + ' ' + staff.find(emp => emp.id === staffId)?.lastName)
  }

  const formatTime = (time: string) => {
    return time.slice(0, 5) // Remove seconds from HH:MM:SS
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (showNewBooking) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">New Customer Booking</h2>
          <Button 
            variant="outline" 
            onClick={() => setShowNewBooking(false)}
          >
            Back to Calendar
          </Button>
        </div>
        <CustomerBookingInterface />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Booking Calendar</h2>
        <Button 
          onClick={() => setShowNewBooking(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          New Booking
        </Button>
      </div>

      {/* Date Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Select Date
          </CardTitle>
        </CardHeader>
        <CardContent>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="p-2 border rounded-md"
          />
        </CardContent>
      </Card>

      {/* Staff Schedule Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Staff Schedule ({staff.length} working)
          </CardTitle>
          <CardDescription>
            {selectedDate} - Click on a time slot to view details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : staff.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No staff scheduled for this date
            </div>
          ) : (
            <div className="space-y-6">
              {staff.map((staff) => {
                const staffBookings = getEmployeeBookings(staff.id)
                
                return (
                  <div key={staff.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {staff.firstName} {staff.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">{staff.position}</p>
                        <p className="text-sm text-purple-600">
                          {formatTime(staff.schedule.startTime)} - {formatTime(staff.schedule.endTime)}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {staffBookings.length} appointments
                      </Badge>
                    </div>

                    {/* Employee's bookings */}
                    <div className="space-y-2">
                      {staffBookings.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">No appointments scheduled</p>
                      ) : (
                        staffBookings.map((booking) => (
                          <div
                            key={booking.booking.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Clock className="h-4 w-4" />
                                {formatTime(booking.booking.startTime)} - {formatTime(booking.booking.endTime)}
                              </div>
                              <div className="flex items-center gap-1 text-sm">
                                <User className="h-4 w-4" />
                                {booking.customer.firstName} {booking.customer.lastName}
                              </div>
                              <div className="flex items-center gap-1 text-sm">
                                <Phone className="h-4 w-4" />
                                {booking.customer.phoneNumber}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium">{booking.service.name}</span>
                              <Badge className={getStatusColor(booking.booking.status)}>
                                {booking.booking.status}
                              </Badge>
                              <span className="text-sm font-semibold">${booking.booking.price}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-600">{staff.length}</div>
              <div className="text-sm text-gray-600">Staff Working</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{bookings.length}</div>
              <div className="text-sm text-gray-600">Total Bookings</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {bookings.filter(b => b.booking.status === 'confirmed').length}
              </div>
              <div className="text-sm text-gray-600">Confirmed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                ${bookings.reduce((sum, b) => sum + parseFloat(b.booking.price), 0).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Revenue</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}