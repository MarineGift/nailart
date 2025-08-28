'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ExpandedCalendar } from '@/components/expanded-calendar'
import { format } from 'date-fns'
import { CalendarDays, Clock, User, Users, CheckCircle, AlertCircle, RefreshCw, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'

interface Booking {
  id: number
  booking_date: string
  time_slot: string
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled'
  customer_name: string
  service_name: string
  assigned_staff_id: string | null
  staff_id: string | null
  customer_id: string
  service_id: string
  duration: number
  notes: string
  created_by?: string
}

interface Staff {
  id: string
  firstName: string
  lastName: string
  position: string
  specialties?: string[]
  skills?: string[]
  rating?: number
  experience_years?: number
  working_hours?: {
    start: string
    end: string
  }
}

interface Customer {
  id: number
  name: string
  phone_number: string
  service: string
  status: string
}

interface Service {
  id: string
  name: string
  duration: number
  price: number
}

interface AdminBookingCalendarProps {
  currentUser: any
}

export function AdminBookingCalendar({ currentUser }: AdminBookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [bookings, setBookings] = useState<Booking[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showBookingDialog, setShowBookingDialog] = useState(false)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  
  // Real-time refresh states
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [hasNewData, setHasNewData] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [customerGender, setCustomerGender] = useState('')
  const [selectedService, setSelectedService] = useState('')
  const [notes, setNotes] = useState('')

  const timeSlots = [
    '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00'
  ]

  // Staff are already filtered by API to show only working staff for selected date
  const workingStaff = staff

  // Fetch data
  useEffect(() => {
    fetchAllData()
    
    // Set up 30-second polling
    const interval = setInterval(() => {
      fetchAllData(true) // true indicates this is a background refresh
    }, 30000)
    
    return () => clearInterval(interval)
  }, [selectedDate])

  const fetchAllData = async (isBackgroundRefresh = false) => {
    if (!isBackgroundRefresh) {
      setLoading(true)
    }
    setRefreshing(true)
    
    try {
      await Promise.all([
        fetchStaff(),
        fetchBookings(),
        fetchServices(),
        fetchCustomers()
      ])
      
      setLastRefresh(new Date())
      if (isBackgroundRefresh) {
        setHasNewData(true)
        // Auto-hide new data indicator after 3 seconds
        setTimeout(() => setHasNewData(false), 3000)
      }
    } catch (error) {
      console.error('Error fetching all data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleManualRefresh = () => {
    fetchAllData()
    setHasNewData(false)
  }

  const fetchStaff = async () => {
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd')
      const response = await fetch(`/api/staff?date=${formattedDate}`)
      if (response.ok) {
        const data = await response.json()
        setStaff(data || [])
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  const fetchBookings = async () => {
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd')
      const response = await fetch(`/api/bookings?date=${formattedDate}`)
      if (response.ok) {
        const data = await response.json()
        setBookings(data || [])
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    }
  }

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services')
      if (response.ok) {
        const data = await response.json()
        setServices(data || [])
      }
    } catch (error) {
      console.error('Error fetching services:', error)
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers')
      if (response.ok) {
        const data = await response.json()
        setCustomers(data || [])
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  // Check if staff is working at specific time
  const isStaffWorking = (staffMember: Staff, timeSlot: string): boolean => {
    if (!staffMember.working_hours || !staffMember.working_hours.start || !staffMember.working_hours.end) {
      return true // Default to working if no schedule data
    }
    
    const slotTime = parseInt(timeSlot.replace(':', ''))
    const startTime = parseInt(staffMember.working_hours.start.replace(':', ''))
    const endTime = parseInt(staffMember.working_hours.end.replace(':', ''))
    
    return slotTime >= startTime && slotTime < endTime
  }

  // Get bookings for specific time slot
  const getSlotBookings = (timeSlot: string) => {
    return bookings.filter(booking => booking.time_slot === timeSlot)
  }

  // Get available slots count for a time slot
  const getAvailableSlots = (timeSlot: string) => {
    const workingCount = workingStaff.filter((emp: Staff) => isStaffWorking(emp, timeSlot)).length
    const bookedCount = getSlotBookings(timeSlot).length
    return workingCount - bookedCount
  }

  // Check if time slot is fully booked
  const isSlotFullyBooked = (timeSlot: string) => {
    return getAvailableSlots(timeSlot) <= 0
  }

  // Handle creating new booking
  const handleCreateBooking = (timeSlot: string) => {
    if (isSlotFullyBooked(timeSlot)) {
      toast({
        title: "Fully Booked",
        description: "This time slot is fully booked",
        variant: "destructive",
      })
      return
    }
    
    setSelectedTimeSlot(timeSlot)
    setShowBookingDialog(true)
    setCustomerName('')
    setCustomerPhone('')
    setCustomerGender('')
    setSelectedService('')
    setNotes('')
  }

  // Handle View booking
  const handleViewBooking = (booking: Booking) => {
    // 고객 정보 매칭 - 우선순위: booking.customer_name > customers 배열 매칭
    const customer = customers.find(c => c.id.toString() === booking.customer_id.toString())
    const customerName = (booking as any).customer_name || (booking as any).customerName || customer?.name || customer?.last_name || 'Unknown'
    
    // 서비스 정보 매칭 또는 기본 서비스 사용
    let service = null
    if (booking.service_id) {
      // service_id가 있는 경우 매칭 시도
      service = services.find(s => s.id === `svc-${String(booking.service_id).padStart(3, '0')}`)
      if (!service) {
        service = services.find(s => s.id.toString() === booking.service_id.toString())
      }
    }
    // service_id가 없거나 매칭되지 않은 경우 기본 서비스 사용
    if (!service) {
      service = services.find(s => s.id === 'svc-003') || services[0] // Gel Manicure 기본
    }
    const serviceName = service?.name || 'Gel Manicure'
    
    const details = [
      `Customer: ${customerName}`,
      `Phone: ${customer?.phone_number || 'N/A'}`,
      `Service: ${serviceName}`,
      `Time: ${booking.time_slot}`,
      `Status: ${booking.status}`,
      booking.notes ? `Notes: ${booking.notes}` : '',
      booking.created_by ? `Source: ${booking.created_by}` : ''
    ].filter(Boolean).join('\n')
    
    alert(details)
  }

  // Handle Edit booking  
  const handleEditBooking = (booking: Booking) => {
    const customer = customers.find(c => c.id.toString() === booking.customer_id)
    const newNotes = prompt('Edit notes:', booking.notes || '')
    
    if (newNotes !== null) {
      // 여기에 실제 수정 API 호출 로직 추가
      toast({
        title: 'Updated',
        description: 'Booking information has been updated.'
      })
    }
  }

  // Handle booking submission
  const handleBookingSubmit = async () => {
    if (!customerName || !customerPhone || !customerGender) {
      toast({
        title: "Required Fields",
        description: "Name, Phone Number, and Gender are required",
        variant: "destructive",
      })
      return
    }

    try {
      // In a real app, this would create the booking
      console.log('Creating booking:', {
        time_slot: selectedTimeSlot,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_gender: customerGender,
        service_id: selectedService,
        notes
      })

      toast({
        title: "Success",
        description: "Booking created successfully",
      })

      setShowBookingDialog(false)
      // Refresh bookings
      fetchBookings()
    } catch (error) {
      console.error('Error creating booking:', error)
      toast({
        title: "Error",
        description: "Failed to create booking",
        variant: "destructive",
      })
    }
  }

  if (loading && workingStaff.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Daily Booking Calendar</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side - Calendar and Working Staff */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Date Selection
            </CardTitle>
            <CardDescription>
              Select a date to view bookings and staff
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ExpandedCalendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
            
            {/* Date Summary */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">
                {format(selectedDate, 'MMMM dd, yyyy (EEE)')} Summary
              </h4>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-blue-500" />
                    Working Staff:
                  </span>
                  <span className="font-bold">{workingStaff.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    Total Bookings:
                  </span>
                  <span className="font-bold">{bookings.length}</span>
                </div>
              </div>
            </div>
            
            {/* Working Staff Information */}
            <div className="mt-4 p-4 border-2 border-blue-300 rounded-lg bg-blue-50">
              <h4 className="font-bold text-lg mb-3 text-center text-blue-800">Working Staff Today</h4>
              <p className="text-center text-sm text-gray-600 mb-3">
                Staff members working on {format(selectedDate, 'MMMM dd, yyyy')} ({workingStaff.length} people)
              </p>
              
              <div className="space-y-3">
                {workingStaff.map((staffMember: Staff) => {
                  const workHours = `${staffMember.working_hours?.start || '10:00'} - ${staffMember.working_hours?.end || '19:00'}`
                  const staffBookings = bookings.filter(b => 
                    b.assigned_staff_id === staffMember.id || b.staff_id === staffMember.id
                  )
                  
                  return (
                    <div key={staffMember.id} className="bg-white rounded border p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {(staffMember.first_name || 'U')[0]}{(staffMember.last_name || 'N')[0]}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{staffMember.first_name || 'Unknown'} {staffMember.last_name || 'Staff'}</p>
                          <p className="text-xs text-gray-600">{staffMember.role || 'Staff'}</p>
                        </div>
                      </div>
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span>⏰ Hours:</span>
                          <span className="text-gray-600">{workHours}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>📅 Bookings:</span>
                          <span className="font-medium text-blue-600">{staffBookings.length}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Skills:</span>
                          <div className="mt-1">
                            {(staffMember.specialties || ['General']).slice(0, 2).map((skill: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="text-xs mr-1">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                
                {workingStaff.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <p className="text-sm">No staff working on this date</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Side - Time Slot Calendar Grid */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Daily Booking Calendar - {format(selectedDate, 'MMMM dd, yyyy (EEE)')} 
                  {hasNewData && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 animate-pulse">
                      New Data
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Calendar view showing bookings by time slots. Available slots: Working staff - Booked customers
                  <span className="text-xs text-gray-500 ml-2">
                    Last updated: {format(lastRefresh, 'HH:mm:ss')}
                  </span>
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleManualRefresh}
                disabled={refreshing}
                data-testid="button-refresh-calendar"
              >
                {refreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Time Slot Calendar Grid */}
            <div className="space-y-3">
              {timeSlots.map((timeSlot) => {
                const slotBookings = getSlotBookings(timeSlot)
                const workingCount = workingStaff.filter((emp: Staff) => isStaffWorking(emp, timeSlot)).length
                const availableSlots = getAvailableSlots(timeSlot)
                const isFullyBooked = isSlotFullyBooked(timeSlot)
                
                return (
                  <div key={timeSlot} className={`border-2 rounded-lg p-4 ${
                    isFullyBooked ? 'border-red-300 bg-red-50' : 
                    slotBookings.length > 0 ? 'border-yellow-300 bg-yellow-50' : 
                    'border-green-300 bg-green-50'
                  }`}>
                    {/* Time Slot Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-blue-600" />
                          <span className="text-xl font-bold text-gray-800">{timeSlot}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <Badge variant="outline" className="bg-white">
                            Working: {workingCount}
                          </Badge>
                          <Badge variant="outline" className="bg-white">
                            Booked: {slotBookings.length}
                          </Badge>
                          <Badge className={`${
                            availableSlots > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            Available: {availableSlots}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Book Button */}
                      <Button
                        variant={isFullyBooked ? "secondary" : "default"}
                        size="sm"
                        disabled={isFullyBooked}
                        onClick={() => handleCreateBooking(timeSlot)}
                        className={`${isFullyBooked ? 'opacity-50' : 'bg-blue-600 hover:bg-blue-700'}`}
                      >
                        {isFullyBooked ? (
                          <>
                            <AlertCircle className="h-4 w-4 mr-1" />
                            Full
                          </>
                        ) : (
                          `+ Book (${availableSlots} left)`
                        )}
                      </Button>
                    </div>
                    
                    {/* Bookings List */}
                    {slotBookings.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {slotBookings.map((booking, index) => {
                          const customer = customers.find(c => c.id.toString() === booking.customer_id)
                          // 서비스 매칭 또는 기본 서비스 사용
                          let service = null
                          if (booking.service_id) {
                            // service_id가 있는 경우 매칭 시도
                            service = services.find(s => s.id === `svc-${String(booking.service_id).padStart(3, '0')}`)
                            if (!service) {
                              service = services.find(s => s.id.toString() === booking.service_id.toString())
                            }
                          }
                          // service_id가 없거나 매칭되지 않은 경우 기본 서비스 사용
                          if (!service) {
                            service = services.find(s => s.id === 'svc-003') || services[0] // Gel Manicure 기본
                          }
                          const assignedStaff = workingStaff.find((e: Staff) => e.id === booking.assigned_staff_id || e.id === booking.staff_id)
                          
                          return (
                            <div key={booking.id || index} className="bg-white rounded-lg border p-3 shadow-sm">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-blue-500" />
                                  <span className="font-medium text-sm">{customer?.name || booking.customer_name || 'Unknown'}</span>
                                </div>
                                <Badge className={`text-xs ${
                                  booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                  booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {booking.status}
                                </Badge>
                              </div>
                              <div className="text-xs text-gray-600 space-y-1">
                                <div>💅 {service?.name || 'Gel Manicure'}</div>
                                <div>👤 {assignedStaff ? `${assignedStaff.firstName} ${assignedStaff.lastName}` : 'Unassigned'}</div>
                                {booking.duration && <div>⏱️ {booking.duration} min</div>}
                                {booking.source && <div className="text-gray-500">📍 {booking.source}</div>}
                                {booking.created_by && <div className="text-purple-600 font-medium">🌐 Source: {booking.created_by}</div>}
                              </div>
                              <div className="flex gap-1 mt-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-xs h-6 px-2"
                                  onClick={() => handleViewBooking(booking)}
                                  data-testid={`button-view-booking-${booking.id}`}
                                >
                                  View
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="text-xs h-6 px-2 text-blue-600"
                                  onClick={() => handleEditBooking(booking)}
                                  data-testid={`button-edit-booking-${booking.id}`}
                                >
                                  Edit
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-400">
                        <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No bookings for this time slot</p>
                        <p className="text-xs mt-1">
                          {workingCount} staff member{workingCount !== 1 ? 's' : ''} available
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Booking</DialogTitle>
            <DialogDescription>
              Create a booking for {selectedTimeSlot} on {format(selectedDate, 'MMMM dd, yyyy')}
              <br />
              Available slots: {selectedTimeSlot ? getAvailableSlots(selectedTimeSlot) : 0}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer-name">Customer Name *</Label>
                <Input
                  id="customer-name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="customer-phone">Phone Number *</Label>
                <Input
                  id="customer-phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="010-0000-0000"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="customer-gender">Gender *</Label>
              <Select value={customerGender} onValueChange={setCustomerGender}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="service">Service (Optional)</Label>
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger>
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - ${service.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowBookingDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleBookingSubmit}>
                Create Booking
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}