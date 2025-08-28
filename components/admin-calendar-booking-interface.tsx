'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Calendar } from '@/components/ui/calendar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Clock, User, CalendarDays, Briefcase, CheckCircle, XCircle, AlertCircle, Phone, Mail, Star } from 'lucide-react'
import { format } from 'date-fns'
import { enUS } from 'date-fns/locale'

interface StaffSchedule {
  scheduleId: number
  staffId: string
  workDate: string
  startTime: string
  endTime: string
  isWorking: boolean
  notes: string | null
  createdAt: string
  updatedAt: string
  firstName: string
  lastName: string
  position: string
  specialties: string[]
}

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
}

interface Customer {
  id: number
  name: string
  phone_number: string
  email?: string
  total_visits: number
  vip_level: 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
}

interface Service {
  id: number
  name: string
  duration: number
  price: number
  description: string
}

export function AdminCalendarBookingInterface() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [employeeSchedules, setEmployeeSchedules] = useState<EmployeeSchedule[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('')
  const [selectedStaff, setSelectedEmployee] = useState<string>('')
  const [showBookingDialog, setShowBookingDialog] = useState(false)
  const [showViewBookingDialog, setShowViewBookingDialog] = useState(false)
  const [bookingForm, setBookingForm] = useState({
    customerName: '',
    phoneNumber: '',
    serviceId: '',
    notes: ''
  })
  
  // Get user role from auth context
  const { userRole, isLoggedIn } = useAuth()
  
  const { toast } = useToast()

  const dateString = format(selectedDate, 'yyyy-MM-dd')

  useEffect(() => {
    fetchEmployeeSchedules()
    fetchBookings()
    fetchCustomers()
    fetchServices()
  }, [selectedDate])

  const fetchEmployeeSchedules = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/staff-schedules?date=${dateString}`)
      if (response.ok) {
        const data = await response.json()
        setEmployeeSchedules(data)
      } else {
        // Only show employees working on the selected date
        setEmployeeSchedules([
          {
            scheduleId: 1,
            staffId: 'EMP001',
            workDate: dateString,
            startTime: '10:00',
            endTime: '19:00',
            isWorking: true,
            notes: 'Full-time',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            firstName: 'Emily',
            lastName: 'Choi',
            position: 'Senior Nail Technician',
            specialties: ['Nail Art', 'Gel Manicure']
          },
          {
            scheduleId: 2,
            staffId: 'EMP002',
            workDate: dateString,
            startTime: '10:00',
            endTime: '19:00',
            isWorking: true,
            notes: 'Full-time',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            firstName: 'Jessica',
            lastName: 'Jung',
            position: 'Nail Technician',
            specialties: ['Pedicure', 'Classic Manicure']
          },
          {
            scheduleId: 3,
            staffId: 'EMP003',
            workDate: dateString,
            startTime: '10:00',
            endTime: '14:00',
            isWorking: true,
            notes: 'Part-time morning shift',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            firstName: 'Grace',
            lastName: 'Yoon',
            position: 'Part-time Technician',
            specialties: ['Basic Manicure', 'Nail Care']
          },
          {
            scheduleId: 4,
            staffId: 'EMP004',
            workDate: dateString,
            startTime: '11:00',
            endTime: '19:00',
            isWorking: true,
            notes: 'Late start',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            firstName: 'Amy',
            lastName: 'Han',
            position: 'Senior Nail Technician',
            specialties: ['Advanced Nail Art', 'Acrylic Nails']
          },
          {
            scheduleId: 5,
            staffId: 'EMP005',
            workDate: dateString,
            startTime: '13:00',
            endTime: '19:00',
            isWorking: true,
            notes: 'Afternoon shift',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            firstName: 'Sophia',
            lastName: 'Oh',
            position: 'Nail Technician',
            specialties: ['Gel Polish', 'Nail Extensions']
          }
        ])
      }
    } catch (error) {
      console.error('Error fetching staff schedules:', error)
      toast({
        title: "Error",
        description: "Failed to load staff schedules",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchBookings = async () => {
    try {
      const response = await fetch(`/api/bookings?date=${dateString}`)
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers')
      if (response.ok) {
        const data = await response.json()
        setCustomers(data)
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services')
      if (response.ok) {
        const data = await response.json()
        setServices(data)
      } else {
        // Mock services if API fails
        setServices([
          { id: 1, name: 'Classic Manicure', duration: 45, price: 35, description: 'Traditional nail care' },
          { id: 2, name: 'Gel Manicure', duration: 60, price: 55, description: 'Long-lasting gel polish' },
          { id: 3, name: 'Pedicure', duration: 60, price: 45, description: 'Complete foot care' },
          { id: 4, name: 'Nail Art', duration: 90, price: 75, description: 'Custom nail designs' },
          { id: 5, name: 'Acrylic Extensions', duration: 120, price: 85, description: 'Nail length extensions' }
        ])
      }
    } catch (error) {
      console.error('Error fetching services:', error)
      // Mock services as fallback
      setServices([
        { id: 1, name: 'Classic Manicure', duration: 45, price: 35, description: 'Traditional nail care' },
        { id: 2, name: 'Gel Manicure', duration: 60, price: 55, description: 'Long-lasting gel polish' },
        { id: 3, name: 'Pedicure', duration: 60, price: 45, description: 'Complete foot care' },
        { id: 4, name: 'Nail Art', duration: 90, price: 75, description: 'Custom nail designs' },
        { id: 5, name: 'Acrylic Extensions', duration: 120, price: 85, description: 'Nail length extensions' }
      ])
    }
  }

  const getCustomerName = (customerId: number) => {
    const customer = customers.find(c => c.id === customerId)
    return customer ? customer.name : 'Unknown Customer'
  }

  const getServiceName = (serviceId: number) => {
    const service = services.find(s => s.id === serviceId)
    return service ? service.name : 'Unknown Service'
  }

  const getEmployeeBookings = (staffId: string) => {
    return bookings.filter(booking => booking.assigned_staff_id === staffId)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4" />
      case 'pending': return <AlertCircle className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'cancelled': return <XCircle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const handleSlotClick = (timeSlot: string, staffName: string, isAvailable: boolean) => {
    if (!['admin', 'manager'].includes(userRole)) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to manage bookings",
        variant: "destructive"
      })
      return
    }

    setSelectedTimeSlot(timeSlot)
    setSelectedEmployee(staffName)
    
    if (isAvailable) {
      // Y clicked - open booking dialog
      setShowBookingDialog(true)
    } else {
      // N clicked - open view booking dialog
      setShowViewBookingDialog(true)
    }
  }

  const handleCreateBooking = async () => {
    try {
      // In real app, this would call the API
      toast({
        title: "Booking Created",
        description: `Booking created for ${bookingForm.customerName} at ${selectedTimeSlot}`,
      })
      
      // Reset form
      setBookingForm({
        customerName: '',
        phoneNumber: '',
        serviceId: '',
        notes: ''
      })
      setShowBookingDialog(false)
      
      // Refresh bookings
      fetchBookings()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create booking",
        variant: "destructive"
      })
    }
  }

  const getBookingForSlot = (timeSlot: string, staffName: string) => {
    // Find booking for the specific staff and time slot on the selected date
    const staff = employeeSchedules.find(emp => emp.firstName === staffName)
    if (!staff) return null
    
    const booking = bookings.find(b => 
      b.time_slot === timeSlot && 
      b.assigned_staff_id === staff.staffId &&
      b.booking_date === format(selectedDate, 'yyyy-MM-dd')
    )
    
    if (booking) {
      const customer = customers.find(c => c.id === booking.customer_id)
      const service = services.find(s => s.id === booking.service_id)
      return {
        customerName: customer?.name || 'Unknown Customer',
        service: service?.name || 'Unknown Service',
        phone: customer?.phone_number || 'No phone'
      }
    }
    
    return null
  }

  const isSlotAvailable = (timeSlot: string, staffName: string) => {
    // Find the staff by name and check for existing bookings on the selected date
    const staff = employeeSchedules.find(emp => emp.firstName === staffName)
    if (!staff) return false
    
    const booking = bookings.find(b => 
      b.time_slot === timeSlot && 
      b.assigned_staff_id === staff.staffId &&
      b.booking_date === format(selectedDate, 'yyyy-MM-dd')
    )
    return !booking
  }

  const isStaffWorkingAtTime = (staff: EmployeeSchedule, timeSlot: string) => {
    const startTime = staff.startTime
    const endTime = staff.endTime
    
    // Convert time strings to minutes for comparison
    const timeToMinutes = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number)
      return hours * 60 + minutes
    }
    
    const slotMinutes = timeToMinutes(timeSlot)
    const startMinutes = timeToMinutes(startTime)
    const endMinutes = timeToMinutes(endTime)
    
    return slotMinutes >= startMinutes && slotMinutes < endMinutes
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Booking Interface</h1>
          <p className="text-gray-600 mt-1">Manage appointments and staff schedules</p>
        </div>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {format(selectedDate, 'EEEE, MMMM dd, yyyy', { locale: enUS })}
        </Badge>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side - Calendar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Select Date
              </CardTitle>
              <CardDescription>
                Choose a date to view staff schedules and bookings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
                data-testid="admin-booking-calendar"
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Booking Time Y/N Grid */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Working Staff Schedule
              </CardTitle>
              <CardDescription>
                Booking availability grid for {format(selectedDate, 'MMMM dd, yyyy', { locale: enUS })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Staff Names Header */}
              <div className={`grid gap-2 mb-4`} style={{gridTemplateColumns: `120px repeat(${employeeSchedules.length}, 1fr)`}}>
                <div className="text-sm font-medium text-gray-500">Time</div>
                {employeeSchedules.map((staff) => (
                  <div key={staff.staffId} className="text-center text-sm font-medium">
                    {staff.firstName}
                    <div className="text-xs text-gray-500 font-normal">
                      {staff.startTime}-{staff.endTime}
                    </div>
                  </div>
                ))}
              </div>

              {/* Availability Grid */}
              <div className="space-y-2">
                {[
                  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', 
                  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
                  '16:00', '16:30', '17:00', '17:30', '18:00'
                ].map((timeSlot) => (
                  <div key={timeSlot} className={`grid gap-2 items-center`} style={{gridTemplateColumns: `120px repeat(${employeeSchedules.length}, 1fr)`}}>
                    <div className="text-sm font-medium">{timeSlot}</div>
                    {employeeSchedules.map((staff) => {
                      const isWorking = isStaffWorkingAtTime(staff, timeSlot)
                      const isAvailable = isWorking && isSlotAvailable(timeSlot, staff.firstName)
                      
                      if (!isWorking) {
                        // Staff not working at this time
                        return (
                          <div key={staff.staffId} className="text-center">
                            <Badge variant="outline" className="text-xs bg-gray-50 text-gray-400 cursor-not-allowed">
                              -
                            </Badge>
                          </div>
                        )
                      }

                      return (
                        <div key={staff.staffId} className="text-center">
                          <Badge 
                            variant="outline" 
                            className={`text-xs cursor-pointer hover:opacity-80 transition-opacity ${
                              isAvailable 
                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                            onClick={() => handleSlotClick(timeSlot, staff.firstName, isAvailable)}
                          >
                            {isAvailable ? 'Y' : 'N'}
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Staff Details Section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Working Staff Details
              </CardTitle>
              <CardDescription>
                Detailed information for employees working on {format(selectedDate, 'MMMM dd, yyyy', { locale: enUS })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {employeeSchedules.map((staff) => {
                  const staffBookings = getEmployeeBookings(staff.staffId)
                  const employeeImages = ['👩🏻‍💼', '👩🏻‍💻', '👩🏻‍🎨', '👩🏻‍🔬', '👩🏻‍⚕️']
                  const randomImage = employeeImages[Math.floor(Math.random() * employeeImages.length)]
                  
                  return (
                    <Card key={staff.staffId} className="border border-gray-200 hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="text-2xl">{randomImage}</div>
                          <div>
                            <h3 className="font-semibold text-lg">{staff.firstName} {staff.lastName}</h3>
                            <p className="text-sm text-gray-600">{staff.position}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Working Hours</Label>
                            <div className="text-sm text-gray-600 mt-1">
                              {staff.startTime} - {staff.endTime}
                              {staff.notes && (
                                <span className="text-xs text-gray-500 ml-2">({staff.notes})</span>
                              )}
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-gray-700">Skills</Label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {staff.specialties?.map((skill) => (
                                <Badge key={skill} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              )) || (
                                <Badge variant="secondary" className="text-xs">General</Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CalendarDays className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600">Today's Bookings</span>
                            </div>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              {staffBookings.length} bookings
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm text-gray-600">4.8 rating</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Booking</DialogTitle>
            <DialogDescription>
              Create a new booking for {selectedStaff} at {selectedTimeSlot} on {format(selectedDate, 'MMMM dd, yyyy', { locale: enUS })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                value={bookingForm.customerName}
                onChange={(e) => setBookingForm({...bookingForm, customerName: e.target.value})}
                placeholder="Enter customer name"
                data-testid="input-customer-name"
              />
            </div>
            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={bookingForm.phoneNumber}
                onChange={(e) => setBookingForm({...bookingForm, phoneNumber: e.target.value})}
                placeholder="Enter phone number"
                data-testid="input-phone-number"
              />
            </div>
            <div>
              <Label htmlFor="service">Service</Label>
              <Select value={bookingForm.serviceId} onValueChange={(value) => setBookingForm({...bookingForm, serviceId: value})}>
                <SelectTrigger data-testid="select-service">
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id.toString()}>
                      {service.name} - ${service.price} ({service.duration}min)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                value={bookingForm.notes}
                onChange={(e) => setBookingForm({...bookingForm, notes: e.target.value})}
                placeholder="Additional notes"
                data-testid="input-notes"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowBookingDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateBooking} data-testid="button-create-booking">
                Create Booking
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Booking Dialog */}
      <Dialog open={showViewBookingDialog} onOpenChange={setShowViewBookingDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Viewing booking for {selectedStaff} at {selectedTimeSlot} on {format(selectedDate, 'MMMM dd, yyyy', { locale: enUS })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {(() => {
              const booking = getBookingForSlot(selectedTimeSlot, selectedStaff)
              if (!booking) {
                return <p className="text-gray-500">No booking found for this slot.</p>
              }
              return (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Customer:</span>
                    <span>{booking.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Phone:</span>
                    <span>{booking.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Service:</span>
                    <span>{booking.service}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Time:</span>
                    <span>{selectedTimeSlot}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Technician:</span>
                    <span>{selectedStaff}</span>
                  </div>
                </div>
              )
            })()}
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowViewBookingDialog(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}