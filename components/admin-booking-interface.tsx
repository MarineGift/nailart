'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ExpandedCalendar } from '@/components/expanded-calendar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { CalendarDays, Clock, User, Users, UserPlus, CheckCircle, XCircle, AlertCircle, Plus, Search, Phone, Mail, UserCog } from 'lucide-react'

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
}

export function AdminBookingInterface() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('')
  const [showBookingDialog, setShowBookingDialog] = useState(false)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [selectedStaff, setSelectedStaff] = useState<string>('')
  const [customerPhone, setCustomerPhone] = useState<string>('')
  const [customerName, setCustomerName] = useState<string>('')
  const [customerEmail, setCustomerEmail] = useState<string>('')
  const [selectedService, setSelectedService] = useState<string>('')
  const [assignedStaff, setAssignedStaff] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [isExistingCustomer, setIsExistingCustomer] = useState(false)

  const { toast } = useToast()

  // Mock data
  const mockBookings: Booking[] = [
    { id: 1, booking_date: format(selectedDate, 'yyyy-MM-dd'), time_slot: '10:00', status: 'confirmed', customer_id: 1, service_id: 1, assigned_staff_id: '1', price: 35000, duration: 60, notes: 'French manicure requested' },
    { id: 2, booking_date: format(selectedDate, 'yyyy-MM-dd'), time_slot: '10:00', status: 'confirmed', customer_id: 2, service_id: 2, assigned_staff_id: '2', price: 45000, duration: 90, notes: '' },
    { id: 3, booking_date: format(selectedDate, 'yyyy-MM-dd'), time_slot: '11:00', status: 'confirmed', customer_id: 3, service_id: 1, assigned_staff_id: null, price: 35000, duration: 60, notes: '' },
    { id: 4, booking_date: format(selectedDate, 'yyyy-MM-dd'), time_slot: '14:00', status: 'confirmed', customer_id: 4, service_id: 3, assigned_staff_id: '3', price: 55000, duration: 120, notes: 'Complex nail art design' },
    { id: 5, booking_date: format(selectedDate, 'yyyy-MM-dd'), time_slot: '14:00', status: 'confirmed', customer_id: 5, service_id: 2, assigned_staff_id: null, price: 45000, duration: 90, notes: '' },
    { id: 6, booking_date: format(selectedDate, 'yyyy-MM-dd'), time_slot: '16:00', status: 'confirmed', customer_id: 6, service_id: 1, assigned_staff_id: '4', price: 35000, duration: 60, notes: '' },
    { id: 7, booking_date: format(selectedDate, 'yyyy-MM-dd'), time_slot: '17:00', status: 'confirmed', customer_id: 7, service_id: 2, assigned_staff_id: '5', price: 45000, duration: 90, notes: 'Regular customer - knows preferences' }
  ]

  const mockCustomers: Customer[] = [
    { id: 1, name: 'Emma Johnson', phone_number: '010-1234-5678', email: 'emma@email.com', total_visits: 12, vip_level: 'Gold' },
    { id: 2, name: 'Sarah Kim', phone_number: '010-2345-6789', email: 'sarah@email.com', total_visits: 8, vip_level: 'Silver' },
    { id: 3, name: 'Lisa Chen', phone_number: '010-3456-7890', email: 'lisa@email.com', total_visits: 5, vip_level: 'Bronze' },
    { id: 4, name: 'Anna Smith', phone_number: '010-4567-8901', email: 'anna@email.com', total_visits: 15, vip_level: 'Platinum' },
    { id: 5, name: 'Maria Garcia', phone_number: '010-5678-9012', email: 'maria@email.com', total_visits: 3, vip_level: 'Bronze' }
  ]

  const mockServices: Service[] = [
    { id: 1, name: 'Basic Manicure', duration: 60, price: 35000, description: 'Basic nail care service' },
    { id: 2, name: 'Gel Manicure', duration: 90, price: 45000, description: 'Long-lasting gel polish' },
    { id: 3, name: 'Nail Art', duration: 120, price: 55000, description: 'Custom nail art design' }
  ]

  // Dynamic employees based on date - fetch from API
  const [staff, setStaff] = useState<Staff[]>([
    { id: '1', firstName: 'Jane', lastName: 'Smith', position: 'Senior Nail Technician', specialties: ['Classic Manicure', 'Nail Art'], working_hours: { start: '10:00', end: '18:00' } },
    { id: '2', firstName: 'Jessica', lastName: 'Lee', position: 'Gel Specialist', specialties: ['Gel Manicure', 'French Tips'], working_hours: { start: '10:00', end: '18:00' } },
    { id: '3', firstName: 'Amy', lastName: 'Chen', position: 'Nail Artist', specialties: ['Nail Art', 'Custom Designs'], working_hours: { start: '11:00', end: '18:00' } },
    { id: '4', firstName: 'Sophia', lastName: 'Kim', position: 'Manicurist', specialties: ['French Manicure', 'Basic Care'], working_hours: { start: '10:00', end: '14:00' } },
    { id: '5', firstName: 'Lorena', lastName: 'Park', position: 'Pedicure Specialist', specialties: ['Pedicure', 'Spa Treatments'], working_hours: { start: '13:00', end: '18:00' } }
  ])
  
  const [bookingsData, setBookingsData] = useState<Booking[]>([])
  const [servicesData, setServicesData] = useState<Service[]>([])
  const [customersData, setCustomersData] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)

  const timeSlots = [
    '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00'
  ]

  const bookings = bookingsData.filter(booking => booking.booking_date === format(selectedDate, 'yyyy-MM-dd'))
  const customers = customersData
  const services = servicesData
  
  // Filter employees working on selected date
  const workingStaff = staff.filter(emp => {
    // Check if staff is working on this date
    const dayOfWeek = selectedDate.getDay()
    // For now, assume all employees work every day, but in real app you'd check schedule
    return true
  })

  const getTimeSlotInfo = (timeSlot: string) => {
    const totalEmployees = workingStaff.length
    const bookedEmployees = bookings.filter(booking => booking.time_slot === timeSlot).length
    const availableSlots = totalEmployees - bookedEmployees
    
    return {
      total: totalEmployees,
      booked: bookedEmployees,
      available: availableSlots,
      isFull: availableSlots === 0
    }
  }

  const getAvailableStaff = (timeSlot: string) => {
    const busyEmployees = bookings
      .filter(booking => booking.time_slot === timeSlot && booking.assigned_staff_id)
      .map(booking => booking.assigned_staff_id)

    return workingStaff.filter(staff => !busyEmployees.includes(staff.id))
  }

  const getCustomerName = (customerId: number) => {
    const customer = customers.find(c => c.id === customerId)
    return customer?.name || 'Unknown Customer'
  }

  const getServiceName = (serviceId: number) => {
    const service = services.find(s => s.id === serviceId)
    return service?.name || 'Unknown Service'
  }

  const getStaffName = (staffId: string | null) => {
    if (!staffId) return 'Unassigned'
    const staff = staff.find(e => e.id === staffId)
    return staff ? `${staff.firstName} ${staff.lastName}` : 'Unknown Employee'
  }

  const searchCustomer = async (phone: string) => {
    const customer = customers.find(c => c.phone_number === phone)
    if (customer) {
      setCustomerName(customer.name)
      setCustomerEmail(customer.email || '')
      setIsExistingCustomer(true)
      toast({
        title: "Customer Found",
        description: `Loaded information for ${customer.name}`,
      })
    } else {
      setCustomerName('')
      setCustomerEmail('')
      setIsExistingCustomer(false)
      toast({
        title: "New Customer",
        description: "Please enter customer information",
      })
    }
  }

  const handlePhoneSearch = () => {
    if (customerPhone.length >= 10) {
      searchCustomer(customerPhone)
    }
  }

  const createBooking = () => {
    if (!selectedTimeSlot || !selectedService || !customerPhone || !customerName) {
      toast({
        title: "Input Error",
        description: "Please fill in all required information",
        variant: "destructive",
      })
      return
    }

    const service = services.find(s => s.id.toString() === selectedService)
    
    console.log('Creating booking:', {
      booking_date: format(selectedDate, 'yyyy-MM-dd'),
      time_slot: selectedTimeSlot,
      service_id: parseInt(selectedService),
      assigned_staff_id: assignedStaff || null,
      price: service?.price || 0,
      duration: service?.duration || 60,
      notes: notes,
      status: 'confirmed'
    })

    setShowBookingDialog(false)
    resetForm()
    toast({
      title: "Booking Created",
      description: "Booking has been successfully created",
    })
  }

  const assignStaff = (bookingId: number, staffId: string) => {
    console.log('Assigning staff:', { bookingId, staffId })
    setShowAssignDialog(false)
    setSelectedBooking(null)
    toast({
      title: "Assignment Complete",
      description: "Staff has been successfully assigned",
    })
  }

  const resetForm = () => {
    setSelectedTimeSlot('')
    setCustomerPhone('')
    setCustomerName('')
    setCustomerEmail('')
    setSelectedService('')
    setAssignedEmployee('')
    setNotes('')
    setIsExistingCustomer(false)
  }

  const handleAssignStaff = () => {
    if (selectedBooking && selectedStaff) {
      assignEmployee(selectedBooking.id, selectedStaff)
    }
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[calc(100vh-200px)]">
      {/* Left Side - Calendar */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Date Selection
          </CardTitle>
          <CardDescription>
            Select a date to manage bookings
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
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Total Bookings: {bookings.length}</span>
              </div>
              <div className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3 text-orange-500" />
                <span>Unassigned: {bookings.filter(b => !b.assigned_staff_id).length}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Right Side - Booking Management */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {format(selectedDate, 'MMMM dd, yyyy (EEE)')} - Booking Management
          </CardTitle>
          <CardDescription>
            Click on available time slots to create bookings or manage existing ones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Time Slot Grid */}
          <div className="grid grid-cols-4 gap-2 max-h-96 overflow-y-auto">
            {timeSlots.map((time) => {
              const timeSlotInfo = getTimeSlotInfo(time)
              const timeBookings = bookings.filter(b => b.time_slot === time)
              
              return (
                <div key={time} className="space-y-1">
                  <Dialog open={showBookingDialog && selectedTimeSlot === time} onOpenChange={setShowBookingDialog}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTimeSlot(time)
                          setShowBookingDialog(true)
                          resetForm()
                        }}
                        className={`w-full justify-start ${
                          timeSlotInfo.isFull 
                            ? 'border-red-300 bg-red-50' 
                            : timeSlotInfo.available <= 2 
                              ? 'border-orange-300 bg-orange-50' 
                              : 'border-green-300 bg-green-50'
                        }`}
                      >
                        <div className="flex flex-col items-start w-full">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {time}
                          </div>
                          <div className="text-xs">
                            {timeSlotInfo.available}/{timeSlotInfo.total} available
                          </div>
                        </div>
                      </Button>
                    </DialogTrigger>
                    
                    {/* Create Booking Dialog */}
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Create Booking for {time}</DialogTitle>
                        <DialogDescription>
                          Add a new customer booking for this time slot
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        {/* Customer Search */}
                        <div className="space-y-2">
                          <Label>Customer Phone Number</Label>
                          <div className="flex gap-2">
                            <Input
                              placeholder="010-1234-5678"
                              value={customerPhone}
                              onChange={(e) => setCustomerPhone(e.target.value)}
                              data-testid="input-customer-phone"
                            />
                            <Button onClick={handlePhoneSearch} size="sm" data-testid="button-search-customer">
                              <Search className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Customer Information */}
                        <div className="space-y-2">
                          <Label>Customer Name</Label>
                          <Input
                            placeholder="Enter customer name"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            data-testid="input-customer-name"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Email (Optional)</Label>
                          <Input
                            placeholder="customer@email.com"
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            data-testid="input-customer-email"
                          />
                        </div>

                        {/* Service Selection */}
                        <div className="space-y-2">
                          <Label>Service</Label>
                          <Select value={selectedService} onValueChange={setSelectedService}>
                            <SelectTrigger data-testid="select-service">
                              <SelectValue placeholder="Select a service" />
                            </SelectTrigger>
                            <SelectContent>
                              {services.map((service) => (
                                <SelectItem key={service.id} value={service.id.toString()}>
                                  <div className="flex justify-between w-full">
                                    <span>{service.name}</span>
                                    <span className="text-xs text-gray-500">
                                      {service.duration}min - ${service.price.toLocaleString()}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Staff Assignment */}
                        <div className="space-y-2">
                          <Label>Assign Staff (Optional)</Label>
                          <Select value={assignedStaff} onValueChange={setAssignedEmployee}>
                            <SelectTrigger data-testid="select-staff">
                              <SelectValue placeholder="Select an staff" />
                            </SelectTrigger>
                            <SelectContent>
                              {getAvailableStaff(time).map((staff) => (
                                <SelectItem key={staff.id} value={staff.id}>
                                  {staff.firstName} {staff.lastName} - {staff.position}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                          <Label>Notes</Label>
                          <Textarea
                            placeholder="Any special requests or notes..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            data-testid="textarea-notes"
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button onClick={() => setShowBookingDialog(false)} variant="outline" className="flex-1">
                            Cancel
                          </Button>
                          <Button onClick={createBooking} className="flex-1" data-testid="button-create-booking">
                            Create Booking
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  {/* Existing bookings for this time slot */}
                  {timeBookings.map((booking) => (
                    <Dialog key={booking.id} open={showAssignDialog && selectedBooking?.id === booking.id} onOpenChange={setShowAssignDialog}>
                      <DialogTrigger asChild>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-full text-xs p-1 h-auto"
                          onClick={() => {
                            setSelectedBooking(booking)
                            setSelectedEmployee('')
                            setShowAssignDialog(true)
                          }}
                          data-testid={`booking-${booking.id}`}
                        >
                          <div className="flex flex-col items-start w-full">
                            <div className="flex items-center gap-1">
                              <User className="h-2 w-2" />
                              <span className="truncate">{getCustomerName(booking.customer_id)}</span>
                            </div>
                            <div className="text-xs text-gray-600 truncate">
                              {getServiceName(booking.service_id)}
                            </div>
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-1">
                                {booking.assigned_staff_id ? (
                                  <>
                                    <CheckCircle className="h-2 w-2 text-green-500" />
                                    <span className="text-xs truncate">{getStaffName(booking.assigned_staff_id)}</span>
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle className="h-2 w-2 text-orange-500" />
                                    <span className="text-xs">Unassigned</span>
                                  </>
                                )}
                              </div>
                              <UserCog className="h-3 w-3 text-blue-500 opacity-70" />
                            </div>
                          </div>
                        </Button>
                      </DialogTrigger>
                      
                      {/* Staff Assignment Dialog */}
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Assign Employee</DialogTitle>
                          <DialogDescription>
                            Assign an staff to this booking
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          {/* Booking Details */}
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <h4 className="font-semibold text-sm mb-2">Booking Details</h4>
                            <div className="space-y-1 text-xs">
                              <div>Customer: {getCustomerName(booking.customer_id)}</div>
                              <div>Service: {getServiceName(booking.service_id)}</div>
                              <div>Time: {booking.time_slot}</div>
                              <div>Duration: {booking.duration} minutes</div>
                              {booking.source && <div>Source: {booking.source}</div>}
                            </div>
                          </div>

                          {/* Staff Selection */}
                          <div className="space-y-2">
                            <Label>Select Employee</Label>
                            <Select value={selectedStaff} onValueChange={setSelectedEmployee}>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose an staff" />
                              </SelectTrigger>
                              <SelectContent>
                                {getAvailableStaff(booking.time_slot).map((staff) => (
                                  <SelectItem key={staff.id} value={staff.id}>
                                    <div className="flex items-center gap-2">
                                      <Avatar className="h-6 w-6">
                                        <AvatarFallback className="text-xs">
                                          {staff.firstName[0]}{staff.lastName[0]}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <div className="font-medium">{staff.firstName} {staff.lastName}</div>
                                        <div className="text-xs text-gray-500">{staff.position}</div>
                                      </div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex gap-2">
                            <Button onClick={() => setShowAssignDialog(false)} variant="outline" className="flex-1">
                              Cancel
                            </Button>
                            <Button 
                              onClick={handleAssignEmployee}
                              disabled={!selectedStaff}
                              className="flex-1"
                              data-testid="button-assign-staff"
                            >
                              Assign Employee
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}