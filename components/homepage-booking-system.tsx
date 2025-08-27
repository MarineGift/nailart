'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, CheckCircle2, CreditCard, ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { CustomerAvailabilityGrid } from './customer-availability-grid'

interface Service {
  id: number
  name: string
  description: string
  category: string
  duration: number
  price: number
}

interface BookingFormData {
  selectedDate: string
  selectedTimeSlot: string
  selectedServices: number[]
  customerName: string
  customerPhone: string
  customerEmail: string
  customerComments: string
}

export function HomepageBookingSystem() {
  const [currentStep, setCurrentStep] = useState(1)
  const [bookingData, setBookingData] = useState<BookingFormData>({
    selectedDate: '',
    selectedTimeSlot: '',
    selectedServices: [],
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerComments: ''
  })
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(false)
  const [bookingComplete, setBookingComplete] = useState(false)
  const [discountRate, setDiscountRate] = useState(0.05) // Default 5% discount
  const { toast } = useToast()

  useEffect(() => {
    fetchServices()
    fetchDiscountSettings()
  }, [])

  const fetchDiscountSettings = async () => {
    try {
      const response = await fetch('/api/settings/discount')
      if (response.ok) {
        const data = await response.json()
        setDiscountRate(data.onlinePaymentDiscount / 100) // percentage to decimal
      }
    } catch (error) {
      console.error('Error fetching discount settings:', error)
      // 기본값 5% 사용
    }
  }

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services')
      if (response.ok) {
        const data = await response.json()
        setServices(data)
      } else {
        // Provide default services if none exist
        setServices([
          { id: 1, name: 'SPA Manicure', description: '프리미엄 스파 매니큐어', category: 'Manicure', duration: 60, price: 45 },
          { id: 2, name: 'SPA Pedicure', description: '프리미엄 스파 페디큐어', category: 'Pedicure', duration: 75, price: 55 },
          { id: 3, name: 'Nail Treatment', description: '네일 케어 트리트먼트', category: 'Treatment', duration: 30, price: 25 },
          { id: 4, name: 'Regular Manicure', description: '기본 매니큐어', category: 'Manicure', duration: 45, price: 30 },
          { id: 5, name: 'Gel Polish', description: '젤 폴리쉬', category: 'Polish', duration: 30, price: 35 },
          { id: 6, name: 'Nail Art', description: '네일 아트', category: 'Art', duration: 90, price: 65 }
        ])
      }
    } catch (error) {
      console.error('Error fetching services:', error)
      toast({
        title: "Service Loading Error", 
        description: "An error occurred while loading service information.",
        variant: "destructive"
      })
    }
  }

  const handleServiceToggle = (serviceId: number) => {
    setBookingData(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(serviceId)
        ? prev.selectedServices.filter(id => id !== serviceId)
        : [...prev.selectedServices, serviceId]
    }))
  }

  const calculateTotal = () => {
    return bookingData.selectedServices.reduce((total, serviceId) => {
      const service = services.find(s => s.id === serviceId)
      return total + (service?.price || 0)
    }, 0)
  }

  const calculateDiscountedTotal = () => {
    return calculateTotal() * (1 - discountRate)
  }

  const handleSubmitBooking = async () => {
    if (!bookingData.customerName || !bookingData.customerPhone) {
      toast({
        title: "Information Required",
        description: "Please enter your name and phone number.",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      // Create or lookup customer
      const customerResponse = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: bookingData.customerName,
          phone_number: bookingData.customerPhone,
          email: bookingData.customerEmail || '',
          visit_type: 'regular',
          category: 'general'
        })
      })

      let customerId
      if (customerResponse.ok) {
        const customer = await customerResponse.json()
        customerId = customer.id
      } else {
        // Lookup existing customer
        const customersRes = await fetch('/api/customers')
        const customers = await customersRes.json()
        const existingCustomer = customers.find((c: any) => c.phone_number === bookingData.customerPhone)
        customerId = existingCustomer?.id
      }

      // Create booking for each service
      for (const serviceId of bookingData.selectedServices) {
        const service = services.find(s => s.id === serviceId)
        await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            booking_date: bookingData.selectedDate,
            time_slot: bookingData.selectedTimeSlot,
            status: 'confirmed',
            customer_id: customerId,
            service_id: serviceId,
            price: service?.price || 0,
            duration: service?.duration || 60,
            notes: bookingData.customerComments
          })
        })
      }

      setBookingComplete(true)
      toast({
        title: "Booking Complete!",
        description: "Your appointment has been successfully booked."
      })

    } catch (error) {
      console.error('Error creating booking:', error)
      toast({
        title: "Booking Failed",
        description: "An error occurred while processing your booking.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const resetBooking = () => {
    setCurrentStep(1)
    setBookingComplete(false)
    setBookingData({
      selectedDate: '',
      selectedTimeSlot: '',
      selectedServices: [],
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      customerComments: ''
    })
  }

  if (bookingComplete) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <CardTitle className="text-2xl text-green-800">Booking Complete!</CardTitle>
            <CardDescription className="text-green-700">
              Your appointment has been successfully booked.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white p-4 rounded-lg space-y-2">
              <div><strong>Date:</strong> {bookingData.selectedDate}</div>
              <div><strong>Time:</strong> {bookingData.selectedTimeSlot}</div>
              <div><strong>Customer:</strong> {bookingData.customerName}</div>
              <div><strong>Phone:</strong> {bookingData.customerPhone}</div>
              <div><strong>Services:</strong> {bookingData.selectedServices.map(id => services.find(s => s.id === id)?.name).join(', ')}</div>
              <div><strong>Total Amount:</strong> ${calculateTotal()}</div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
              <h4 className="font-semibold text-blue-800">💳 Pre-Payment Benefits</h4>
              <p className="text-blue-700">
                Pay now and receive <strong>{Math.round(discountRate * 100)}% discount</strong> on your total!
              </p>
              <div className="flex justify-between items-center">
                <span>Before discount: ${calculateTotal()}</span>
                <span className="text-lg font-bold text-blue-800">After discount: ${calculateDiscountedTotal().toFixed(2)}</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={resetBooking}
              data-testid="button-new-booking"
            >
              New Booking
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Book ConnieNail
        </h1>
        <p className="text-gray-600">Reserve your luxury nail service experience</p>
      </div>

      {/* Progress steps display */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4">
          {[
            { step: 1, label: 'Select Date', icon: Calendar },
            { step: 2, label: 'Select Time', icon: Clock },
            { step: 3, label: 'Select Service', icon: CheckCircle2 },
            { step: 4, label: 'Customer Info', icon: CreditCard }
          ].map(({ step, label, icon: Icon }) => (
            <div key={step} className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium mb-2 ${
                currentStep >= step 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-xs text-gray-600">{label}</span>
              {step < 4 && <ArrowRight className="h-4 w-4 text-gray-400 mt-2" />}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Date Selection */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Select Date
            </CardTitle>
            <CardDescription>Please select your preferred date</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              type="date"
              value={bookingData.selectedDate}
              onChange={(e) => setBookingData(prev => ({ ...prev, selectedDate: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
              className="w-full p-4 text-lg"
              data-testid="input-date"
            />
            {bookingData.selectedDate && (
              <Button 
                onClick={nextStep}
                className="w-full mt-4"
                data-testid="button-next-to-time"
              >
                Next: Select Time
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Time Selection - Different layout for desktop and mobile */}
      {currentStep === 2 && bookingData.selectedDate && (
        <div className="space-y-4">
          {/* Desktop: Calendar and time grid together */}
          <div className="hidden md:grid md:grid-cols-2 gap-6">
            {/* Calendar display */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Selected Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-purple-50 rounded-lg text-center">
                  <p className="text-purple-700 text-lg font-medium">
                    {bookingData.selectedDate}
                  </p>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={prevStep}
                    className="mt-2"
                  >
                    Change Date
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Time selection grid */}
            <CustomerAvailabilityGrid
              selectedDate={new Date(bookingData.selectedDate)}
              onTimeSlotSelect={(timeSlot) => {
                setBookingData(prev => ({ ...prev, selectedTimeSlot: timeSlot }))
              }}
            />
          </div>

          {/* Mobile: Scrollable time selection */}
          <div className="md:hidden">
            <CustomerAvailabilityGrid
              selectedDate={new Date(bookingData.selectedDate)}
              onTimeSlotSelect={(timeSlot) => {
                setBookingData(prev => ({ ...prev, selectedTimeSlot: timeSlot }))
              }}
            />
          </div>
          
          {/* Selected time and next button */}
          {bookingData.selectedTimeSlot && (
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <h4 className="font-semibold text-purple-900">Selected Booking</h4>
                  <p className="text-purple-700 text-lg font-medium">
                    {bookingData.selectedDate} {bookingData.selectedTimeSlot}
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button 
                      variant="outline"
                      onClick={prevStep}
                      data-testid="button-back-to-date"
                      className="md:hidden" // Show only on mobile
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    <Button 
                      onClick={nextStep}
                      data-testid="button-next-to-service"
                    >
                      Next: Select Service
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Step 3: Service Selection */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Select Service
            </CardTitle>
            <CardDescription>Select your desired services (multiple selections allowed)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {services.map((service) => (
                <div
                  key={service.id}
                  className={`
                    p-4 border-2 rounded-lg cursor-pointer transition-all
                    ${bookingData.selectedServices.includes(service.id)
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                    }
                  `}
                  onClick={() => handleServiceToggle(service.id)}
                  data-testid={`service-${service.id}`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      checked={bookingData.selectedServices.includes(service.id)}
                      onChange={() => {}}
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold">{service.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-purple-600">{service.category}</span>
                        <div className="text-right">
                          <div className="font-bold text-purple-800">${service.price}</div>
                          <div className="text-xs text-gray-500">{service.duration} min</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {bookingData.selectedServices.length > 0 && (
              <div className="bg-purple-50 p-4 rounded-lg space-y-2">
                <h4 className="font-semibold text-purple-900 mb-2">Selected Services</h4>
                <div className="space-y-2 mb-4">
                  {bookingData.selectedServices.map(serviceId => {
                    const service = services.find(s => s.id === serviceId)
                    return (
                      <div key={serviceId} className="flex justify-between text-purple-700">
                        <span>{service?.name}</span>
                        <span>${service?.price}</span>
                      </div>
                    )
                  })}
                </div>
                <div className="flex justify-between items-center font-bold text-purple-900 border-t pt-2">
                  <span>Total:</span>
                  <span>${calculateTotal()}</span>
                </div>
                <div className="flex gap-2 justify-center mt-4">
                  <Button 
                    variant="outline"
                    onClick={prevStep}
                    data-testid="button-back-to-time"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <Button 
                    onClick={nextStep}
                    data-testid="button-next-to-customer-info"
                  >
                    Next: Customer Info
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 4: Customer Information Input */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Customer Information
            </CardTitle>
            <CardDescription>Enter customer information to complete your booking</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName">Name *</Label>
                <Input
                  id="customerName"
                  value={bookingData.customerName}
                  onChange={(e) => setBookingData(prev => ({ ...prev, customerName: e.target.value }))}
                  placeholder="Enter your name"
                  data-testid="input-customer-name"
                />
              </div>
              <div>
                <Label htmlFor="customerPhone">Phone Number *</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  value={bookingData.customerPhone}
                  onChange={(e) => setBookingData(prev => ({ ...prev, customerPhone: e.target.value }))}
                  placeholder="(555) 123-4567"
                  data-testid="input-customer-phone"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="customerEmail">Email (Optional)</Label>
              <Input
                id="customerEmail"
                type="email"
                value={bookingData.customerEmail}
                onChange={(e) => setBookingData(prev => ({ ...prev, customerEmail: e.target.value }))}
                placeholder="email@example.com"
                data-testid="input-customer-email"
              />
            </div>

            <div>
              <Label htmlFor="customerComments">Special Requests (Optional)</Label>
              <Textarea
                id="customerComments"
                value={bookingData.customerComments}
                onChange={(e) => setBookingData(prev => ({ ...prev, customerComments: e.target.value }))}
                placeholder="Please enter any special requests"
                data-testid="textarea-customer-comments"
              />
            </div>

            {/* Booking Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Booking Summary</h4>
              <div className="space-y-1 text-sm">
                <div><strong>Date:</strong> {bookingData.selectedDate}</div>
                <div><strong>Time:</strong> {bookingData.selectedTimeSlot}</div>
                <div><strong>Services:</strong> {bookingData.selectedServices.map(id => services.find(s => s.id === id)?.name).join(', ')}</div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between">
                    <span><strong>Total Amount:</strong></span>
                    <span><strong>${calculateTotal()}</strong></span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={prevStep}
                className="flex-1"
                data-testid="button-back-to-service"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <Button 
                onClick={handleSubmitBooking}
                disabled={loading || !bookingData.customerName || !bookingData.customerPhone}
                className="flex-1"
                data-testid="button-complete-booking"
              >
                {loading ? 'Processing...' : 'Complete Booking'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}