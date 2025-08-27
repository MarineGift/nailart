'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Calendar, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { enUS } from 'date-fns/locale'

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
  employeeAvailability: { [staffId: string]: boolean }
  hasAvailableSlot: boolean
}

interface CustomerAvailabilityGridProps {
  selectedDate: Date
  onTimeSlotSelect: (timeSlot: string) => void
}

export function CustomerAvailabilityGrid({ 
  selectedDate, 
  onTimeSlotSelect 
}: CustomerAvailabilityGridProps) {
  const [staff, setStaff] = useState<Staff[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlotAvailability[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('')
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
        // Mock data for staff availability - 실제 근무자 수에 따라 동적으로 create
        const workingStaffCount = 5 // 이 값은 실제 API에서 가져와야 함
        staffData = Array.from({ length: workingStaffCount }, (_, index) => ({
          id: `emp-${index + 1}`,
          firstName: String.fromCharCode(65 + index), // A, B, C, D, E...
          lastName: '',
          workingStartTime: '10:00',
          workingEndTime: '19:00',
          status: 'active'
        }))
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
        title: "Data Loading Error",
        description: "An error occurred while loading available time slots.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const generateAvailabilityGrid = (staffsList: Staff[], bookingsList: Booking[]) => {
    const slots: TimeSlotAvailability[] = []
    const startHour = 10
    const endHour = 19
    const intervalMinutes = 30

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += intervalMinutes) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        
        const employeeAvailability: { [staffId: string]: boolean } = {}
        let hasAvailableSlot = false

        // 각 staff별로 해당 time대 가능 여부 confirmed
        employeesList.forEach(staff => {
          const workStart = staff.workingStartTime || '10:00'
          const workEnd = staff.workingEndTime || '19:00'
          const currentTime = `${hour}:${minute.toString().padStart(2, '0')}`
          
          // 근무 time 내인지 confirmed
          const isWorkingHours = currentTime >= workStart && currentTime < workEnd && staff.status === 'active'
          
          // booking이 있는지 confirmed
          const hasBooking = bookingsList.some(booking => 
            booking.time_slot === timeString && 
            booking.assigned_staff_id === staff.id &&
            booking.status !== 'cancelled'
          )

          const isAvailable = isWorkingHours && !hasBooking
          employeeAvailability[staff.id] = isAvailable

          if (isAvailable) {
            hasAvailableSlot = true
          }
        })

        slots.push({
          time: timeString,
          employeeAvailability,
          hasAvailableSlot
        })
      }
    }

    setTimeSlots(slots)
  }

  const handleTimeSlotClick = (slot: TimeSlotAvailability) => {
    if (slot.hasAvailableSlot) {
      setSelectedTimeSlot(slot.time)
      onTimeSlotSelect(slot.time)
      toast({
        title: "Time Selected",
        description: `You have selected ${slot.time} time slot.`,
      })
    } else {
      toast({
        title: "Unavailable",
        description: "This time slot is fully booked.",
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
          Available Time Slots
        </CardTitle>
        <CardDescription>
          {format(selectedDate, 'MMMM dd, yyyy (EEE)', { locale: enUS })} - Y = Available Time Slots
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Desktop version: Table format */}
        <div className="hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-gray-300 bg-gray-50 p-2 text-sm font-medium text-gray-700">
                    Time
                  </th>
                  {staff.map((staff, index) => (
                    <th 
                      key={staff.id} 
                      className="border border-gray-300 bg-gray-50 p-2 text-sm font-medium text-gray-700 min-w-[60px]"
                    >
                      {staff.firstName || String.fromCharCode(65 + index)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((slot) => (
                  <tr key={slot.time} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-2 text-sm font-medium text-gray-900 bg-gray-50">
                      {slot.time}
                    </td>
                    {staff.map((staff) => {
                      const isAvailable = slot.employeeAvailability[staff.id]
                      return (
                        <td 
                          key={`${slot.time}-${staff.id}`}
                          className="border border-gray-300 p-1"
                        >
                          <div 
                            className={`
                              w-10 h-10 rounded flex items-center justify-center text-sm font-bold cursor-pointer transition-all
                              ${isAvailable 
                                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                : 'bg-red-100 text-red-700'
                              }
                              ${selectedTimeSlot === slot.time && isAvailable ? 'ring-2 ring-purple-500' : ''}
                            `}
                            onClick={() => isAvailable && handleTimeSlotClick(slot)}
                          >
                            {isAvailable ? 'Y' : 'N'}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile version: Scrollable card format */}
        <div className="md:hidden">
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {timeSlots
              .filter(slot => slot.hasAvailableSlot) // Show only available time slots on mobile
              .map((slot) => (
                <div 
                  key={slot.time}
                  className={`
                    p-3 border-2 rounded-lg cursor-pointer transition-all
                    ${selectedTimeSlot === slot.time 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-green-200 bg-green-50 hover:border-green-300'
                    }
                  `}
                  onClick={() => handleTimeSlotClick(slot)}
                  data-testid={`mobile-timeslot-${slot.time}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-700 font-bold text-sm">Y</span>
                      </div>
                      <span className="font-medium">{slot.time}</span>
                    </div>
                    <div className="flex gap-1">
                      {staff.map((staff) => {
                        const isAvailable = slot.employeeAvailability[staff.id]
                        return (
                          <div
                            key={staff.id}
                            className={`
                              w-6 h-6 rounded text-xs font-bold flex items-center justify-center
                              ${isAvailable ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}
                            `}
                          >
                            {isAvailable ? 'Y' : 'N'}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Selected time display */}
        {selectedTimeSlot && (
          <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="text-center">
              <p className="text-purple-700 font-medium">
                Selected Time: <span className="font-bold">{selectedTimeSlot}</span>
              </p>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 rounded border border-green-200"></div>
            <span>Y = Available</span>
          </div>
          <div className="flex items-center gap-2 md:block hidden">
            <div className="w-4 h-4 bg-red-100 rounded border border-red-200"></div>
            <span>N = Booked</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}