'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Calendar, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

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

interface TimeSlotAvailability {
  time: string
  availableCount: number
  totalEmployees: number
  employees: Staff[]
  isAvailable: boolean
}

interface AvailabilityTimeSlotGridProps {
  selectedDate: Date
  onTimeSlotSelect: (timeSlot: string) => void
  userRole?: 'customer' | 'staff' | 'admin'
}

export function AvailabilityTimeSlotGrid({ 
  selectedDate, 
  onTimeSlotSelect, 
  userRole = 'customer' 
}: AvailabilityTimeSlotGridProps) {
  const [staff, setStaff] = useState<Staff[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlotAvailability[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const dateStr = selectedDate.toISOString().split('T')[0]

  useEffect(() => {
    fetchAvailabilityData()
  }, [selectedDate])

  const fetchAvailabilityData = async () => {
    setLoading(true)
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
        // Mock data for staff availability
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
      generateAvailabilityGrid(staffData, bookingsData)
    } catch (error) {
      console.error('Error fetching availability data:', error)
      toast({
        title: "data loading 오류",
        description: "booking 가능 time을 불러오는 중 오류가 발생했습니다.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const generateAvailabilityGrid = (staffsList: Staff[], bookingsList: Booking[]) => {
    const slots: TimeSlotAvailability[] = []
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
        const isAvailable = availableCount > 0

        slots.push({
          time: timeString,
          availableCount,
          totalEmployees: availableEmployees.length,
          employees: availableEmployees,
          isAvailable
        })
      }
    }

    setTimeSlots(slots)
  }

  const handleTimeSlotClick = (slot: TimeSlotAvailability) => {
    if (slot.isAvailable) {
      onTimeSlotSelect(slot.time)
      toast({
        title: "time select completed",
        description: `${slot.time} time대를 select하셨습니다.`,
      })
    } else {
      toast({
        title: "booking 불가",
        description: "해당 time대는 booking이 가득찼습니다.",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          booking 가능한 time
        </CardTitle>
        <CardDescription>
          {format(selectedDate, 'yyyy년 MM월 dd일 (EEE)', { locale: ko })} - 원하는 time대를 select하세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {timeSlots.map((slot) => {
            // customer용: Y만 표시 (booking 가능한 경우만)
            if (userRole === 'customer' && !slot.isAvailable) {
              return null // N인 경우 아예 표시하지 않음
            }

            return (
              <Button
                key={slot.time}
                variant={slot.isAvailable ? "default" : "secondary"}
                className={`h-16 flex flex-col items-center justify-center ${
                  slot.isAvailable 
                    ? 'bg-green-50 hover:bg-green-100 border-green-200 text-green-700' 
                    : 'bg-red-50 border-red-200 text-red-700 cursor-not-allowed'
                }`}
                disabled={!slot.isAvailable}
                onClick={() => handleTimeSlotClick(slot)}
                data-testid={`timeslot-${slot.time}`}
              >
                <div className="text-xs font-medium">{slot.time}</div>
                <div className="text-lg font-bold">
                  {slot.isAvailable ? 'Y' : 'N'}
                </div>
                {/* management자와 staff는 add information 표시 */}
                {(userRole === 'admin' || userRole === 'staff') && (
                  <div className="text-xs">
                    {slot.availableCount}/{slot.totalEmployees}
                  </div>
                )}
              </Button>
            )
          })}
        </div>

        {/* customer용 안내 메시지 */}
        {userRole === 'customer' && (
          <div className="mt-4 text-center text-sm text-gray-600">
            <p>Y = booking 가능한 time대입니다</p>
          </div>
        )}

        {/* management자용 범례 */}
        {(userRole === 'admin' || userRole === 'staff') && (
          <div className="mt-6 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 rounded border border-green-200"></div>
              <span>Y = booking 가능</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 rounded border border-red-200"></div>
              <span>N = booking 마감</span>
            </div>
            <div className="text-xs text-gray-500">
              (숫자는 가능/전체 staff 수)
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}