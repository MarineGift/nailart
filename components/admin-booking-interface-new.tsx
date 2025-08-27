'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ExpandedCalendar } from '@/components/expanded-calendar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { CalendarDays, Clock, User, Users, UserPlus, CheckCircle, AlertCircle, Edit, Phone, Mail } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'

interface Booking {
  id: number | string
  booking_date: string
  time_slot: string
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'scheduled'
  customer_id: number | string
  service_id?: number
  staff_id: string  // 실제 데이터에서 사용하는 필드명
  assigned_staff_id?: string | null  // 호환성을 위해 옵셔널로 유지
  price: number
  duration?: number
  notes: string
  customer_name?: string
  service_name?: string
  staff_name?: string
  source?: string
}

interface Staff {
  id: string
  firstName: string
  lastName: string
  position: string
  specialties: string[]
  working_hours: {
    start: string
    end: string
  }
  phone?: string
  email?: string
}

interface Service {
  id: number
  name: string
  duration: number
  price: number
  description: string
}

interface Customer {
  id: number
  firstName: string
  lastName: string
  phone_number: string
  email?: string
  total_visits: number
  vip_level: 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
}

export function AdminBookingInterface() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [staff, setStaff] = useState<Staff[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [showBookingDialog, setShowBookingDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('')
  const [selectedStaff, setSelectedStaff] = useState<string>('')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  
  // Form states
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [selectedService, setSelectedService] = useState('')
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [bookingMethod, setBookingMethod] = useState('Call')
  const [foundCustomer, setFoundCustomer] = useState<Customer | null>(null)
  const [discountRate, setDiscountRate] = useState(0)

  const { toast } = useToast()

  const timeSlots = [
    '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00'
  ]

  useEffect(() => {
    fetchData()
    fetchDiscountRate()
  }, [selectedDate])

  const fetchDiscountRate = async () => {
    try {
      const response = await fetch('/api/settings/discount')
      if (response.ok) {
        const data = await response.json()
        setDiscountRate(data.discountRate || 0)
      }
    } catch (error) {
      console.error('Error fetching discount rate:', error)
    }
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Load staff for the selected date with fallback data
      try {
        const staffRes = await fetch(`/api/staff?date=${format(selectedDate, 'yyyy-MM-dd')}`)
        if (staffRes.ok) {
          const staffData = await staffRes.json()
          setStaff(staffData.length > 0 ? staffData : [
            { id: '1', firstName: 'Jane', lastName: 'Smith', position: 'Senior Nail Technician', specialties: ['Classic Manicure', 'Nail Art'], working_hours: { start: '10:00', end: '19:00' } },
            { id: '2', firstName: 'Connie', lastName: 'Lee', position: 'Senior Technician', specialties: ['Gel Manicure', 'French Tips', 'Nail Art'], working_hours: { start: '10:00', end: '19:00' } },
            { id: '3', firstName: 'Amy', lastName: 'Chen', position: 'Nail Artist', specialties: ['Nail Art', 'Custom Designs'], working_hours: { start: '11:00', end: '19:00' } },
            { id: '4', firstName: 'Sophia', lastName: 'Kim', position: 'Manicurist', specialties: ['French Manicure', 'Basic Care'], working_hours: { start: '10:00', end: '14:00' } },
            { id: '5', firstName: 'Lorena', lastName: 'Park', position: 'Pedicure Specialist', specialties: ['Pedicure', 'Spa Treatments'], working_hours: { start: '13:00', end: '19:00' } }
          ])
        }
      } catch (error) {
        console.error('Error loading staff:', error)
        // Use fallback data
        setStaff([
          { id: '1', firstName: 'Jane', lastName: 'Smith', position: 'Senior Nail Technician', specialties: ['Classic Manicure', 'Nail Art'], working_hours: { start: '10:00', end: '19:00' } },
          { id: '2', firstName: 'Jessica', lastName: 'Lee', position: 'Gel Specialist', specialties: ['Gel Manicure', 'French Tips'], working_hours: { start: '10:00', end: '19:00' } },
          { id: '3', firstName: 'Amy', lastName: 'Chen', position: 'Nail Artist', specialties: ['Nail Art', 'Custom Designs'], working_hours: { start: '11:00', end: '19:00' } },
          { id: '4', firstName: 'Sophia', lastName: 'Kim', position: 'Manicurist', specialties: ['French Manicure', 'Basic Care'], working_hours: { start: '10:00', end: '14:00' } },
          { id: '5', firstName: 'Lorena', lastName: 'Park', position: 'Pedicure Specialist', specialties: ['Pedicure', 'Spa Treatments'], working_hours: { start: '13:00', end: '19:00' } }
        ])
      }

      // Load bookings for the selected date
      const bookingsRes = await fetch(`/api/bookings?date=${format(selectedDate, 'yyyy-MM-dd')}`)
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json()
        
        // Process bookings data to include time_slot and customer info
        const processedBookings = await Promise.all(bookingsData.map(async (booking: any) => {
          // Extract time from booking_time
          const timeSlot = booking.booking_time ? 
            booking.booking_time.split('T')[1]?.substring(0, 5) : null
          
          // Get customer name from notes or fetch from customer API
          let customerName = 'Unknown Customer'
          let customerPhone = ''
          let customerEmail = ''
          
          if (booking.notes) {
            const nameMatch = booking.notes.match(/Name: ([^|]+)/)
            const phoneMatch = booking.notes.match(/Phone: ([^|]+)/)
            if (nameMatch) customerName = nameMatch[1].trim()
            if (phoneMatch) customerPhone = phoneMatch[1].trim()
          }
          
          // Try to get customer info from customer_id
          if (booking.customer_id) {
            try {
              const customerRes = await fetch(`/api/customers`)
              if (customerRes.ok) {
                const customers = await customerRes.json()
                const customer = customers.find((c: any) => c.id === booking.customer_id)
                if (customer) {
                  customerName = customer.first_name + ' ' + customer.last_name || customer.name || customerName
                  customerPhone = customer.phone_number || customer.phone || customerPhone
                  customerEmail = customer.email || ''
                }
              }
            } catch (err) {
              console.error('Error fetching customer:', err)
            }
          }
          
          return {
            ...booking,
            time_slot: timeSlot,
            customer_name: customerName.trim(),
            customer_phone: customerPhone,
            customer_email: customerEmail,
            // Extract staff assignment from notes
            staff_id: booking.notes?.match(/Assigned Staff: ([^|]+)/)?.[1]?.trim() || booking.staff_id || booking.assigned_staff_id
          }
        }))
        
        console.log('Processed bookings data:', processedBookings)
        setBookings(processedBookings)
      }

      // Load services with fallback data
      try {
        const servicesRes = await fetch('/api/services')
        if (servicesRes.ok) {
          const servicesData = await servicesRes.json()
          setServices(servicesData.length > 0 ? servicesData : [
            { id: 1, name: 'Basic Manicure', duration: 60, price: 35000, description: 'Basic nail care service' },
            { id: 2, name: 'Gel Manicure', duration: 90, price: 45000, description: 'Long-lasting gel polish' },
            { id: 3, name: 'Nail Art', duration: 120, price: 55000, description: 'Custom nail art design' }
          ])
        }
      } catch (error) {
        console.error('Error loading services:', error)
        setServices([
          { id: 1, name: 'Basic Manicure', duration: 60, price: 35000, description: 'Basic nail care service' },
          { id: 2, name: 'Gel Manicure', duration: 90, price: 45000, description: 'Long-lasting gel polish' },
          { id: 3, name: 'Nail Art', duration: 120, price: 55000, description: 'Custom nail art design' }
        ])
      }

      // Load customers
      const customersRes = await fetch('/api/customers')
      if (customersRes.ok) {
        const customersData = await customersRes.json()
        setCustomers(customersData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: "Error",
        description: "Failed to load booking data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Get booking for specific staff and time slot (함수를 먼저 정의)
  const getBookingForSlot = (staffId: string, timeSlot: string): Booking | null => {
    return bookings.find(
      booking => booking.staff_id === staffId && booking.time_slot === timeSlot
    ) || null
  }

  // Show all staff members (no filtering based on bookings)
  const workingStaff = staff
  
  // DETAILED DEBUG: 데이터 흐름 전체 점검
  console.log('=== 데이터 흐름 디버깅 시작 ===')
  console.log(`선택된 날짜: ${format(selectedDate, 'yyyy-MM-dd')}`)
  console.log(`전체 직원 수: ${staff.length}`)
  console.log(`API에서 받은 총 부킹 수: ${bookings.length}`)
  
  // 모든 부킹 정보 출력
  console.log('모든 부킹 데이터:')
  bookings.forEach((booking, index) => {
    console.log(`  ${index + 1}. ${booking.time_slot} - ${booking.customer_name} (직원: ${booking.staff_name})`)
  })
  
  // workingStaff 필터링 결과
  console.log(`필터링된 근무 직원 수: ${workingStaff.length}`)
  console.log('근무 직원 목록:')
  workingStaff.forEach((staff, index) => {
    const staffBookings = bookings.filter(b => b.staff_id === staff.id)
    console.log(`  ${index + 1}. ${staff.firstName} ${staff.lastName} (${staff.id}) - 부킹 ${staffBookings.length}건`)
  })
  
  // 시간대별 부킹 매칭 확인
  console.log('시간대별 부킹 매칭:')
  timeSlots.forEach(timeSlot => {
    const slotBookings = workingStaff.map(staff => {
      const booking = getBookingForSlot(staff.id, timeSlot)
      return booking ? `${staff.firstName} ${staff.lastName}: ${booking.customer_name}` : null
    }).filter(Boolean)
    
    if (slotBookings.length > 0) {
      console.log(`  ${timeSlot}: ${slotBookings.length}건 - ${slotBookings.join(', ')}`)
    }
  })
  
  console.log('=== 데이터 흐름 디버깅 끝 ===')
  console.log(' ')

  // Check if staff is working at specific time
  const isStaffWorking = (staff: Staff, timeSlot: string): boolean => {
    if (!staff.working_hours || !staff.working_hours.start || !staff.working_hours.end) {
      return true // Default to working if no schedule data
    }
    
    const slotTime = parseInt(timeSlot.replace(':', ''))
    const startTime = parseInt(staff.working_hours.start.replace(':', ''))
    const endTime = parseInt(staff.working_hours.end.replace(':', ''))
    
    return slotTime >= startTime && slotTime < endTime
  }

  const handleYClick = (staffId: string, timeSlot: string) => {
    setSelectedStaff(staffId)
    setSelectedTimeSlot(timeSlot)
    setCustomerPhone('')
    setCustomerName('')
    setCustomerEmail('')
    setSelectedService('')
    setSelectedServices([])
    setNotes('')
    setEditMode(false)
    setShowBookingDialog(true)
  }

  const handleNClick = (booking: Booking) => {
    setSelectedBooking(booking)
    setSelectedStaff(booking.staff_id || booking.assigned_staff_id || '')
    setSelectedTimeSlot(booking.time_slot)
    setCustomerPhone('')
    setCustomerName(booking.customer_name || '')
    setCustomerEmail('')
    setSelectedService(booking.service_id?.toString() || '')
    setSelectedServices(booking.service_id ? [booking.service_id.toString()] : [])
    setNotes('') // Show clean notes instead of technical information
    setEditMode(false)
    setShowViewDialog(true)
  }

  const handleSaveBooking = async () => {
    if (selectedServices.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one service",
        variant: "destructive",
      })
      return
    }

    try {
      // Use the first selected service as the primary service
      const primaryServiceId = selectedServices[0]
      const bookingData = {
        booking_date: format(selectedDate, 'yyyy-MM-dd'),
        time_slot: selectedTimeSlot,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        service_id: parseInt(primaryServiceId),
        assigned_staff_id: selectedStaff,
        notes: notes,
        status: 'confirmed',
        booking_method: bookingMethod,
        selected_services: selectedServices.map(id => parseInt(id)) // Store all selected services for future use
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      })

      if (response.ok) {
        await fetchData()
        setShowBookingDialog(false)
        // Reset form
        setCustomerPhone('')
        setCustomerName('')
        setCustomerEmail('')
        setSelectedServices([])
        setNotes('')
        setBookingMethod('Phone')
        setFoundCustomer(null)
        toast({
          title: "Success",
          description: "Booking created successfully",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to create booking",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create booking",
        variant: "destructive",
      })
    }
  }

  const handleUpdateBooking = async () => {
    if (!selectedBooking) return

    if (selectedServices.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one service",
        variant: "destructive",
      })
      return
    }

    try {
      const primaryServiceId = selectedServices[0]
      const updateData = {
        assigned_staff_id: selectedStaff,
        service_id: parseInt(primaryServiceId),
        notes: notes,
        selected_services: selectedServices.map(id => parseInt(id))
      }

      const response = await fetch(`/api/bookings/${selectedBooking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        await fetchData()
        setShowViewDialog(false)
        toast({
          title: "Success",
          description: "Booking updated successfully",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to update booking",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update booking",
        variant: "destructive",
      })
    }
  }

  const searchCustomer = async (phone: string) => {
    const customer = customers.find(c => c.phone_number === phone)
    if (customer) {
      setFoundCustomer(customer)
      setCustomerName(customer.lastName || '')
      setCustomerEmail(customer.email || '')
      toast({
        title: "Customer Found",
        description: `Found ${customer.firstName} ${customer.lastName}`,
      })
    } else {
      setFoundCustomer(null)
      setCustomerName('')
      setCustomerEmail('')
      toast({
        title: "New Customer",
        description: "Please enter customer information",
      })
    }
  }

  const getStaffName = (staffId: string) => {
    const staff = workingStaff.find(e => e.id === staffId)
    return staff ? `${staff.firstName} ${staff.lastName}` : 'Unknown'
  }

  const getServiceName = (serviceId: number) => {
    const service = services.find(s => s.id === serviceId)
    return service?.name || 'Unknown Service'
  }

  if (loading && workingStaff.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6 admin-gradient min-h-screen p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Booking Schedule Management</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Side - Calendar */}
        <Card className="lg:col-span-2 admin-card luxury-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Date Selection
            </CardTitle>
            <CardDescription>
              Select a date to manage staff bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ExpandedCalendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
            
            {/* Date Summary */}
            <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">
                {format(selectedDate, 'MMMM dd, yyyy (EEE)')} Summary
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-blue-500" />
                  <span>Working Staff: {(workingStaff || []).length}</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Total Bookings: {bookings.length}</span>
                </div>
              </div>
            </div>
            
            {/* Staff information Section - 첨부 이미지와 동일 */}
            <div className="mt-4 p-4 admin-card bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <h4 className="font-bold text-lg mb-3 text-center">Staff information</h4>
              <p className="text-center text-sm text-gray-600 mb-3">
                {format(selectedDate, 'MMMM dd, yyyy (EEE)')} Summary
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-blue-500" />
                  <span>Working Staff: {(workingStaff || []).length}</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Total Bookings: {bookings.length}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <h5 className="font-semibold text-sm">Today's Staff</h5>
                <p className="text-xs text-gray-600">Current staff status and availability</p>
                
                {(workingStaff || []).map((staff, index) => {
                  const initials = (staff.firstName?.[0] || '') + (staff.lastName?.[0] || '')
                  const isWorking = true // Always show as working for today
                  const workHours = `${staff.working_hours?.start || '10:00'} - ${staff.working_hours?.end || '19:00'}`
                  
                  return (
                    <div key={staff.id} className="flex items-center space-x-3 p-2 bg-white rounded border">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {initials}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-xs">{staff.firstName} {staff.lastName}</p>
                              {staff.firstName === 'Connie' && staff.lastName === 'Lee' && (
                                <Select value={bookingMethod} onValueChange={setBookingMethod}>
                                  <SelectTrigger className="h-6 w-20 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Phone">Phone</SelectItem>
                                    <SelectItem value="Walk-in">Walk-in</SelectItem>
                                    <SelectItem value="Rebooking">Rebooking</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                            <p className="text-xs text-gray-600">{staff.position}</p>
                            <p className="text-xs text-gray-500">{staff.specialties?.join(', ') || 'General'}</p>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              isWorking ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {isWorking ? 'Working' : 'Off'}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">{workHours}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Side - Y/N Booking Grid */}
        <Card className="lg:col-span-3 admin-card luxury-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Staff Booking Status - {format(selectedDate, 'MMMM dd, yyyy (EEE)')}
            </CardTitle>
            <CardDescription>
              Green (Y) = Available, Red (N) = Booked. Click Y to book, N to view/edit.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Time</th>
                    {workingStaff.map((staff) => (
                      <th key={staff.id} className="text-center p-2 font-medium min-w-[100px]">
                        <div className="space-y-1">
                          <div className="font-semibold text-sm">
                            {staff.firstName} {staff.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {staff.position}
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((timeSlot) => {
                    return (
                    <tr key={timeSlot} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{timeSlot}</td>
                      {workingStaff.map((staff) => {
                        const booking = getBookingForSlot(staff.id, timeSlot)
                        const isWorking = isStaffWorking(staff, timeSlot)
                        
                        if (!isWorking) {
                          return (
                            <td key={staff.id} className="p-2 text-center">
                              <span className="text-gray-400">-</span>
                            </td>
                          )
                        }

                        return (
                          <td key={staff.id} className="p-2 text-center">
                            {booking ? (
                              <Button
                                variant="destructive"
                                size="sm"
                                className="w-12 h-8 admin-button bg-gradient-to-r from-red-200 to-pink-200 text-red-800 font-bold border-red-300 hover:from-red-300 hover:to-pink-300"
                                onClick={() => handleNClick(booking)}
                                data-testid={`button-booking-${staff.id}-${timeSlot}`}
                              >
                                N
                              </Button>
                            ) : (
                              <Button
                                variant="default"
                                size="sm"
                                className="w-12 h-8 admin-button bg-gradient-to-r from-green-200 to-emerald-200 text-green-800 font-bold border-green-300 hover:from-green-300 hover:to-emerald-300"
                                onClick={() => handleYClick(staff.id, timeSlot)}
                                data-testid={`button-available-${staff.id}-${timeSlot}`}
                              >
                                Y
                              </Button>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Booking</DialogTitle>
            <DialogDescription>
              {selectedTimeSlot} - {getStaffName(selectedStaff)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Name field - left aligned */}
            <div>
              <Label htmlFor="name" className="text-left">Name {foundCustomer && <span className="text-xs text-green-600">(Found: {foundCustomer.firstName} {foundCustomer.lastName})</span>}</Label>
              <Input
                id="name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name"
                className="text-left"
                data-testid="input-customer-name"
              />
            </div>
            
            {/* Phone and Source fields side by side */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone" className="text-left">Phone</Label>
                <div className="flex gap-2">
                  <Input
                    id="phone"
                    value={customerPhone}
                    onChange={(e) => {
                      setCustomerPhone(e.target.value)
                      if (e.target.value.length >= 10) {
                        searchCustomer(e.target.value)
                      }
                    }}
                    placeholder="(123) 456-7890"
                    className="text-left"
                    data-testid="input-customer-phone"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => searchCustomer(customerPhone)}
                    data-testid="button-search-customer"
                  >
                    🔍
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="bookingMethod" className="text-left">Source</Label>
                <Select value={bookingMethod} onValueChange={setBookingMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Call">Call</SelectItem>
                    <SelectItem value="Visit">Visit</SelectItem>
                    <SelectItem value="Rebooking">Rebooking</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="email">Customer Email</Label>
              <Input
                id="email"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="customer@email.com"
                data-testid="input-customer-email"
              />
            </div>
            <div>
              <Label>Services</Label>
              <div className="border rounded-lg p-3 space-y-3 max-h-60 overflow-y-auto">
                {services.map((service) => (
                  <div key={service.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={`service-${service.id}`}
                      checked={selectedServices.includes(service.id.toString())}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedServices(prev => [...prev, service.id.toString()])
                        } else {
                          setSelectedServices(prev => prev.filter(id => id !== service.id.toString()))
                        }
                      }}
                      data-testid={`checkbox-service-${service.id}`}
                    />
                    <Label htmlFor={`service-${service.id}`} className="flex-1 cursor-pointer">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{service.name}</span>
                        <div className="text-right text-sm">
                          <div className="font-semibold text-green-600">
                            ${service.price ? (service.price / 100).toLocaleString() : '0'}
                          </div>
                          <div className="text-gray-500">{service.duration || 0} min</div>
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
              {selectedServices.length > 0 && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm font-medium text-blue-800 mb-2">Selected Services Summary:</div>
                  <div className="space-y-1">
                    {selectedServices.map(serviceId => {
                      const service = services.find(s => s.id.toString() === serviceId)
                      return service ? (
                        <div key={serviceId} className="flex justify-between text-sm">
                          <span>{service.name}</span>
                          <span>${service.price ? (service.price / 100).toLocaleString() : '0'}</span>
                        </div>
                      ) : null
                    })}
                    <div className="border-t pt-1 flex justify-between font-medium text-blue-800">
                      <span>Subtotal:</span>
                      <span>
                        ${selectedServices.reduce((total, serviceId) => {
                          const service = services.find(s => s.id.toString() === serviceId)
                          return total + (service?.price || 0)
                        }, 0) / 100}
                      </span>
                    </div>
                    {discountRate > 0 && (
                      <div className="flex justify-between text-sm text-blue-700">
                        <span>Discount ({discountRate}%):</span>
                        <span>-${(selectedServices.reduce((total, serviceId) => {
                          const service = services.find(s => s.id.toString() === serviceId)
                          return total + (service?.price || 0)
                        }, 0) * discountRate / 10000).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-blue-900 text-base">
                      <span>Final Total:</span>
                      <span>
                        ${(selectedServices.reduce((total, serviceId) => {
                          const service = services.find(s => s.id.toString() === serviceId)
                          return total + (service?.price || 0)
                        }, 0) * (100 - discountRate) / 10000).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special requests or notes"
                data-testid="textarea-notes"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveBooking} className="flex-1" data-testid="button-save-booking">
                Create Booking
              </Button>
              <Button variant="outline" onClick={() => setShowBookingDialog(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View/Edit Booking Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Booking Details
              <Button variant="ghost" size="sm" onClick={() => setEditMode(!editMode)}>
                <Edit className="h-4 w-4" />
              </Button>
            </DialogTitle>
            <DialogDescription>
              {selectedTimeSlot} - {format(selectedDate, 'MMMM dd, yyyy')}
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div>
                <Label>Customer</Label>
                <div className="p-2 bg-gray-50 rounded">
                  {selectedBooking.customer_name}
                </div>
              </div>
              <div>
                <Label>Services</Label>
                {editMode ? (
                  <div>
                    <div className="border rounded-lg p-3 space-y-3 max-h-60 overflow-y-auto">
                      {services.map((service) => (
                        <div key={service.id} className="flex items-center space-x-3">
                          <Checkbox
                            id={`edit-service-${service.id}`}
                            checked={selectedServices.includes(service.id.toString())}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedServices(prev => [...prev, service.id.toString()])
                              } else {
                                setSelectedServices(prev => prev.filter(id => id !== service.id.toString()))
                              }
                            }}
                          />
                          <Label htmlFor={`edit-service-${service.id}`} className="flex-1 cursor-pointer">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{service.name}</span>
                              <div className="text-right text-sm">
                                <div className="font-semibold text-green-600">
                                  ${service.price ? (service.price / 100).toLocaleString() : '0'}
                                </div>
                                <div className="text-gray-500">{service.duration || 0} min</div>
                              </div>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                    {selectedServices.length > 0 && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm font-medium text-blue-800 mb-2">Selected Services:</div>
                        <div className="space-y-1">
                          {selectedServices.map(serviceId => {
                            const service = services.find(s => s.id.toString() === serviceId)
                            return service ? (
                              <div key={serviceId} className="flex justify-between text-sm">
                                <span>{service.name}</span>
                                <span>${service.price ? (service.price / 100).toLocaleString() : '0'}</span>
                              </div>
                            ) : null
                          })}
                          <div className="border-t pt-1 flex justify-between font-medium text-blue-800">
                            <span>Subtotal:</span>
                            <span>
                              ${selectedServices.reduce((total, serviceId) => {
                                const service = services.find(s => s.id.toString() === serviceId)
                                return total + (service?.price || 0)
                              }, 0) / 100}
                            </span>
                          </div>
                          {discountRate > 0 && (
                            <div className="flex justify-between text-sm text-blue-700">
                              <span>Discount ({discountRate}%):</span>
                              <span>-${(selectedServices.reduce((total, serviceId) => {
                                const service = services.find(s => s.id.toString() === serviceId)
                                return total + (service?.price || 0)
                              }, 0) * discountRate / 10000).toFixed(2)}</span>
                            </div>
                          )}
                          <div className="border-t pt-1 flex justify-between font-bold text-blue-900">
                            <span>Final Total:</span>
                            <span>
                              ${(selectedServices.reduce((total, serviceId) => {
                                const service = services.find(s => s.id.toString() === serviceId)
                                return total + (service?.price || 0)
                              }, 0) * (100 - discountRate) / 10000).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="font-medium">{getServiceName(selectedBooking.service_id || 0)}</div>
                    <div className="text-sm text-green-600 mt-1">
                      ${selectedBooking.price ? (selectedBooking.price / 100).toLocaleString() : '0'}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <Label>Assigned Staff</Label>
                {editMode ? (
                  <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {workingStaff.map((staff) => (
                        <SelectItem key={staff.id} value={staff.id}>
                          {staff.firstName} {staff.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-2 bg-gray-50 rounded">
                    {selectedBooking.staff_id ? getStaffName(selectedBooking.staff_id) : ''}
                  </div>
                )}
              </div>
              <div>
                <Label>Source</Label>
                {editMode ? (
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Special requests or notes"
                  />
                ) : (
                  <div className="p-2 bg-gray-50 rounded min-h-[60px]">
                    {selectedBooking.source || 'No source information'}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {editMode ? (
                  <>
                    <Button onClick={handleUpdateBooking} className="flex-1">
                      Update Booking
                    </Button>
                    <Button variant="outline" onClick={() => setEditMode(false)} className="flex-1">
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={() => setShowViewDialog(false)} className="w-full">
                    Close
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}