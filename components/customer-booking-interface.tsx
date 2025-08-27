'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, User, Phone, MapPin } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { useToast } from '../hooks/use-toast'

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

interface Service {
  service: {
    id: string
    name: string
    description: string
    price: string
    duration: number
  }
  category: {
    name: string
  }
}

interface Customer {
  phoneNumber: string
  firstName?: string
  lastName?: string
  email?: string
}

export function CustomerBookingInterface() {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedService, setSelectedService] = useState('')
  const [selectedStaff, setSelectedEmployee] = useState('')
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('')
  const [customer, setCustomer] = useState<Customer>({ phoneNumber: '' })
  const [staff, setStaff] = useState<Staff[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const { toast } = useToast()

  // Load services on component mount
  useEffect(() => {
    fetchServices()
  }, [])

  // Load employees when date is selected
  useEffect(() => {
    if (selectedDate) {
      fetchStaffForDate(selectedDate)
    }
  }, [selectedDate])

  // Load available time slots when staff and service are selected
  useEffect(() => {
    if (selectedStaff && selectedService && selectedDate) {
      const service = services.find(s => s.service.id === selectedService)
      if (service) {
        fetchAvailableSlots(selectedStaff, selectedDate, service.service.duration)
      }
    }
  }, [selectedStaff, selectedService, selectedDate, services])

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services')
      if (response.ok) {
        const data = await response.json()
        setServices(data)
      }
    } catch (error) {
      console.error('Error fetching services:', error)
    }
  }

  const fetchStaffForDate = async (date: string) => {
    try {
      const response = await fetch(`/api/staff?date=${date}`)
      if (response.ok) {
        const data = await response.json()
        setStaff(data)
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  const fetchAvailableSlots = async (staffId: string, date: string, duration: number) => {
    try {
      const response = await fetch(`/api/available-slots?staffId=${staffId}&date=${date}&duration=${duration}`)
      if (response.ok) {
        const data = await response.json()
        setAvailableSlots(data.availableSlots)
      }
    } catch (error) {
      console.error('Error fetching available slots:', error)
    }
  }

  const handleCustomerLookup = async () => {
    if (!customer.phoneNumber) {
      toast({
        title: "Error",
        description: "Please enter a phone number",
        variant: "destructive"
      })
      return
    }

    try {
      const response = await fetch(`/api/new-customers`)
      if (response.ok) {
        const customers = await response.json()
        const existingCustomer = customers.find((c: any) => c.phoneNumber === customer.phoneNumber)
        
        if (existingCustomer) {
          setCustomer(existingCustomer)
          toast({
            title: "Customer Found",
            description: `Welcome back, ${existingCustomer.firstName || 'valued customer'}!`
          })
        } else {
          toast({
            title: "New Customer",
            description: "Please fill in your details to continue"
          })
        }
        setStep(2)
      }
    } catch (error) {
      console.error('Error looking up customer:', error)
      setStep(2)
    }
  }

  const handleBooking = async () => {
    if (!selectedDate || !selectedService || !selectedStaff || !selectedTimeSlot || !customer.phoneNumber) {
      toast({
        title: "Error",
        description: "Please complete all booking details",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      // Create customer if new
      let customerId = (customer as any).id
      if (!customerId) {
        const customerResponse = await fetch('/api/new-customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(customer)
        })
        
        if (customerResponse.ok) {
          const newCustomer = await customerResponse.json()
          customerId = newCustomer.id
        } else {
          throw new Error('Failed to create customer')
        }
      }

      // Parse time slot
      const [startTime, endTime] = selectedTimeSlot.split('-')
      const service = services.find(s => s.service.id === selectedService)

      // Create booking
      const bookingResponse = await fetch('/api/new-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          staffId: selectedStaff,
          serviceId: selectedService,
          bookingDate: selectedDate,
          startTime,
          endTime,
          price: parseFloat(service?.service.price || '0'),
          status: 'confirmed',
          paymentStatus: 'pending'
        })
      })

      if (bookingResponse.ok) {
        const booking = await bookingResponse.json()
        toast({
          title: "Booking Confirmed!",
          description: `Your appointment has been scheduled for ${selectedDate} at ${startTime}`
        })
        
        // Reset form
        setStep(1)
        setSelectedDate('')
        setSelectedService('')
        setSelectedEmployee('')
        setSelectedTimeSlot('')
        setCustomer({ phoneNumber: '' })
        setAvailableSlots([])
      } else {
        throw new Error('Failed to create booking')
      }
    } catch (error) {
      console.error('Error creating booking:', error)
      toast({
        title: "Booking Failed",
        description: "Failed to create booking. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const selectedServiceData = services.find(s => s.service.id === selectedService)
  const selectedStaffData = staff.find(e => e.id === selectedStaff)

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent mb-2">
          Book Your Appointment
        </h1>
        <p className="text-gray-600">Experience luxury nail services with our expert team</p>
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Customer Information
            </CardTitle>
            <CardDescription>
              Enter your phone number to look up your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="010-1234-5678"
                value={customer.phoneNumber}
                onChange={(e) => setCustomer(prev => ({ ...prev, phoneNumber: e.target.value }))}
                className="mt-1"
              />
            </div>
            <Button onClick={handleCustomerLookup} className="w-full">
              Continue
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <div className="space-y-6">
          {/* Customer Details */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={customer.firstName || ''}
                  onChange={(e) => setCustomer(prev => ({ ...prev, firstName: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={customer.lastName || ''}
                  onChange={(e) => setCustomer(prev => ({ ...prev, lastName: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={customer.email || ''}
                  onChange={(e) => setCustomer(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Service Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Select Service
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select onValueChange={setSelectedService}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.service.id} value={service.service.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{service.service.name}</span>
                        <span className="text-sm text-gray-500">
                          {service.category.name} • ${service.service.price} • {service.service.duration}min
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedServiceData && (
                <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-900">{selectedServiceData.service.name}</h4>
                  <p className="text-sm text-purple-700 mt-1">{selectedServiceData.service.description}</p>
                  <div className="flex gap-4 mt-2">
                    <Badge variant="secondary">${selectedServiceData.service.price}</Badge>
                    <Badge variant="secondary">{selectedServiceData.service.duration} minutes</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Date Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Select Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </CardContent>
          </Card>

          {/* Staff Selection */}
          {selectedDate && staff.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Available Staff ({staff.length} working)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {staff.map((staff) => (
                    <div
                      key={staff.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedStaff === staff.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                      onClick={() => setSelectedEmployee(staff.id)}
                    >
                      <h4 className="font-semibold">{staff.firstName} {staff.lastName}</h4>
                      <p className="text-sm text-gray-600">{staff.position}</p>
                      <p className="text-sm text-purple-600 mt-1">
                        {staff.schedule.startTime} - {staff.schedule.endTime}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Time Slot Selection */}
          {selectedStaff && availableSlots.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Available Time Slots
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {availableSlots.map((slot) => (
                    <Button
                      key={slot}
                      variant={selectedTimeSlot === slot ? "default" : "outline"}
                      onClick={() => setSelectedTimeSlot(slot)}
                      className="h-auto py-3"
                    >
                      {slot}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {selectedStaff && availableSlots.length === 0 && selectedDate && selectedService && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No available time slots for the selected staff member and date.</p>
                <p className="text-sm text-gray-400 mt-1">Please try selecting a different staff member or date.</p>
              </CardContent>
            </Card>
          )}

          {/* Booking Summary & Confirmation */}
          {selectedTimeSlot && (
            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">Customer:</span> {customer.firstName} {customer.lastName}</div>
                  <div><span className="font-medium">Phone:</span> {customer.phoneNumber}</div>
                  <div><span className="font-medium">Service:</span> {selectedServiceData?.service.name}</div>
                  <div><span className="font-medium">Date:</span> {selectedDate}</div>
                  <div><span className="font-medium">Time:</span> {selectedTimeSlot}</div>
                  <div><span className="font-medium">Staff:</span> {selectedStaffData?.firstName} {selectedStaffData?.lastName}</div>
                  <div><span className="font-medium">Duration:</span> {selectedServiceData?.service.duration} minutes</div>
                  <div><span className="font-medium">Price:</span> ${selectedServiceData?.service.price}</div>
                </div>
                <Button 
                  onClick={handleBooking} 
                  disabled={loading}
                  className="w-full h-12 text-lg"
                >
                  {loading ? 'Processing...' : 'Confirm Booking'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}