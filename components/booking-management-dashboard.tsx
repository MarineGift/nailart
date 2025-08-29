'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, User, Phone, Edit, CheckCircle2, AlertCircle, DollarSign, Filter, Users, Search } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
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
  assigned_staff_id?: string | null
  created_at: string
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

interface Staff {
  id: string
  name: string
  position: string
  available: boolean
  specialties: string[]
  rating: number
}

interface BookingManagementDashboardProps {
  currentUser: any
}

export function BookingManagementDashboard({ currentUser }: BookingManagementDashboardProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('all')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Mock employees data
  const mockStaff: Staff[] = [
    { id: '1', name: '김미영', position: 'Senior Nail Technician', available: true, specialties: ['Gel Polish', 'Nail Art'], rating: 4.9 },
    { id: '2', name: '박지은', position: 'Nail Technician', available: true, specialties: ['Classic Manicure', 'Nail Care'], rating: 4.7 },
    { id: '3', name: '이수진', position: 'Nail Artist', available: true, specialties: ['Nail Art', 'Premium Design'], rating: 4.8 },
    { id: '4', name: '최영희', position: 'Senior Technician', available: false, specialties: ['Gel Polish', 'French Manicure'], rating: 4.6 },
    { id: '5', name: '정현주', position: 'Nail Specialist', available: true, specialties: ['Nail Care', 'Hand Treatment'], rating: 4.5 }
  ]

  useEffect(() => {
    setStaff(mockStaff)
    fetchBookingsData()
  }, [selectedDate])

  const fetchBookingsData = async () => {
    setLoading(true)
    try {
      const [bookingsRes, customersRes, servicesRes] = await Promise.all([
        fetch(`/api/bookings?date=${selectedDate}`),
        fetch('/api/customers'),
        fetch('/api/services')
      ])

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json()
        setBookings(bookingsData)
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
      console.error('Error fetching bookings data:', error)
      toast({
        title: "data loading 실패",
        description: "booking information를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const assignStaffToBooking = async (bookingId: number, staffId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staff_id: staffId })
      })

      if (response.ok) {
        toast({
          title: "staff 배정 completed",
          description: "booking에 staff이 성공적으로 배정되었습니다."
        })
        fetchBookingsData()
      } else {
        throw new Error('Failed to assign staff')
      }
    } catch (error) {
      console.error('Error assigning staff:', error)
      toast({
        title: "staff 배정 실패",
        description: "staff 배정 중 오류가 발생했습니다.",
        variant: "destructive"
      })
    }
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
        fetchBookingsData()
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

  const getCustomerById = (id: number) => {
    return customers.find(c => c.id === id)
  }

  const getServiceById = (id: number) => {
    return services.find(s => s.id === id)
  }

  const getEmployeeById = (id: string) => {
    return staff.find(e => e.id === id)
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

  const filteredBookings = bookings.filter(booking => {
    const customer = getCustomerById(booking.customer_id)
    const service = getServiceById(booking.service_id)
    
    // Status filter
    if (selectedStatusFilter !== 'all' && booking.status !== selectedStatusFilter) {
      return false
    }
    
    // Time filter
    if (selectedTimeFilter !== 'all') {
      const hour = parseInt(booking.time_slot.split(':')[0])
      if (selectedTimeFilter === 'morning' && (hour < 9 || hour >= 12)) return false
      if (selectedTimeFilter === 'afternoon' && (hour < 12 || hour >= 17)) return false
      if (selectedTimeFilter === 'evening' && hour < 17) return false
    }
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const customerName = customer?.name?.toLowerCase() || ''
      const customerPhone = customer?.phone_number || ''
      const serviceName = service?.name?.toLowerCase() || ''
      
      return customerName.includes(searchLower) || 
             customerPhone.includes(searchTerm) || 
             serviceName.includes(searchLower)
    }
    
    return true
  })

  const calculateDayStats = () => {
    const total = filteredBookings.length
    const completed = filteredBookings.filter(b => b.status === 'completed').length
    const revenue = filteredBookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.price, 0)
    const assigned = filteredBookings.filter(b => b.assigned_staff_id).length
    
    return { total, completed, revenue, assigned }
  }

  const stats = calculateDayStats()

  return (
    <div className="space-y-6">
      {/* Date and Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            booking management 대시보드
          </CardTitle>
          <CardDescription>
            일일 booking 현황을 confirmed하고 staff을 배정하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium mb-2">날짜</label>
              <input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="time-filter" className="block text-sm font-medium mb-2">time대</label>
              <Select value={selectedTimeFilter} onValueChange={setSelectedTimeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="morning">오전 (9-12시)</SelectItem>
                  <SelectItem value="afternoon">오후 (12-17시)</SelectItem>
                  <SelectItem value="evening">저녁 (17시 이후)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium mb-2">status</label>
              <Select value={selectedStatusFilter} onValueChange={setSelectedStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="confirmed">booking 확정</SelectItem>
                  <SelectItem value="in_progress">시술 중</SelectItem>
                  <SelectItem value="completed">completed</SelectItem>
                  <SelectItem value="cancelled">cancelled</SelectItem>
                  <SelectItem value="no_show">노쇼</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label htmlFor="search" className="block text-sm font-medium mb-2">검색</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="customer명, 전화번호, service"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-end">
              <Button onClick={fetchBookingsData} className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                새로고침
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">총 booking</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">매출</p>
                <p className="text-2xl font-bold text-purple-600">${stats.revenue}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">staff 배정</p>
                <p className="text-2xl font-bold text-orange-600">{stats.assigned}/{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings List */}
      <Card>
        <CardHeader>
          <CardTitle>{selectedDate} booking 목록</CardTitle>
          <CardDescription>
            {loading ? 'loading 중...' : `${filteredBookings.length}개의 booking이 있습니다`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p>booking information를 불러오는 중...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>select한 조건에 맞는 booking이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => {
                const customer = getCustomerById(booking.customer_id)
                const service = getServiceById(booking.service_id)
                const assignedStaff = booking.assigned_staff_id ? getEmployeeById(booking.assigned_staff_id) : null
                
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
                      
                      <div className="flex flex-col items-end gap-3 min-w-[200px]">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                          {getStatusLabel(booking.status)}
                        </div>
                        
                        {/* Staff Assignment */}
                        <div className="w-full">
                          <label className="text-xs text-gray-600 block mb-1">담당 staff</label>
                          <Select 
                            value={booking.assigned_staff_id || ''} 
                            onValueChange={(value) => assignStaffToBooking(booking.id, value)}
                          >
                            <SelectTrigger className="w-full text-xs">
                              <SelectValue placeholder="staff select" />
                            </SelectTrigger>
                            <SelectContent>
                              {staff.filter(emp => emp.available).map((staff) => (
                                <SelectItem key={staff.id} value={staff.id}>
                                  {staff.name} ({staff.position})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {assignedStaff && (
                            <div className="text-xs text-green-600 mt-1">
                              ✓ {assignedStaff.name} 배정됨
                            </div>
                          )}
                        </div>
                        
                        {/* Status Update */}
                        <div className="w-full">
                          <label className="text-xs text-gray-600 block mb-1">status change</label>
                          <Select 
                            value={booking.status} 
                            onValueChange={(value) => updateBookingStatus(booking.id, value)}
                          >
                            <SelectTrigger className="w-full text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="confirmed">booking 확정</SelectItem>
                              <SelectItem value="in_progress">시술 중</SelectItem>
                              <SelectItem value="completed">completed</SelectItem>
                              <SelectItem value="cancelled">cancelled</SelectItem>
                              <SelectItem value="no_show">노쇼</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
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

                    {/* Assignment notification */}
                    {assignedStaff && booking.status === 'confirmed' && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-800 text-sm">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>
                            {assignedStaff.name}님이 담당으로 배정되었습니다. 
                            staff 대시보드에서 해당 booking을 confirmed할 수 있습니다.
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
    </div>
  )
}