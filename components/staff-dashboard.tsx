'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, User, Phone, AlertCircle, CheckCircle2, Star } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { useToast } from '../hooks/use-toast'

interface Booking {
  id: number
  booking_date: string
  time_slot: string
  status: string
  customer_id: number
  service_id: number
  price: number
  duration: number
  notes?: string
  source?: string
  customer?: {
    id: number
    name: string
    phone_number: string
    email: string
    total_visits: number
    vip_level: string
  }
  service?: {
    id: number
    name: string
    category: string
    description: string
  }
}

interface StaffUser {
  id: string
  firstName: string
  lastName: string
  position: string
  specialties: string[]
  experience_years: number
  rating: number
}

interface StaffDashboardProps {
  currentUser: StaffUser
}

export function StaffDashboard({ currentUser }: StaffDashboardProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [myBookings, setMyBookings] = useState<Booking[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchMyBookings()
  }, [selectedDate, currentUser.id])

  const fetchMyBookings = async () => {
    setLoading(true)
    try {
      const [bookingsRes, customersRes, servicesRes] = await Promise.all([
        fetch(`/api/bookings?date=${selectedDate}&staff_id=${currentUser.id}`),
        fetch('/api/customers'),
        fetch('/api/services')
      ])

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json()
        // Filter bookings assigned to this staff
        const myAssignedBookings = bookingsData.filter((b: any) => b.assigned_staff_id === currentUser.id)
        setMyBookings(myAssignedBookings)
      }

      if (customersRes.ok) {
        const customersData = await customersRes.json()
        setCustomers(customersData)
      }

      if (servicesRes.ok) {
        const servicesData = await servicesRes.json()
        setServices(servicesData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: "data loading 실패",
        description: "booking information를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getCustomerById = (id: number) => {
    return customers.find(c => c.id === id)
  }

  const getServiceById = (id: number) => {
    return services.find(s => s.id === id)
  }

  const updateBookingStatus = async (bookingId: number, status: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        toast({
          title: "status 업데이트 completed",
          description: `booking status가 ${getStatusLabel(status)}로 change되었습니다.`
        })
        fetchMyBookings()
      } else {
        throw new Error('Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        title: "status 업데이트 실패",
        description: "status change 중 오류가 발생했습니다.",
        variant: "destructive"
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200'
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      case 'no_show': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'booking 확정'
      case 'in_progress': return '시술 중'
      case 'completed': return 'completed'
      case 'cancelled': return 'cancelled'
      case 'no_show': return '노쇼'
      default: return 'pending'
    }
  }

  const getVipIcon = (vipLevel: string) => {
    switch (vipLevel) {
      case 'Gold': return '👑'
      case 'Silver': return '⭐'
      case 'Bronze': return '🥉'
      default: return ''
    }
  }

  const calculateDayEarnings = () => {
    return myBookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + b.price, 0)
  }

  return (
    <div className="space-y-6">
      {/* Staff Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">
                안녕하세요, {currentUser.firstName} {currentUser.lastName}님!
              </CardTitle>
              <CardDescription className="flex items-center gap-2 text-lg">
                <Badge variant="secondary">{currentUser.position}</Badge>
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  {currentUser.rating}점
                </span>
                <span>{currentUser.experience_years}년 경력</span>
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">오늘 매출</div>
              <div className="text-2xl font-bold text-purple-700">
                ${calculateDayEarnings()}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Date Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">내 booking 현황</h2>
        <div className="flex items-center gap-4">
          <label htmlFor="date" className="text-sm font-medium">날짜:</label>
          <input
            id="date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="p-2 border rounded-md"
          />
        </div>
      </div>

      {/* Daily Summary */}
      <Card>
        <CardHeader>
          <CardTitle>일일 요약 - {selectedDate}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{myBookings.length}</div>
              <div className="text-sm text-gray-600">총 booking</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {myBookings.filter(b => b.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {myBookings.filter(b => b.status === 'confirmed' || b.status === 'in_progress').length}
              </div>
              <div className="text-sm text-gray-600">pending/진행</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                ${calculateDayEarnings()}
              </div>
              <div className="text-sm text-gray-600">completed 매출</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* My Bookings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            내 booking 목록
          </CardTitle>
          <CardDescription>
            {loading ? 'loading 중...' : `${myBookings.length}개의 booking이 배정되었습니다`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p>booking information를 불러오는 중...</p>
            </div>
          ) : myBookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>select한 날짜에 배정된 booking이 없습니다.</p>
              <p className="text-sm">management자가 booking을 배정하면 여기에 표시됩니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myBookings.map((booking) => {
                const customer = getCustomerById(booking.customer_id)
                const service = getServiceById(booking.service_id)
                
                return (
                  <div
                    key={booking.id}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="flex items-center gap-2 text-lg font-medium min-w-[80px]">
                          <Clock className="h-4 w-4 text-purple-600" />
                          {booking.time_slot}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <div className="font-medium">{customer?.name || 'Unknown Customer'}</div>
                            {customer?.vip_level && customer.vip_level !== 'Regular' && (
                              <span className="text-sm">
                                {getVipIcon(customer.vip_level)} {customer.vip_level}
                              </span>
                            )}
                          </div>
                          
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {customer?.phone_number}
                            </div>
                            <div>
                              <strong>service:</strong> {service?.name} ({booking.duration}분)
                            </div>
                            <div>
                              <strong>가격:</strong> ${booking.price}
                            </div>
                            {booking.source && (
                              <div>
                                <strong>Source:</strong> {booking.source}
                              </div>
                            )}
                            {customer?.total_visits && (
                              <div>
                                <strong>방문 횟수:</strong> {customer.total_visits}회
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-3">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                          {getStatusLabel(booking.status)}
                        </div>
                        
                        <Select 
                          value={booking.status} 
                          onValueChange={(value) => updateBookingStatus(booking.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="confirmed">booking 확정</SelectItem>
                            <SelectItem value="in_progress">시술 중</SelectItem>
                            <SelectItem value="completed">completed</SelectItem>
                            <SelectItem value="no_show">노쇼</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Service details */}
                    {service?.description && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm">
                          <strong>service 상세:</strong> {service.description}
                        </div>
                      </div>
                    )}

                    {/* Completion notice */}
                    {booking.status === 'completed' && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 text-green-800 text-sm">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>
                            시술이 completed되었습니다. customer이 다음 booking을 할 때 전화번호만으로 간편하게 booking할 수 있습니다.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Specialties */}
      <Card>
        <CardHeader>
          <CardTitle>내 전문 분야</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {currentUser.specialties.map((specialty, index) => (
              <Badge key={index} variant="outline" className="text-purple-700 border-purple-300">
                {specialty}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}