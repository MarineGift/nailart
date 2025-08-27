'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Calendar } from '@/components/ui/calendar'
import { CalendarDays, Clock, User, CreditCard, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

// Load Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || process.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_51RnSCVHKN83pTkpdngZhJgpvi2NEYnCj9sDEkJN2abPJKc9jDUZZ452AswNwVC3VQNVs3MAZ7mQOcIo31VGcT6i200deEZeqAq')

interface Service {
  id: string
  name: string
  duration_min: number
  base_price_cents: number
  description: string
  category?: string
}

interface CustomerBookingFlowProps {
  onBack?: () => void
}

export function CustomerBookingFlow({ onBack }: CustomerBookingFlowProps = {}) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('')
  const [selectedStaff, setSelectedStaff] = useState('')
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [nonWorkingDays, setNonWorkingDays] = useState<string[]>([])
  const [customerInfo, setCustomerInfo] = useState({
    lastName: '',
    phone: '',
    email: '',
    gender: '',
    ethnicity: '',
    notes: '',
    isExistingCustomer: false
  })
  
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(false)
  const [clientSecret, setClientSecret] = useState('')
  const { toast } = useToast()

  // Phone number formatting function
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '')
    
    // Limit to 10 digits
    const limited = cleaned.slice(0, 10)
    
    // Format as (123) 456-7890
    if (limited.length >= 6) {
      return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`
    } else if (limited.length >= 3) {
      return `(${limited.slice(0, 3)}) ${limited.slice(3)}`
    } else if (limited.length > 0) {
      return `(${limited}`
    }
    return limited
  }

  const fetchNonWorkingDays = async () => {
    try {
      const year = selectedDate.getFullYear()
      const response = await fetch(`/api/non-working-days?year=${year}`)
      if (response.ok) {
        const data = await response.json()
        const dates = data.map((day: any) => day.date)
        setNonWorkingDays(dates)
      }
    } catch (error) {
      console.error('Error fetching non-working days:', error)
    }
  }

  const fetchBookings = async () => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0]
      const response = await fetch(`/api/bookings?date=${dateStr}`)
      if (response.ok) {
        const data = await response.json()
        setBookings(data || [])
      } else {
        setBookings([])
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
      setBookings([])
    }
  }

  useEffect(() => {
    fetchServices()
    fetchWorkingStaff()
    fetchBookings()
    fetchNonWorkingDays()
    
    // Check for rebooking data
    checkForRebookingData()
  }, [selectedDate])

  const checkForRebookingData = () => {
    try {
      const rebookingData = sessionStorage.getItem('rebookingData')
      if (rebookingData) {
        const data = JSON.parse(rebookingData)
        console.log('🔄 리부킹 데이터 발견:', data)
        
        // Auto-fill customer information
        setCustomerInfo({
          lastName: data.name || '',
          phone: data.phone || '',
          email: '',
          gender: '',
          ethnicity: '',
          notes: `리부킹 (원본 예약 ID: ${data.booking_id})`,
          isExistingCustomer: true
        })
        
        // Clear rebooking data
        sessionStorage.removeItem('rebookingData')
        
        toast({
          title: '리부킹 정보 로드됨',
          description: `${data.name}님의 기존 정보가 자동으로 입력되었습니다.`,
        })
      }
    } catch (error) {
      console.error('Error processing rebooking data:', error)
    }
  }

  const fetchWorkingStaff = async () => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0]
      const response = await fetch(`/api/staff?date=${dateStr}`)
      if (response.ok) {
        const data = await response.json()
        if (data && data.length > 0) {
          setStaff(data)
        } else {
          // Use fallback data if no staff found
          setStaff([
            { id: '1', firstName: 'Jane', lastName: 'Smith', position: 'Senior Technician', shift_start: '10:00', shift_end: '19:00' },
            { id: '2', firstName: 'Jessica', lastName: 'Brown', position: 'Nail Technician', shift_start: '10:00', shift_end: '18:00' },
            { id: '3', firstName: 'Amy', lastName: 'Johnson', position: 'Nail Artist', shift_start: '11:00', shift_end: '19:00' },
            { id: '4', firstName: 'Sophia', lastName: 'Davis', position: 'Senior Technician', shift_start: '10:00', shift_end: '17:00' }
          ])
        }
      } else {
        // Fallback to mock data with realistic schedules
        setStaff([
          { id: '1', firstName: 'Jane', lastName: 'Smith', position: 'Senior Technician', shift_start: '10:00', shift_end: '19:00' },
          { id: '2', firstName: 'Jessica', lastName: 'Brown', position: 'Nail Technician', shift_start: '10:00', shift_end: '18:00' },
          { id: '3', firstName: 'Amy', lastName: 'Johnson', position: 'Nail Artist', shift_start: '11:00', shift_end: '19:00' },
          { id: '4', firstName: 'Sophia', lastName: 'Davis', position: 'Senior Technician', shift_start: '10:00', shift_end: '17:00' }
        ])
      }
    } catch (error) {
      console.error('Error fetching staff:', error)
      // Fallback to mock data with schedules
      setStaff([
        { id: '1', firstName: 'Jane', lastName: 'Smith', position: 'Senior Technician', shift_start: '10:00', shift_end: '19:00' },
        { id: '2', firstName: 'Jessica', lastName: 'Brown', position: 'Nail Technician', shift_start: '10:00', shift_end: '18:00' },
        { id: '3', firstName: 'Amy', lastName: 'Johnson', position: 'Nail Artist', shift_start: '11:00', shift_end: '19:00' },
        { id: '4', firstName: 'Sophia', lastName: 'Davis', position: 'Senior Technician', shift_start: '10:00', shift_end: '17:00' }
      ])
    }
  }

  const fetchServices = async () => {
    // Load services from API
    try {
      const response = await fetch('/api/services?include_details=true')
      if (response.ok) {
        const data = await response.json()
        console.log('Loaded services:', data)
        setServices(data)
      } else {
        // Fallback services
        setServices([
          { id: '1', name: 'Spa Manicure', base_price_cents: 3500, duration_min: 60, description: 'Relaxing spa manicure treatment', category: 'manicure' },
          { id: '2', name: 'Spa Pedicure', base_price_cents: 4500, duration_min: 90, description: 'Luxurious spa pedicure treatment', category: 'pedicure' },
          { id: '3', name: 'Regular Manicure', base_price_cents: 2500, duration_min: 45, description: 'Basic nail care and polish', category: 'manicure' },
          { id: '4', name: 'French Manicure', base_price_cents: 3000, duration_min: 60, description: 'Classic French tip style', category: 'manicure' },
          { id: '5', name: 'Color Gel Manicure', base_price_cents: 4000, duration_min: 75, description: 'Long-lasting gel polish', category: 'gel' },
          { id: '6', name: 'Nail Art', base_price_cents: 5500, duration_min: 120, description: 'Custom nail art design', category: 'art' }
        ])
      }
    } catch (error) {
      console.error('Error fetching services:', error)
      // Fallback services
      setServices([
        { id: '1', name: 'Spa Manicure', base_price_cents: 3500, duration_min: 60, description: 'Relaxing spa manicure treatment', category: 'manicure' },
        { id: '2', name: 'Spa Pedicure', base_price_cents: 4500, duration_min: 90, description: 'Luxurious spa pedicure treatment', category: 'pedicure' },
        { id: '3', name: 'Regular Manicure', base_price_cents: 2500, duration_min: 45, description: 'Basic nail care and polish', category: 'manicure' },
        { id: '4', name: 'French Manicure', base_price_cents: 3000, duration_min: 60, description: 'Classic French tip style', category: 'manicure' },
        { id: '5', name: 'Color Gel Manicure', base_price_cents: 4000, duration_min: 75, description: 'Long-lasting gel polish', category: 'gel' },
        { id: '6', name: 'Nail Art', base_price_cents: 5500, duration_min: 120, description: 'Custom nail art design', category: 'art' }
      ])
    }
  }

  const isSlotAvailable = (timeSlot: string, staffId: string) => {
    // Check if this staff member has a booking at this time slot
    return !bookings.some(booking => 
      booking.time_slot === timeSlot && 
      booking.staff_id === staffId &&
      booking.status !== 'cancelled'
    )
  }

  const isStaffAvailable = (timeSlot: string, staff: any) => {
    // Check if staff is working during this time slot
    const slotTime = parseInt(timeSlot.replace(':', ''))
    
    // Handle multiple possible data formats from API
    let startTime = 1000 // default 10:00
    let endTime = 2000   // default 20:00 (updated working hours)
    
    // Try different field names that might contain working hours
    if (staff.workingStartTime) {
      startTime = parseInt(staff.workingStartTime.replace(':', ''))
    } else if (staff.working_hours?.start) {
      startTime = parseInt(staff.working_hours.start.replace(':', ''))
    } else if (staff.start_time) {
      startTime = parseInt(staff.start_time.substring(0, 5).replace(':', ''))
    } else if (staff.shift_start) {
      startTime = parseInt(staff.shift_start.replace(':', ''))
    }
    
    if (staff.workingEndTime) {
      endTime = parseInt(staff.workingEndTime.replace(':', ''))
    } else if (staff.working_hours?.end) {
      endTime = parseInt(staff.working_hours.end.replace(':', ''))
    } else if (staff.end_time) {
      endTime = parseInt(staff.end_time.substring(0, 5).replace(':', ''))
    } else if (staff.shift_end) {
      endTime = parseInt(staff.shift_end.replace(':', ''))
    }
    
    // Include end time (19:00) as available - use <= to include 19:00
    return slotTime >= startTime && slotTime <= endTime
  }

  const handleTimeSlotSelect = (timeSlot: string, status: string) => {
    if (status === 'Available') {
      setSelectedTimeSlot(timeSlot)
      setSelectedStaff('') // No specific staff shown to customer
    }
  }

  const handleNextStep = () => {
    if (currentStep < 5) {
      if (currentStep === 4) {
        // Create payment intent when moving to payment step
        createPaymentIntent()
      }
      setCurrentStep(currentStep + 1)
    }
  }

  const saveCustomerAndBooking = async (paymentIntentId: string) => {
    console.log('=== STARTING saveCustomerAndBooking ===', paymentIntentId)
    try {
      console.log('=== Starting saveCustomerAndBooking ===')
      console.log('Payment Intent ID:', paymentIntentId)
      console.log('Customer Info:', customerInfo)
      console.log('Selected Services:', selectedServices)
      console.log('Selected Date:', selectedDate)
      console.log('Selected Time Slot:', selectedTimeSlot)

      let customerId: number

      if (customerInfo.isExistingCustomer) {
        // 기존 고객인 경우 - 고객 ID 조회만 수행
        console.log('기존 고객ID 조회 중...')
        const existingCustomerResponse = await fetch(`/api/customers?phone=${customerInfo.phone}`)
        if (existingCustomerResponse.ok) {
          const existingCustomers = await existingCustomerResponse.json()
          if (existingCustomers.length > 0) {
            customerId = existingCustomers[0].id
            console.log('기존 고객ID 찾음:', customerId)
          } else {
            throw new Error('기존 고객 정보를 찾을 수 없습니다.')
          }
        } else {
          throw new Error('기존 고객 조회에 실패했습니다.')
        }
      } else {
        // 신규 고객인 경우 - 새 고객 생성
        console.log('신규 고객 생성 중...')
        const customerData = {
          phone_number: customerInfo.phone,
          last_name: customerInfo.lastName,
          email: customerInfo.email,
          notes: customerInfo.notes,
          is_vip: false,
          loyalty_points: 0,
          total_spent_cents: 0,
          total_visits: 0
        }

        console.log('Sending customer data:', customerData)

        const customerResponse = await fetch('/api/customers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(customerData)
        })

        const customerResult = await customerResponse.text()
        console.log('Customer response status:', customerResponse.status)
        console.log('Customer response:', customerResult)

        if (!customerResponse.ok) {
          console.error('Failed to save customer:', customerResult)
          toast({
            title: "Error",
            description: "Failed to save customer information",
            variant: "destructive"
          })
          return
        }
        
        const customerData_parsed = JSON.parse(customerResult || '{}')
        customerId = customerData_parsed.id
        console.log('신규 고객 생성 완료:', customerId)
      }

      // Calculate total amount
      const totalAmount = selectedServices.reduce((total, serviceId) => {
        const service = services.find(s => s.id === serviceId)
        return total + (service?.base_price_cents || 0)
      }, 0)

      // Create booking using customer ID
      const bookingData = {
        customer_id: customerId,
        customer_phone: customerInfo.phone,
        customer_last_name: customerInfo.lastName,
        appointment_date: selectedDate.toISOString().split('T')[0],
        appointment_time: selectedTimeSlot,
        status: 'confirmed',
        notes: customerInfo.notes,
        created_by: 'Homepage',  // Internet bookings are set as Homepage
        service_ids: selectedServices  // Pass selected service IDs array
      }

      console.log('Sending booking data:', bookingData)

      const bookingResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      })

      const bookingResult = await bookingResponse.text()
      console.log('Booking response status:', bookingResponse.status)
      console.log('Booking response:', bookingResult)

      if (!bookingResponse.ok) {
        console.error('Failed to save booking:', bookingResult)
        toast({
          title: "Error",
          description: "Failed to save booking information",
          variant: "destructive"
        })
        return
      }

      console.log('=== Successfully saved customer and booking ===')
      
      // Refresh the admin data to show the new booking
      setTimeout(() => {
        console.log('Triggering admin data refresh and Assignment tab update')
        window.dispatchEvent(new CustomEvent('refreshBookings'))
        window.dispatchEvent(new CustomEvent('bookingUpdated'))
        // Also trigger localStorage event for cross-tab communication
        localStorage.setItem('bookingUpdated', Date.now().toString())
        localStorage.removeItem('bookingUpdated')
      }, 500)

      toast({
        title: 'Booking Confirmed!',
        description: `Your appointment is confirmed for ${format(selectedDate, 'MMMM d, yyyy')} at ${selectedTimeSlot}.`,
      })

    } catch (error) {
      console.error('Error saving customer and booking:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while saving your booking",
        variant: "destructive"
      })
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Function to lookup customer by phone number
  const lookupCustomerByPhone = async (phoneNumber: string) => {
    if (!phoneNumber || phoneNumber.length < 10) return
    
    setIsLoadingCustomer(true)
    try {
      const response = await fetch(`/api/customers?phone=${encodeURIComponent(phoneNumber)}`)
      if (response.ok) {
        const customers = await response.json()
        if (customers.length > 0) {
          const customer = customers[0]
          setCustomerInfo({
            lastName: customer.last_name || customer.name || '',
            phone: phoneNumber,
            email: customer.email || '',
            gender: customer.gender || '',
            ethnicity: customer.ethnicity || '',
            notes: customer.notes || '',
            isExistingCustomer: true
          })
          toast({
            title: 'Customer Found',
            description: `Loaded information for existing customer ${customer.last_name || customer.name}.`,
          })
        } else {
          setCustomerInfo(prev => ({
            ...prev,
            phone: phoneNumber,
            isExistingCustomer: false,
            lastName: '',
            email: '',
            gender: '',
            ethnicity: '',
            notes: ''
          }))
        }
      }
    } catch (error) {
      console.error('Customer lookup failed:', error)
    } finally {
      setIsLoadingCustomer(false)
    }
  }

  const createPaymentIntent = async () => {
    try {
      if (selectedServices.length === 0) return

      // Calculate total price from selected services
      const originalPrice = selectedServices.reduce((total, serviceId) => {
        const service = services.find(s => s.id === serviceId)
        return total + (service?.base_price_cents || 0)
      }, 0)
      
      // Apply discount rate from settings
      let finalPrice = originalPrice
      let discountAmount = 0
      
      try {
        console.log('Fetching discount settings for payment...')
        const discountResponse = await fetch('/api/settings/discount')
        if (discountResponse.ok) {
          const discountSettings = await discountResponse.json()
          const discountRate = discountSettings.rate || 0
          
          if (discountRate > 0) {
            discountAmount = Math.round((originalPrice * discountRate) / 100)
            finalPrice = originalPrice - discountAmount
            console.log(`Discount applied: ${discountRate}% - $${(discountAmount / 100).toFixed(2)}`)
          }
        }
      } catch (error) {
        console.error('Error fetching discount settings:', error)
      }
      
      console.log('Original Price:', originalPrice / 100)
      console.log('Discount Amount:', discountAmount / 100)  
      console.log('Final Price:', finalPrice / 100)

      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalPrice })
      })

      const data = await response.json()
      setClientSecret(data.clientSecret)
    } catch (error) {
      console.error('Error creating payment intent:', error)
      toast({
        title: "Payment Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive"
      })
    }
  }

  const canProceedFromStep1 = selectedDate && selectedTimeSlot
  const canProceedFromStep2 = selectedServices.length > 0
  const canProceedFromStep3 = customerInfo.lastName && customerInfo.phone
  const canProceedFromStep4 = true // Always allow proceeding from booking confirmation

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <div className="max-w-6xl mx-auto -mt-0">
        {onBack && (
          <div className="absolute top-4 left-4 z-20">
            <button
              onClick={onBack}
              className="text-pink-600 hover:text-pink-800 font-medium flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full shadow-md"
            >
              ← Back to Home
            </button>
          </div>
        )}
        {/* Hero Carousel Header */}
        <div className="relative overflow-hidden shadow-2xl -mt-0">
          <div className="h-96 bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-200 relative">
            <div className="absolute inset-0">
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-40"
                style={{
                  backgroundImage: 'url(https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200&h=400&fit=crop)'
                }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-300/30 via-purple-300/30 to-indigo-300/30"></div>
            </div>
            <div className="relative z-10 flex items-center justify-center h-full text-center px-8">
              <div>
                <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
                  💅 Book Your Appointment
                </h1>
                <p className="text-xl text-white/90 drop-shadow-md max-w-2xl mx-auto">
                  Experience luxury nail care with our expert technicians
                </p>
                <div className="mt-6 flex justify-center space-x-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                    <span className="text-white font-medium">💅 Premium Service</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                    <span className="text-white font-medium">⭐ Expert Staff</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                    <span className="text-white font-medium">🎨 Custom Design</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center mb-8 mt-12">
          <div className="flex space-x-4">
            {[
              { step: 1, title: 'Date & Time', icon: CalendarDays },
              { step: 2, title: 'Service', icon: Clock },
              { step: 3, title: 'Information', icon: User },
              { step: 4, title: 'Booking', icon: CheckCircle },
              { step: 5, title: 'Payment', icon: CreditCard }
            ].map(({ step, title, icon: Icon }) => (
              <div
                key={step}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
                  currentStep >= step 
                    ? 'bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700 shadow-md border-2 border-pink-200' 
                    : 'bg-gray-50 text-gray-500 border-2 border-gray-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Step 1: Date & Time Selection */}
          {currentStep === 1 && (
            <>
              {/* Left Side - Calendar */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarDays className="h-5 w-5" />
                      Select Date
                    </CardTitle>
                    <CardDescription>
                      Choose your preferred appointment date
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      disabled={(date) => {
                        if (!date) return true
                        const dateStr = date.toISOString().split('T')[0]
                        const dayOfWeek = date.getDay() // 0=Sunday, 6=Saturday
                        return (
                          date < new Date() ||
                          dayOfWeek === 0 || dayOfWeek === 6 || // Block weekends
                          nonWorkingDays.includes(dateStr)
                        )
                      }}
                      className="w-full"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Right Side - Time Selection Grid */}
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-xl bg-gradient-to-br from-pink-50 to-purple-50">
                  <CardHeader className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-t-lg">
                    <CardTitle className="flex items-center gap-2 text-purple-800">
                      <Clock className="h-5 w-5 text-pink-600" />
                      Available Times
                    </CardTitle>
                    <CardDescription className="text-purple-600">
                      Available appointment slots for {format(selectedDate, 'MMMM dd, yyyy', { locale: enUS })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Time Slots Grid with Real Staff Availability */}
                    {staff.length === 0 ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                          <div className="animate-spin w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                          <p className="text-gray-600">시간대를 불러오는 중...</p>
                        </div>
                      </div>
                    ) : (
                    <div className="grid grid-cols-5 gap-3">
                      {[
                        '10:00', '10:30', '11:00', '11:30', '12:00', 
                        '12:30', '13:00', '13:30', '14:00', '14:30', 
                        '15:00', '15:30', '16:00', '16:30', '17:00', 
                        '17:30', '18:00', '18:30', '19:00', '19:30'
                      ].map((timeSlot) => {
                        // Use real staff data with proper availability check 
                        const workingStaffList = staff.length > 0 ? staff : []
                        
                        
                        let staffAvailability = []
                        let availableCount = 0
                        let totalStaff = 0
                        
                        if (workingStaffList.length > 0) {
                          staffAvailability = workingStaffList.map(emp => {
                            const lastName = emp.lastName || emp.name || 'Staff'
                            return {
                              name: lastName,
                              available: isStaffAvailable(timeSlot, emp) && isSlotAvailable(timeSlot, emp.id)
                            }
                          })
                          availableCount = staffAvailability.filter(staff => staff.available).length
                          totalStaff = staffAvailability.length
                        } else {
                          // No staff data loaded - show all available since no bookings exist
                          totalStaff = 8 // Use actual staff count
                          availableCount = 8 // All available when no staff or booking data
                        }
                        
                        const hasAvailability = availableCount > 0
                        const isSelected = selectedTimeSlot === timeSlot
                        
                        return (
                          <button
                            key={timeSlot}
                            className={`p-4 rounded-2xl border-2 text-sm font-medium transition-all duration-300 transform ${
                              isSelected
                                ? 'bg-gradient-to-br from-pink-500 to-purple-500 text-white border-pink-300 shadow-xl scale-105'
                                : hasAvailability 
                                  ? 'bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200 text-pink-700 hover:from-pink-100 hover:to-purple-100 hover:border-pink-300 hover:shadow-lg hover:scale-102' 
                                  : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                            onClick={() => {
                              if (hasAvailability) {
                                setSelectedTimeSlot(timeSlot)
                                // Auto-select first available staff member
                                if (staff.length > 0) {
                                  setSelectedStaff(staff[0].id)
                                }
                              }
                            }}
                            disabled={!hasAvailability}
                            data-testid={`timeslot-${timeSlot}`}
                          >
                            <div className="text-center">
                              <div className="font-bold text-base mb-1">{timeSlot}</div>
                              <div className={`text-xs px-3 py-1 rounded-full font-medium ${
                                hasAvailability 
                                  ? isSelected 
                                    ? 'bg-white/30 text-white backdrop-blur-sm' 
                                    : 'bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700'
                                  : 'bg-gray-100 text-gray-500'
                              }`}>
                                {hasAvailability ? 'Available' : 'Booked'}
                              </div>
                              {totalStaff > 0 && (
                                <div className={`text-xs mt-1 ${isSelected ? 'opacity-75' : 'opacity-60'}`}>
                                  {availableCount}/{totalStaff} slots
                                </div>
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Step 2: Service Selection */}
          {currentStep === 2 && (
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Select Services
                  </CardTitle>
                  <CardDescription>
                    Choose one or more services from different categories
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Group services by category */}
                  {(() => {
                    const servicesByCategory = services.reduce((acc, service) => {
                      const category = service.category || 'Other Services'
                      if (!acc[category]) acc[category] = []
                      acc[category].push(service)
                      return acc
                    }, {} as Record<string, typeof services>)

                    return Object.entries(servicesByCategory).map(([categoryName, categoryServices]) => (
                      <div key={categoryName} className="space-y-3">
                        {/* Category Header */}
                        <div className="border-b pb-1">
                          <h3 className="text-lg font-bold text-pink-600 capitalize">
                            {categoryName === 'Spa Specials' ? "Connie's Spa Specials" :
                             categoryName === 'Nail Treatments' ? "Connie's Nail Treatments" :
                             categoryName === 'art' ? "Connie's Nail Design" :
                             categoryName === 'gel' ? 'Gel Services' :
                             categoryName}
                          </h3>
                        </div>

                        {/* Services in this category - Compact Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {categoryServices.map((service) => {
                            const isSelected = selectedServices.includes(service.id)
                            return (
                              <div
                                key={service.id}
                                className={`p-2 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                                  isSelected 
                                    ? 'ring-2 ring-purple-500 bg-gradient-to-r from-purple-100 to-pink-100 border-purple-400 shadow-md' 
                                    : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-purple-50 border-gray-200 hover:border-purple-300'
                                }`}
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedServices(prev => prev.filter(id => id !== service.id))
                                  } else {
                                    setSelectedServices(prev => [...prev, service.id])
                                  }
                                }}
                                data-testid={`service-${service.id}`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1">
                                      <h4 className="font-semibold text-sm text-gray-800 truncate">{service.name}</h4>
                                      {isSelected && (
                                        <div className="w-4 h-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                                          ✓
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                                      <span className="font-medium text-purple-600">${(service.base_price_cents / 100).toFixed(0)}</span>
                                      <span>•</span>
                                      <span>{service.duration_min}min</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))
                  })()}

                  {/* Selected Services Summary */}
                  {selectedServices.length > 0 && (
                    <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                      <h3 className="text-xl font-bold mb-4 text-purple-800 flex items-center gap-2">
                        <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm">
                          {selectedServices.length}
                        </div>
                        Selected Services
                      </h3>
                      <div className="space-y-3">
                        {selectedServices.map(serviceId => {
                          const service = services.find(s => s.id === serviceId)
                          return service ? (
                            <div key={serviceId} className="flex justify-between items-center py-2 border-b border-purple-200 last:border-b-0">
                              <div>
                                <span className="font-medium text-gray-800">{service.name}</span>
                                <span className="text-sm text-gray-600 ml-2">({service.duration_min} min)</span>
                              </div>
                              <span className="font-semibold text-purple-600">${(service.base_price_cents / 100).toFixed(2)}</span>
                            </div>
                          ) : null
                        })}
                        <div className="flex justify-between items-center pt-3 border-t-2 border-purple-300">
                          <div>
                            <span className="text-xl font-bold text-purple-800">Total:</span>
                            <span className="text-sm text-gray-600 ml-2">
                              ({selectedServices.reduce((total, serviceId) => {
                                const service = services.find(s => s.id === serviceId)
                                return total + (service?.duration_min || 0)
                              }, 0)} min total)
                            </span>
                          </div>
                          <span className="text-2xl font-bold text-purple-800">
                            ${(selectedServices.reduce((total, serviceId) => {
                              const service = services.find(s => s.id === serviceId)
                              return total + (service?.base_price_cents || 0)
                            }, 0) / 100).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Customer Information */}
          {currentStep === 3 && (
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Your Information
                  </CardTitle>
                  <CardDescription>
                    Please provide your contact details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Phone Number - Always first */}
                    <div className="w-full">
                      <Label htmlFor="customerPhone" className="text-base font-semibold">
                        Phone Number * {isLoadingCustomer && <span className="text-sm text-gray-500 animate-pulse">(Searching...)</span>}
                      </Label>
                      <Input
                        id="customerPhone"
                        value={customerInfo.phone}
                        onChange={(e) => {
                          const formatted = formatPhoneNumber(e.target.value)
                          setCustomerInfo({...customerInfo, phone: formatted})
                          // Only lookup if we have enough digits (at least 10)
                          const digits = formatted.replace(/\D/g, '')
                          if (digits.length >= 10) {
                            lookupCustomerByPhone(formatted)
                          }
                        }}
                        placeholder="010-1234-5678"
                        data-testid="input-customer-phone"
                        className="text-lg p-3"
                      />
                      <p className="text-sm text-gray-600 mt-1">Enter your phone number to automatically load existing customer information</p>
                    </div>

                    {/* Customer Status Display */}
                    {customerInfo.phone.length >= 10 && (
                      <div className={`p-3 rounded-lg border ${
                        customerInfo.isExistingCustomer 
                          ? 'bg-green-50 border-green-200 text-green-800'
                          : 'bg-blue-50 border-blue-200 text-blue-800'
                      }`}>
                        {customerInfo.isExistingCustomer ? (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">✓ Existing Customer</span>
                            <span>Welcome back, {customerInfo.lastName}!</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">+ New Customer</span>
                            <span>Please enter your name</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Required Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="customerName">Name (Last Name) *</Label>
                        <Input
                          id="customerName"
                          value={customerInfo.lastName}
                          onChange={(e) => setCustomerInfo({...customerInfo, lastName: e.target.value})}
                          placeholder="김"
                          data-testid="input-customer-name"
                          disabled={customerInfo.isExistingCustomer}
                          className={customerInfo.isExistingCustomer ? 'bg-gray-100' : ''}
                        />
                      </div>
                      
                      {/* Only show additional fields if needed */}
                      {(customerInfo.isExistingCustomer) && (
                        <>
                          <div>
                            <Label htmlFor="customerEmail">Email (Optional)</Label>
                            <Input
                              id="customerEmail"
                              type="email"
                              value={customerInfo.email}
                              onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                              placeholder="example@email.com"
                              data-testid="input-customer-email"
                              disabled={customerInfo.isExistingCustomer}
                              className="bg-gray-100"
                            />
                          </div>
                        </>
                      )}
                      
                      <div className="md:col-span-2">
                        <Label htmlFor="customerNotes">Special Requests (Optional)</Label>
                        <Input
                          id="customerNotes"
                          value={customerInfo.notes}
                          onChange={(e) => setCustomerInfo({...customerInfo, notes: e.target.value})}
                          placeholder="Please write any special requests"
                          data-testid="input-customer-notes"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Booking Summary */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-3">Booking Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Date:</span>
                        <span>{format(selectedDate, 'MMMM dd, yyyy', { locale: enUS })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Time:</span>
                        <span>{selectedTimeSlot}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Technician:</span>
                        <span>{selectedStaff}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Services:</span>
                        <div className="text-right">
                          {selectedServices.map(serviceId => {
                            const service = services.find(s => s.id === serviceId)
                            return service ? (
                              <div key={serviceId} className="text-sm">{service.name}</div>
                            ) : null
                          })}
                        </div>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>${(selectedServices.reduce((total, serviceId) => {
                          const service = services.find(s => s.id === serviceId)
                          return total + (service?.base_price_cents || 0)
                        }, 0) / 100).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 4: Booking Confirmation */}
          {currentStep === 4 && (
            <div className="lg:col-span-3">
              <Card className="border-0 shadow-xl bg-gradient-to-br from-pink-50 to-purple-50">
                <CardHeader className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-purple-800">
                    <CheckCircle className="h-5 w-5 text-pink-600" />
                    Booking Confirmation
                  </CardTitle>
                  <CardDescription className="text-purple-600">
                    Please review your booking details before proceeding to payment
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Enhanced Booking Summary */}
                  <div className="bg-gradient-to-br from-white to-pink-50 p-6 rounded-2xl border border-pink-200 shadow-lg">
                    <h3 className="text-2xl font-bold text-purple-800 mb-6 text-center">Your Appointment Details</h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="bg-pink-50 p-4 rounded-xl border border-pink-200">
                          <div className="flex items-center gap-2 mb-2">
                            <CalendarDays className="h-5 w-5 text-pink-600" />
                            <span className="font-semibold text-purple-800">Date & Time</span>
                          </div>
                          <p className="text-lg font-medium text-purple-700">{format(selectedDate, 'MMMM dd, yyyy', { locale: enUS })}</p>
                          <p className="text-lg font-medium text-purple-700">{selectedTimeSlot}</p>
                        </div>
                        
                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="h-5 w-5 text-purple-600" />
                            <span className="font-semibold text-purple-800">Customer Info</span>
                          </div>
                          <p className="text-purple-700 font-medium">{customerInfo.lastName}</p>
                          <p className="text-purple-700">{customerInfo.phone}</p>
                          <p className="text-purple-700">{customerInfo.email}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-5 w-5 text-indigo-600" />
                            <span className="font-semibold text-purple-800">Services</span>
                          </div>
                          <div className="space-y-2">
                            {selectedServices.map(serviceId => {
                              const service = services.find(s => s.id === serviceId)
                              return service ? (
                                <div key={serviceId} className="flex justify-between items-center">
                                  <span className="text-purple-700 font-medium">{service.name}</span>
                                  <span className="text-purple-700">${(service.base_price_cents / 100).toFixed(2)}</span>
                                </div>
                              ) : null
                            })}
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-4 rounded-xl border border-pink-300">
                          <div className="flex justify-between items-center">
                            <span className="text-xl font-bold text-purple-800">Total Amount:</span>
                            <span className="text-2xl font-bold text-purple-800">${(selectedServices.reduce((total, serviceId) => {
                              const service = services.find(s => s.id === serviceId)
                              return total + (service?.base_price_cents || 0)
                            }, 0) / 100).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Special Notes */}
                    {customerInfo.notes && (
                      <div className="mt-6 bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                        <h4 className="font-semibold text-yellow-800 mb-2">Special Requests:</h4>
                        <p className="text-yellow-700">{customerInfo.notes}</p>
                      </div>
                    )}
                    
                    {/* Terms and Conditions */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-2">Please Note:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Please arrive 10 minutes before your appointment</li>
                        <li>• Cancellations must be made at least 24 hours in advance</li>
                        <li>• Late arrivals may result in shortened service time</li>
                        <li>• Payment will be processed securely in the next step</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 5: Booking Success with Optional Discount Payment */}
          {currentStep === 5 && (
            <div className="lg:col-span-3">
              <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50">
                <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    Appointment Booked Successfully!
                  </CardTitle>
                  <CardDescription className="text-green-700">
                    Your appointment has been confirmed. You can now pay with a 5% discount!
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  {/* Booking Summary */}
                  <div className="bg-white p-4 rounded-xl border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-3">Booking Confirmed</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium">{format(selectedDate, 'MMMM dd, yyyy')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time:</span>
                        <span className="font-medium">{selectedTimeSlot}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Customer:</span>
                        <span className="font-medium">{customerInfo.lastName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Discount Offer */}
                  <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-6 rounded-xl border border-pink-300">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-purple-800 mb-2">Special Offer!</h3>
                      <p className="text-lg text-purple-700 mb-4">Pay now and get 5% off your total</p>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-lg">
                          <span className="text-gray-700">Original Total:</span>
                          <span className="text-gray-700 line-through">
                            ${(selectedServices.reduce((total, serviceId) => {
                              const service = services.find(s => s.id === serviceId)
                              return total + (service?.base_price_cents || 0)
                            }, 0) / 100).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xl font-bold">
                          <span className="text-purple-800">With 5% Discount:</span>
                          <span className="text-purple-800">
                            ${(selectedServices.reduce((total, serviceId) => {
                              const service = services.find(s => s.id === serviceId)
                              return total + (service?.base_price_cents || 0)
                            }, 0) * 0.95 / 100).toFixed(2)}
                          </span>
                        </div>
                        <div className="bg-green-100 p-2 rounded-lg">
                          <span className="text-green-800 font-medium">
                            You save: ${(selectedServices.reduce((total, serviceId) => {
                              const service = services.find(s => s.id === serviceId)
                              return total + (service?.base_price_cents || 0)
                            }, 0) * 0.05 / 100).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Options */}
                  <div className="flex gap-4 justify-center">
                    <Button 
                      onClick={() => {
                        toast({
                          title: 'Thank you!',
                          description: 'Your appointment is confirmed. See you soon!',
                        })
                        setTimeout(() => {
                          window.location.href = '/'
                        }, 2000)
                      }}
                      variant="outline"
                      className="flex-1 bg-gray-50 hover:bg-gray-100"
                    >
                      Skip Payment (Pay at Salon)
                    </Button>
                    <Button 
                      onClick={() => {
                        // Create discounted payment intent
                        const discountedAmount = selectedServices.reduce((total, serviceId) => {
                          const service = services.find(s => s.id === serviceId)
                          return total + (service?.base_price_cents || 0)
                        }, 0) * 0.95
                        
                        // Initialize payment with discount
                        fetch('/api/create-payment-intent', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ amount: discountedAmount })
                        })
                        .then(res => res.json())
                        .then(data => {
                          setClientSecret(data.clientSecret)
                          setCurrentStep(6) // Go to payment step
                        })
                        .catch(error => {
                          console.error('Error creating discounted payment:', error)
                          toast({
                            title: 'Payment Error',
                            description: 'Failed to initialize payment. Please try again.',
                            variant: 'destructive'
                          })
                        })
                      }}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    >
                      Pay Now (5% Discount)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 6: Discounted Payment */}
          {currentStep === 6 && (
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment (5% Discount Applied)
                  </CardTitle>
                  <CardDescription>
                    Complete your discounted payment securely
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {clientSecret ? (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <PaymentForm 
                        onPaymentSuccess={async (paymentIntentId) => {
                          // Payment is already handled, just show success
                          toast({
                            title: 'Payment Successful!',
                            description: 'Thank you for your payment. See you at your appointment!',
                          })
                          setTimeout(() => {
                            window.location.href = '/'
                          }, 2000)
                        }}
                        customerInfo={customerInfo}
                        selectedDate={selectedDate}
                        selectedTimeSlot={selectedTimeSlot}
                        selectedStaff={selectedStaff}
                        selectedServices={selectedServices}
                        services={services}
                      />
                    </Elements>
                  ) : (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button 
            variant="outline" 
            onClick={handlePrevStep}
            disabled={currentStep === 1}
            data-testid="button-previous"
          >
            Previous
          </Button>
          
          {currentStep === 3 ? (
            <Button 
              onClick={handleNextStep}
              disabled={!canProceedFromStep3}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              data-testid="button-next"
            >
              Review Booking
            </Button>
          ) : currentStep === 4 ? (
            <div className="flex gap-4">
              <Button 
                onClick={async () => {
                  // Save booking without payment
                  console.log('Attempting to save booking only')
                  try {
                    await saveCustomerAndBooking('no_payment_test')
                    toast({
                      title: 'Booking Completed!',
                      description: 'Your booking has been successfully saved.',
                    })
                    // Proceed to discount payment option
                    setCurrentStep(5)
                  } catch (error) {
                    console.error('Booking save error:', error)
                    toast({
                      title: 'Error',
                      description: 'Failed to save booking.',
                      variant: 'destructive'
                    })
                  }
                }}
                disabled={!canProceedFromStep4}
                className="bg-green-600 hover:bg-green-700 text-white"
                data-testid="button-book-now"
              >
                Booking Confirm
              </Button>
            </div>
          ) : (
            <Button 
              onClick={handleNextStep}
              disabled={
                (currentStep === 1 && !canProceedFromStep1) ||
                (currentStep === 2 && !canProceedFromStep2) ||
                currentStep === 5
              }
              className={`transition-all duration-300 font-semibold ${
                ((currentStep === 1 && canProceedFromStep1) ||
                 (currentStep === 2 && canProceedFromStep2))
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 ring-2 ring-purple-300'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              data-testid="button-next"
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

interface PaymentFormProps {
  onPaymentSuccess: (paymentIntentId: string) => Promise<void>
  customerInfo: any
  selectedDate: Date
  selectedTimeSlot: string
  selectedStaff: string
  selectedServices: string[]
  services: Service[]
}

function PaymentForm({ onPaymentSuccess, customerInfo, selectedDate, selectedTimeSlot }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements || isProcessing) {
      return
    }

    setIsProcessing(true)

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required'
      })

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        })
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('=== PAYMENT SUCCEEDED ===', paymentIntent.id)
        
        // Payment succeeded, save customer and booking data
        try {
          console.log('Calling onPaymentSuccess with payment intent:', paymentIntent.id)
          await onPaymentSuccess(paymentIntent.id)
          console.log('onPaymentSuccess completed successfully')
        } catch (saveError) {
          console.error('Error in onPaymentSuccess:', saveError)
          toast({
            title: "Booking Save Error",
            description: "Payment was successful but failed to save booking data.",
            variant: "destructive",
          })
          return
        }
        
        toast({
          title: "Payment Successful!",
          description: "Your booking has been confirmed!",
        })

        // Redirect to confirmation page after a short delay
        setTimeout(() => {
          window.location.href = '/booking-confirmation'
        }, 2000)
      }
    } catch (error: any) {
      console.error('Payment error:', error)
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        className="w-full"
        disabled={!stripe || !elements || isProcessing}
        data-testid="button-complete-payment"
      >
        {isProcessing ? 'Processing...' : 'Complete Booking & Pay'}
      </Button>
    </form>
  )
}