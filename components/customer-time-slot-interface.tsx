'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Calendar, Clock, User, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'
import { PaymentCheckout } from './payment-checkout'

interface Staff {
  id: string
  firstName: string
  lastName: string
  workingStartTime?: string
  workingEndTime?: string
  status: string
}

interface Booking {
  id: number
  booking_date: string
  time_slot: string
  customer_id: number
  service_id: number
  assigned_staff_id: string | null
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled'
  price: number
  duration: number
  notes: string
}

interface TimeSlot {
  time: string
  availableCount: number
  totalEmployees: number
  employees: Staff[]
}

interface CustomerTimeSlotInterfaceProps {
  selectedDate: Date
}

export function CustomerTimeSlotInterface({ selectedDate }: CustomerTimeSlotInterfaceProps) {
  const [staff, setStaff] = useState<Staff[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [bookingComplete, setBookingComplete] = useState(false)
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerComments, setCustomerComments] = useState('')
  const [discountRate, setDiscountRate] = useState(10) // Default 10% discount
  const { toast } = useToast()

  const dateStr = selectedDate.toISOString().split('T')[0]

  useEffect(() => {
    fetchStaffAndBookings()
    fetchDiscountSettings()
  }, [selectedDate])

  const fetchStaffAndBookings = async () => {
    try {
      const [staffRes, bookingsRes] = await Promise.all([
        fetch(`/api/staff?date=${dateStr}`),
        fetch(`/api/bookings?date=${dateStr}`)
      ])

      let staffData: Staff[] = []
      let bookingsData: Booking[] = []

      if (staffRes.ok) {
        staffData = await staffRes.json()
      } else {
        // Mock data if API fails
        staffData = [
          { id: '1', firstName: 'Emily', lastName: 'Choi', workingStartTime: '10:00', workingEndTime: '18:00', status: 'active' },
          { id: '2', firstName: 'Jessica', lastName: 'Jung', workingStartTime: '10:00', workingEndTime: '18:00', status: 'active' },
          { id: '3', firstName: 'Grace', lastName: 'Yoon', workingStartTime: '10:00', workingEndTime: '18:00', status: 'active' },
          { id: '4', firstName: 'Amy', lastName: 'Han', workingStartTime: '10:00', workingEndTime: '14:00', status: 'active' },
          { id: '5', firstName: 'Sophia', lastName: 'Oh', workingStartTime: '10:00', workingEndTime: '18:00', status: 'active' },
          { id: '6', firstName: 'Rachel', lastName: 'Lim', workingStartTime: '10:00', workingEndTime: '18:00', status: 'active' },
          { id: '7', firstName: 'Chloe', lastName: 'Kang', workingStartTime: '10:00', workingEndTime: '18:00', status: 'active' },
          { id: '8', firstName: 'Sarah', lastName: 'Kim', workingStartTime: '10:00', workingEndTime: '18:00', status: 'active' },
          { id: '9', firstName: 'Jennifer', lastName: 'Lee', workingStartTime: '10:00', workingEndTime: '18:00', status: 'active' },
          { id: '10', firstName: 'Michelle', lastName: 'Park', workingStartTime: '10:00', workingEndTime: '18:00', status: 'active' }
        ]
      }

      if (bookingsRes.ok) {
        bookingsData = await bookingsRes.json()
      }

      setStaff(staffData)
      setBookings(bookingsData)
      generateTimeSlots(staffData, bookingsData)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: "data loading 오류",
        description: "booking information를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive"
      })
    }
  }

  const fetchDiscountSettings = async () => {
    try {
      const response = await fetch('/api/settings/discount')
      if (response.ok) {
        const data = await response.json()
        setDiscountRate(data.rate || 10)
      }
    } catch (error) {
      console.log('Using default discount rate')
    }
  }

  const generateTimeSlots = (staffsList: Staff[], bookingsList: Booking[]) => {
    const slots: TimeSlot[] = []
    const startHour = 10
    const endHour = 18
    const intervalMinutes = 30

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += intervalMinutes) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        
        // Find employees working at this time
        const availableEmployees = employeesList.filter(staff => {
          const workStart = staff.workingStartTime || '10:00'
          const workEnd = staff.workingEndTime || '18:00'
          const currentTime = `${hour}:${minute.toString().padStart(2, '0')}`
          
          return currentTime >= workStart && currentTime < workEnd && staff.status === 'active'
        })

        // Count bookings for this time slot
        const bookedCount = bookingsList.filter(booking => 
          booking.time_slot === timeString && 
          booking.status !== 'cancelled'
        ).length

        const availableCount = Math.max(0, availableEmployees.length - bookedCount)

        slots.push({
          time: timeString,
          availableCount,
          totalEmployees: availableEmployees.length,
          employees: availableEmployees
        })
      }
    }

    setTimeSlots(slots)
  }

  const handleTimeSlotClick = (timeSlot: TimeSlot) => {
    if (timeSlot.availableCount > 0) {
      setSelectedTimeSlot(timeSlot.time)
      setShowBookingForm(true)
    } else {
      toast({
        title: "booking 불가",
        description: "해당 time대는 booking이 가득찼습니다.",
        variant: "destructive"
      })
    }
  }

  const handleBookingSubmit = async () => {
    if (!customerPhone.trim()) {
      toast({
        title: "입력 오류",
        description: "전화번호를 입력해주세요.",
        variant: "destructive"
      })
      return
    }

    try {
      const bookingData = {
        booking_date: dateStr,
        time_slot: selectedTimeSlot,
        customer_phone: customerPhone,
        notes: customerComments,
        status: 'confirmed'
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      })

      if (response.ok) {
        setBookingComplete(true)
        toast({
          title: "booking completed",
          description: "booking이 성공적으로 completed되었습니다!",
        })
        
        // Refresh the data
        fetchStaffAndBookings()
      } else {
        throw new Error('Booking failed')
      }
    } catch (error) {
      console.error('Error creating booking:', error)
      toast({
        title: "booking 실패",
        description: "booking process 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive"
      })
    }
  }

  const handlePaymentClick = () => {
    setShowPayment(true)
  }

  const resetBookingForm = () => {
    setShowBookingForm(false)
    setShowPayment(false)
    setBookingComplete(false)
    setSelectedTimeSlot(null)
    setCustomerPhone('')
    setCustomerComments('')
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          booking 가능한 time대 - {format(selectedDate, 'yyyy년 MM월 dd일 (EEE)')}
        </CardTitle>
        <CardDescription>
          원하는 time대의 'Y'를 클릭하여 booking하세요. 숫자는 booking 가능한 자리 수입니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {timeSlots.map((slot) => (
            <Button
              key={slot.time}
              variant={slot.availableCount > 0 ? "outline" : "secondary"}
              className={`h-16 flex flex-col items-center justify-center ${
                slot.availableCount > 0 
                  ? 'bg-green-50 hover:bg-green-100 border-green-200 cursor-pointer' 
                  : 'bg-red-50 border-red-200 cursor-not-allowed'
              }`}
              disabled={slot.availableCount === 0}
              onClick={() => handleTimeSlotClick(slot)}
              data-testid={`timeslot-${slot.time}`}
            >
              <div className="text-xs font-medium">{slot.time}</div>
              <div className={`text-lg font-bold ${
                slot.availableCount > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {slot.availableCount > 0 ? 'Y' : 'N'}
              </div>
              <div className="text-xs">{slot.availableCount}</div>
            </Button>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 rounded border border-green-200"></div>
            <span>Y = booking 가능</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 rounded border border-red-200"></div>
            <span>N = booking 마감</span>
          </div>
        </div>
      </CardContent>

      {/* Booking Form Dialog */}
      <Dialog open={showBookingForm} onOpenChange={setShowBookingForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              booking information 입력
            </DialogTitle>
            <DialogDescription>
              {selectedTimeSlot && `${format(selectedDate, 'M월 d일')} ${selectedTimeSlot} booking`}
            </DialogDescription>
          </DialogHeader>
          
          {!bookingComplete ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">전화번호 *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="010-1234-5678"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  data-testid="input-customer-phone"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="comments">요청사항</Label>
                <Textarea
                  id="comments"
                  placeholder="특별한 요청사항이 있으시면 입력해주세요"
                  value={customerComments}
                  onChange={(e) => setCustomerComments(e.target.value)}
                  rows={3}
                  data-testid="textarea-customer-comments"
                />
              </div>
              
              <Button 
                onClick={handleBookingSubmit} 
                className="w-full"
                data-testid="button-complete-booking"
              >
                booking completed
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center py-4">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold text-green-600">booking이 completed되었습니다!</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {format(selectedDate, 'M월 d일')} {selectedTimeSlot}
                  </p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="bg-blue-50 p-3 rounded-lg mb-3">
                  <p className="text-sm text-blue-600 font-medium">
                    payment시 {discountRate}%의 할인이 적용됩니다
                  </p>
                </div>
                
                <Button 
                  onClick={handlePaymentClick}
                  className="w-full mb-2"
                  data-testid="button-proceed-payment"
                >
                  payment하기
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={resetBookingForm}
                  className="w-full"
                  data-testid="button-close-booking"
                >
                  닫기
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>payment</DialogTitle>
            <DialogDescription>
              {discountRate}% 할인이 적용된 payment를 진행합니다
            </DialogDescription>
          </DialogHeader>
          
          <PaymentCheckout 
            amount={50000} // Default service amount
            discountRate={discountRate}
            onSuccess={() => {
              setShowPayment(false)
              resetBookingForm()
              toast({
                title: "payment completed",
                description: "payment가 성공적으로 completed되었습니다!",
              })
            }}
            onCancel={() => setShowPayment(false)}
          />
        </DialogContent>
      </Dialog>
    </Card>
  )
}