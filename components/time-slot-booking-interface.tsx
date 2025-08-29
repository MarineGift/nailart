'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, User, Phone, Mail } from 'lucide-react'
import { format } from 'date-fns'
import BookingDetailsModal from './booking-details-modal'

interface Staff {
  id: string
  firstName: string
  lastName: string
  role: string
  status: string
  workingStartTime?: string
  workingEndTime?: string
}

interface Customer {
  id: number
  name: string
  phoneNumber: string
  email?: string
  vipLevel: string
}

interface Service {
  id: number
  name: string
  price: number
  duration: number
}

interface Booking {
  id: number
  customerId: number
  serviceId: number
  staffId: string | null
  bookingDate: string
  timeSlot: string
  status: string
  price: number
  duration: number
  notes: string
  customerName?: string
  serviceName?: string
  staffName?: string
}

interface TimeSlotBookingInterfaceProps {
  selectedDate: Date
}

const TIME_SLOTS = [
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', 
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', 
  '16:00', '16:30', '17:00', '17:30'
]

export function TimeSlotBookingInterface({ selectedDate }: TimeSlotBookingInterfaceProps) {
  const [staff, setStaff] = useState<Staff[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showBookingDialog, setShowBookingDialog] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [selectedDate])

  const fetchData = async () => {
    try {
      setLoading(true)
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      
      const [staffRes, bookingsRes, customersRes, servicesRes] = await Promise.all([
        fetch(`/api/staff?date=${dateStr}`),
        fetch(`/api/bookings?date=${dateStr}`),
        fetch('/api/customers'),
        fetch('/api/services')
      ])

      if (staffRes.ok) {
        const staffData = await staffRes.json()
        setStaff(staffData)
      }

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json()
        setBookings(bookingsData)
      }

      if (customersRes.ok) {
        const customersData = await customersRes.json()
        setCustomers(customersData)
      }

      if (servicesRes.ok) {
        const servicesData = await servicesRes.json()
        setServices(servicesData)
      }

    } catch (error) {
      // Hide console errors as requested
      // console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const isStaffAvailable = (staff: Employee, timeSlot: string): boolean => {
    if (!staff.workingStartTime || !staff.workingEndTime) {
      return true // Default to available if no working hours set
    }
    
    const slotTime = timeSlot + ':00' // Convert '10:00' to '10:00:00'
    return slotTime >= staff.workingStartTime && slotTime <= staff.workingEndTime
  }

  const getBookingForSlot = (staffId: string, timeSlot: string): Booking | null => {
    return bookings.find(booking => 
      booking.staffId === staffId && 
      booking.timeSlot === timeSlot
    ) || null
  }

  const getCustomerInfo = (customerId: number): Customer | null => {
    return customers.find(customer => customer.id === customerId) || null
  }

  const getServiceInfo = (serviceId: number): Service | null => {
    return services.find(service => service.id === serviceId) || null
  }

  const handleSlotClick = (booking: Booking | null, staffId: string, timeSlot: string) => {
    if (booking) {
      const customer = getCustomerInfo(booking.customerId)
      const service = getServiceInfo(booking.serviceId)
      const staff = staff.find(emp => emp.id === staffId)
      
      const enrichedBooking = {
        ...booking,
        customerName: customer?.name || 'Unknown Customer',
        serviceName: service?.name || 'Unknown Service',
        staffName: staff ? `${staff.firstName} ${staff.lastName}` : 'Unknown Employee'
      }
      
      setSelectedBooking(enrichedBooking)
      setIsBookingModalOpen(true)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getVipBadgeColor = (level: string) => {
    switch (level) {
      case 'Platinum': return 'bg-purple-100 text-purple-800'
      case 'Gold': return 'bg-yellow-100 text-yellow-800'
      case 'Silver': return 'bg-gray-100 text-gray-800'
      default: return 'bg-orange-100 text-orange-800'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading booking schedule...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          staff별 booking 현황 - {format(selectedDate, 'yyyy년 MM월 dd일 (EEE)')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-3 text-left border-b">time</th>
                {staff.map(staff => (
                  <th key={staff.id} className="p-3 text-center border-b min-w-[100px]">
                    <div className="text-sm font-medium">
                      {staff.firstName} {staff.lastName}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {staff.role === 'admin' ? 'management자' : 
                       staff.role === 'manager' ? '매니저' : 'staff'}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map(timeSlot => (
                <tr key={timeSlot}>
                  <td className="p-3 font-medium border-b bg-gray-50">{timeSlot}</td>
                  {staff.map(staff => {
                    const booking = getBookingForSlot(staff.id, timeSlot)
                    const isAvailable = isStaffAvailable(staff, timeSlot)
                    
                    return (
                      <td key={`${staff.id}-${timeSlot}`} className="p-2 border-b text-center">
                        {isAvailable ? (
                          <button
                            onClick={() => handleSlotClick(booking, staff.id, timeSlot)}
                            className={`w-16 h-16 rounded-lg font-bold text-lg transition-colors ${
                              booking 
                                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                            data-testid={`time-slot-${staff.id}-${timeSlot}`}
                          >
                            {booking ? 'N' : 'Y'}
                          </button>
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gray-100 text-gray-400 flex items-center justify-center font-bold text-lg">
                            -
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 rounded border"></div>
            <span>Y = booking 가능</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 rounded border"></div>
            <span>N = booking 있음 (클릭하여 information confirmed)</span>
          </div>
        </div>
      </CardContent>

      {/* Booking Details Modal */}
      <BookingDetailsModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        booking={selectedBooking}
      />
    </Card>
  )
}