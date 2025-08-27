'use client'

import { useState, useEffect } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, addDays, isWeekend } from 'date-fns'
import { ko } from 'date-fns/locale'
import { CalendarDays, Clock, User, Phone, Mail } from 'lucide-react'

interface Service {
  id: number
  name: string
  duration: number
  price: number
  description: string
}

interface Customer {
  id: number
  name: string
  phone_number: string
  email: string
  total_visits: number
  vip_level: string
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

interface Booking {
  id: number
  booking_date: string
  time_slot: string
  status: string
  customer_id: number
  service_id: number
  assigned_staff_id: string | null
  price: number
  duration: number
  notes: string
}

export function HomepageBookingCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('')
  const [selectedStaff, setSelectedEmployee] = useState<string>('')
  const [selectedService, setSelectedService] = useState<string>('')
  const [customerPhone, setCustomerPhone] = useState<string>('')
  const [customerName, setCustomerName] = useState<string>('')
  const [customerEmail, setCustomerEmail] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [showBookingDialog, setShowBookingDialog] = useState(false)
  const [isExistingCustomer, setIsExistingCustomer] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [nonWorkingDays, setNonWorkingDays] = useState<string[]>([])

  const { toast } = useToast()
  // const queryClient = useQueryClient()

  // 비근무일 데이터 가져오기
  useEffect(() => {
    const fetchNonWorkingDays = async () => {
      try {
        const response = await fetch('/api/non-working-days')
        if (response.ok) {
          const data = await response.json()
          const dateStrings = data.map((day: any) => day.date.split('T')[0]) // YYYY-MM-DD format
          setNonWorkingDays(dateStrings)
        }
      } catch (error) {
        console.error('비근무일 조회 실패:', error)
      }
    }

    fetchNonWorkingDays()
  }, [])

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
  ]

  // 실제 API 데이터 사용
  const [services, setServices] = useState<Service[]>([])
  const [employees, setEmployees] = useState<Staff[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  
  // API 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // 서비스 데이터 로드
        const servicesResponse = await fetch('/api/services')
        if (servicesResponse.ok) {
          const servicesData = await servicesResponse.json()
          setServices(servicesData.slice(0, 10)) // 주요 서비스만 표시
        }
        
        // 직원 데이터 로드  
        const staffResponse = await fetch(`/api/staff?date=${format(selectedDate, 'yyyy-MM-dd')}`)
        if (staffResponse.ok) {
          const staffData = await staffResponse.json()
          setEmployees(staffData)
        }
        
        // 예약 데이터 로드
        const bookingsResponse = await fetch(`/api/bookings?date=${format(selectedDate, 'yyyy-MM-dd')}`)
        if (bookingsResponse.ok) {
          const bookingsData = await bookingsResponse.json()
          setBookings(bookingsData)
        }
        
      } catch (error) {
        console.error('데이터 로드 실패:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [selectedDate])

  // 고객 검색 기능
  const searchCustomer = async (phone: string) => {
    try {
      const response = await fetch(`/api/customers?phone=${phone}`)
      if (response.ok) {
        const customers = await response.json()
        const customer = customers.find((c: any) => c.phone_number === phone)
        if (customer) {
          setSelectedCustomer(customer)
          setCustomerName(`${customer.first_name} ${customer.last_name}`)
          setCustomerEmail(customer.email || '')
          setIsExistingCustomer(true)
          toast({
            title: "기존 고객 발견",
            description: `${customer.first_name} ${customer.last_name} 고객의 정보를 불러왔습니다.`,
          })
        } else {
          setIsExistingCustomer(false)
          setSelectedCustomer(null)
          toast({
            title: "신규 고객",
            description: "새로운 고객 정보를 입력해주세요.",
          })
        }
      }
    } catch (error) {
      console.error('고객 검색 실패:', error)
      toast({
        title: "검색 실패",
        description: "고객 검색 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  const createBooking = async (bookingData: any) => {
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_phone: customerPhone,
          customer_last_name: customerName,
          service_ids: [selectedService],
          appointment_date: bookingData.booking_date,
          appointment_time: bookingData.time_slot,
          status: 'confirmed',
          notes: notes,
          created_by: 'Customer',
          booking_method: 'Homepage'
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        setShowBookingDialog(false)
        resetForm()
        
        // 예약 데이터 새로고침
        const bookingsResponse = await fetch(`/api/bookings?date=${format(selectedDate, 'yyyy-MM-dd')}`)
        if (bookingsResponse.ok) {
          const updatedBookings = await bookingsResponse.json()
          setBookings(updatedBookings)
        }
        
        toast({
          title: "예약 완료",
          description: "예약이 성공적으로 생성되었습니다.",
        })
      } else {
        const error = await response.json()
        toast({
          title: "예약 실패",
          description: error.error || "예약 생성 중 오류가 발생했습니다.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('예약 생성 실패:', error)
      toast({
        title: "예약 실패",
        description: "예약 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setSelectedTimeSlot('')
    setSelectedEmployee('')
    setSelectedService('')
    setCustomerPhone('')
    setCustomerName('')
    setCustomerEmail('')
    setNotes('')
    setIsExistingCustomer(false)
    setSelectedCustomer(null)
  }

  const handlePhoneSearch = () => {
    if (customerPhone.length >= 10) {
      searchCustomer(customerPhone)
    }
  }

  const handleCreateBooking = () => {
    if (!selectedTimeSlot || !selectedStaff || !selectedService || !customerPhone || !customerName) {
      toast({
        title: "입력 오류",
        description: "모든 필수 information를 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    const service = services.find((s: Service) => s.id.toString() === selectedService)
    
    createBooking({
      booking_date: format(selectedDate, 'yyyy-MM-dd'),
      time_slot: selectedTimeSlot,
      staff_id: selectedStaff,
      service_id: parseInt(selectedService),
      price: service?.price || 0,
      duration: service?.duration || 60,
      notes: notes,
      status: 'confirmed'
    })
  }

  const isTimeSlotAvailable = (timeSlot: string, staffId: string) => {
    return !bookings.some(
      booking => booking.time_slot === timeSlot && booking.assigned_staff_id === staffId
    )
  }

  const getAvailableStaff = (timeSlot: string) => {
    return employees.filter(staff => isTimeSlotAvailable(timeSlot, staff.id))
  }

  const getTimeSlotInfo = (timeSlot: string) => {
    const totalEmployees = employees.length
    const bookedEmployees = bookings.filter(booking => booking.time_slot === timeSlot).length
    const availableSlots = totalEmployees - bookedEmployees
    
    return {
      total: totalEmployees,
      booked: bookedEmployees,
      available: availableSlots,
      isFull: availableSlots === 0
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            네일 booking하기
          </CardTitle>
          <CardDescription>
            원하는 날짜와 time을 select하여 네일 service를 booking하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendar Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">날짜 select</h3>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date: Date | undefined) => date && setSelectedDate(date)}
                locale={ko}
                disabled={(date: Date) => {
                  // 과거 날짜 비활성화
                  if (date < new Date()) return true
                  
                  // 주말 비활성화 (토요일=6, 일요일=0)
                  if (isWeekend(date)) return true
                  
                  // 커스텀 비근무일 비활성화
                  const dateString = format(date, 'yyyy-MM-dd')
                  if (nonWorkingDays.includes(dateString)) return true
                  
                  return false
                }}
                className="rounded-md border"
              />
            </div>

            {/* Time Slots Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {format(selectedDate, 'MM월 dd일 (EEE)', { locale: ko })} time select
              </h3>
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
              <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                {timeSlots.map((time) => {
                  const timeSlotInfo = getTimeSlotInfo(time)
                  const availableEmployees = getAvailableStaff(time)
                  
                  // 주말 및 비근무일 처리
                  const isWeekendDay = isWeekend(selectedDate)
                  const dateString = format(selectedDate, 'yyyy-MM-dd')
                  const isNonWorkingDay = nonWorkingDays.includes(dateString)
                  const isDayDisabled = isWeekendDay || isNonWorkingDay
                  
                  const isAvailable = !timeSlotInfo.isFull && !isDayDisabled
                  
                  return (
                    <Dialog key={time} open={showBookingDialog && selectedTimeSlot === time} onOpenChange={setShowBookingDialog}>
                      <DialogTrigger asChild>
                        <Button
                          variant={selectedTimeSlot === time ? "default" : "outline"}
                          size="sm"
                          disabled={!isAvailable || isDayDisabled}
                          onClick={() => {
                            if (!isDayDisabled) {
                              setSelectedTimeSlot(time)
                              setShowBookingDialog(true)
                            }
                          }}
                          className={`justify-start relative ${
                            timeSlotInfo.isFull 
                              ? 'opacity-50 cursor-not-allowed' 
                              : timeSlotInfo.available <= 2 
                                ? 'border-orange-300 bg-orange-50 hover:bg-orange-100' 
                                : 'border-green-300 bg-green-50 hover:bg-green-100'
                          }`}
                        >
                          <div className="flex flex-col items-start w-full">
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {time}
                            </div>
                            <div className="text-xs">
                              {isDayDisabled ? (
                                <span className="text-red-600 font-medium">비근무일</span>
                              ) : timeSlotInfo.isFull ? (
                                <span className="text-red-600 font-medium">만석</span>
                              ) : (
                                <span className={timeSlotInfo.available <= 2 ? 'text-orange-600' : 'text-green-600'}>
                                  {timeSlotInfo.available}/{timeSlotInfo.total} 가능
                                </span>
                              )}
                            </div>
                          </div>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>booking하기</DialogTitle>
                          <DialogDescription>
                            {format(selectedDate, 'MM월 dd일 (EEE)', { locale: ko })} {time} booking
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          {/* Customer Phone */}
                          <div className="space-y-2">
                            <Label htmlFor="phone">전화번호</Label>
                            <div className="flex gap-2">
                              <Input
                                id="phone"
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                                placeholder="010-1234-5678"
                              />
                              <Button onClick={handlePhoneSearch} size="sm">
                                조회
                              </Button>
                            </div>
                          </div>

                          {/* Customer Name */}
                          <div className="space-y-2">
                            <Label htmlFor="name">이름</Label>
                            <Input
                              id="name"
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              placeholder="customer명"
                            />
                          </div>

                          {/* Customer Email */}
                          <div className="space-y-2">
                            <Label htmlFor="email">이메일 (select)</Label>
                            <Input
                              id="email"
                              type="email"
                              value={customerEmail}
                              onChange={(e) => setCustomerEmail(e.target.value)}
                              placeholder="email@example.com"
                            />
                          </div>

                          {/* Service Selection */}
                          <div className="space-y-2">
                            <Label>service select</Label>
                            <Select value={selectedService} onValueChange={setSelectedService}>
                              <SelectTrigger>
                                <SelectValue placeholder="service를 select하세요" />
                              </SelectTrigger>
                              <SelectContent>
                                {services.map((service) => (
                                  <SelectItem key={service.id} value={service.id.toString()}>
                                    {service.name} - {service.price.toLocaleString()}원 ({service.duration}분)
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Staff Selection */}
                          <div className="space-y-2">
                            <Label>담당자 select</Label>
                            <Select value={selectedStaff} onValueChange={setSelectedEmployee}>
                              <SelectTrigger>
                                <SelectValue placeholder="담당자를 select하세요" />
                              </SelectTrigger>
                              <SelectContent>
                                {getAvailableStaff(time).map((staff) => (
                                  <SelectItem key={staff.id} value={staff.id}>
                                    <div className="flex items-center justify-between w-full">
                                      <span>{staff.firstName} {staff.lastName}</span>
                                      <span className="text-xs text-gray-500">{staff.position}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {getAvailableStaff(time).length === 0 && (
                              <p className="text-xs text-red-600">이 time에는 이용 가능한 staff이 없습니다.</p>
                            )}
                          </div>

                          {/* Notes */}
                          <div className="space-y-2">
                            <Label htmlFor="notes">요청사항 (select)</Label>
                            <Textarea
                              id="notes"
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              placeholder="특별한 요청사항이 있으시면 적어주세요"
                              rows={3}
                            />
                          </div>

                          {/* Customer Info Display */}
                          {selectedCustomer && (
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <div className="flex items-center gap-2 text-blue-700">
                                <User className="h-4 w-4" />
                                <span className="font-medium">기존 customer</span>
                                <Badge variant="outline">{selectedCustomer.vip_level}</Badge>
                              </div>
                              <p className="text-sm text-blue-600 mt-1">
                                총 방문: {selectedCustomer.total_visits}회
                              </p>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button 
                              onClick={handleCreateBooking}
                              className="flex-1"
                            >
                              booking하기
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => setShowBookingDialog(false)}
                              className="flex-1"
                            >
                              cancelled
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )
                })}
              </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}