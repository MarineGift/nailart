'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { User, Phone, Search, Calendar, DollarSign, ArrowLeft, ChevronLeft, ChevronRight, Users, UserPlus } from 'lucide-react'
import { format } from 'date-fns'
import Image from 'next/image'

interface Customer {
  id: string
  firstName: string
  lastName: string
  phoneNumber: string
  email?: string
  totalSpent: number
  totalVisits: number
  vipLevel: string
  lastVisit: string | null
  createdAt: string
  city?: string
  state?: string
}

interface Treatment {
  id: string
  customer_id: string
  service_id: string
  service_name: string
  treatment_date: string
  grand_total_cents: number
  status: string
  notes?: string
}

interface Booking {
  id: string
  customer_id: string
  booking_date: string
  time_slot: string
  service_name: string
  status: string
  total_cents: number
  staff_name?: string
}

interface EnhancedCustomerManagementProps {
  onBack: () => void
}

export default function EnhancedCustomerManagement({ onBack }: EnhancedCustomerManagementProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showCustomerDetail, setShowCustomerDetail] = useState(false)
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  
  // Search states
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState<'phone' | 'lastName'>('phone')
  const [searchResults, setSearchResults] = useState<Customer[]>([])
  const [defaultCustomer, setDefaultCustomer] = useState<Customer | null>(null)
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null)
  
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchAllData()
  }, [])

  useEffect(() => {
    // Set default customer from today's bookings
    if (customers.length > 0 && bookings.length > 0) {
      const today = new Date().toISOString().split('T')[0]
      const todayBookings = bookings.filter(b => b.booking_date === today)
      
      if (todayBookings.length > 0) {
        const firstBookingCustomerId = todayBookings[0].customer_id
        const customer = enhancedCustomers.find(c => c.id === firstBookingCustomerId)
        if (customer) {
          setDefaultCustomer(customer)
        }
      } else if (enhancedCustomers.length > 0) {
        // If no bookings today, show first customer
        setDefaultCustomer(enhancedCustomers[0])
      }
    }
  }, [customers, bookings])

  const fetchAllData = async () => {
    setIsLoading(true)
    try {
      const [customersRes, treatmentsRes, bookingsRes] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/treatments'),
        fetch('/api/bookings')
      ])

      if (customersRes.ok) {
        const customersData = await customersRes.json()
        setCustomers(customersData)
      }

      if (treatmentsRes.ok) {
        const treatmentsData = await treatmentsRes.json()
        setTreatments(treatmentsData)
      }

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json()
        setBookings(bookingsData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate enhanced customer data
  const enhancedCustomers = customers.map(customer => {
    const customerTreatments = treatments.filter(t => t.customer_id === customer.id)
    const customerBookings = bookings.filter(b => b.customer_id === customer.id)
    
    const totalSpent = customerTreatments.reduce((sum, t) => sum + (t.grand_total_cents || 0), 0) / 100
    const totalVisits = customerTreatments.filter(t => t.status === 'completed').length
    
    const lastTreatment = customerTreatments
      .filter(t => t.status === 'completed')
      .sort((a, b) => new Date(b.treatment_date).getTime() - new Date(a.treatment_date).getTime())[0]
    
    const lastVisit = lastTreatment ? lastTreatment.treatment_date : null
    
    // VIP level calculation
    let vipLevel = 'Bronze'
    if (totalSpent >= 500) vipLevel = 'Platinum'
    else if (totalSpent >= 300) vipLevel = 'Gold'
    else if (totalSpent >= 150) vipLevel = 'Silver'

    return {
      ...customer,
      totalSpent,
      totalVisits,
      lastVisit,
      vipLevel,
      recentTreatments: customerTreatments.slice(0, 3)
    }
  })

  // Pagination logic
  const totalPages = Math.ceil(enhancedCustomers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedCustomers = enhancedCustomers.slice(startIndex, startIndex + itemsPerPage)

  // Search logic
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    const results = enhancedCustomers.filter(customer => {
      if (searchType === 'phone') {
        return customer.phoneNumber.includes(searchQuery)
      } else {
        return customer.lastName.toLowerCase().includes(searchQuery.toLowerCase())
      }
    })
    setSearchResults(results)
  }

  const handleCustomerClick = (customer: Customer & { recentTreatments?: Treatment[] }) => {
    setSelectedCustomer(customer)
    setShowCustomerDetail(true)
  }

  const getVipBadgeColor = (level: string) => {
    switch (level) {
      case 'Platinum': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'Gold': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Silver': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-orange-100 text-orange-800 border-orange-200'
    }
  }

  const CustomerDetailModal = () => {
    if (!selectedCustomer) return null

    const customerTreatments = treatments.filter(t => t.customer_id === selectedCustomer.id)
    const customerBookings = bookings.filter(b => b.customer_id === selectedCustomer.id)
    const totalAmount = customerTreatments.reduce((sum, t) => sum + (t.grand_total_cents || 0), 0) / 100

    return (
      <Dialog open={showCustomerDetail} onOpenChange={setShowCustomerDetail}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {selectedCustomer.firstName} {selectedCustomer.lastName} 상세 정보
            </DialogTitle>
            <DialogDescription>
              고객의 상세 정보, 예약 내역, 시술 내역을 확인할 수 있습니다
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Customer Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">기본 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-6">
                  {/* Profile Photo Placeholder */}
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center border-2 border-purple-200">
                    <User className="h-12 w-12 text-purple-600" />
                  </div>
                  
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div>
                      <p><span className="font-medium">이름:</span> {selectedCustomer.firstName} {selectedCustomer.lastName}</p>
                      <p><span className="font-medium">전화번호:</span> {selectedCustomer.phoneNumber}</p>
                      <p><span className="font-medium">이메일:</span> {selectedCustomer.email || '-'}</p>
                    </div>
                    <div>
                      <p><span className="font-medium">VIP 등급:</span> <Badge className={getVipBadgeColor(selectedCustomer.vipLevel)}>{selectedCustomer.vipLevel}</Badge></p>
                      <p><span className="font-medium">총 방문:</span> {selectedCustomer.totalVisits}회</p>
                      <p><span className="font-medium">총 결제 금액:</span> <span className="text-lg font-bold text-green-600">${totalAmount.toLocaleString()}</span></p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  예약 내역 ({customerBookings.length}개)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>날짜</TableHead>
                      <TableHead>시간</TableHead>
                      <TableHead>서비스</TableHead>
                      <TableHead>담당자</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>금액</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerBookings.slice(0, 5).map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>{format(new Date(booking.booking_date), 'yyyy-MM-dd')}</TableCell>
                        <TableCell>{booking.time_slot}</TableCell>
                        <TableCell>{booking.service_name}</TableCell>
                        <TableCell>{booking.staff_name || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={booking.status === 'completed' ? 'default' : 'secondary'}>
                            {booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell>${(booking.total_cents / 100).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {customerBookings.length > 5 && (
                  <p className="text-sm text-gray-500 mt-2">최근 5개만 표시됨 (총 {customerBookings.length}개)</p>
                )}
              </CardContent>
            </Card>

            {/* Treatment History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  시술 내역 ({customerTreatments.length}개)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>날짜</TableHead>
                      <TableHead>서비스</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>금액</TableHead>
                      <TableHead>메모</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerTreatments.slice(0, 10).map((treatment) => (
                      <TableRow key={treatment.id}>
                        <TableCell>{format(new Date(treatment.treatment_date), 'yyyy-MM-dd')}</TableCell>
                        <TableCell>{treatment.service_name}</TableCell>
                        <TableCell>
                          <Badge variant={treatment.status === 'completed' ? 'default' : 'secondary'}>
                            {treatment.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">${(treatment.grand_total_cents / 100).toLocaleString()}</TableCell>
                        <TableCell className="text-sm text-gray-600">{treatment.notes || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {customerTreatments.length > 10 && (
                  <p className="text-sm text-gray-500 mt-2">최근 10개만 표시됨 (총 {customerTreatments.length}개)</p>
                )}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          대시보드로 돌아가기
        </Button>
        
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <h1 className="text-2xl font-bold">고객 관리</h1>
        </div>
      </div>

      <Tabs defaultValue="all-customers" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all-customers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            전체 고객 리스트
          </TabsTrigger>
          <TabsTrigger value="individual" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            개인별 고객 관리
          </TabsTrigger>
        </TabsList>

        {/* All Customers Tab */}
        <TabsContent value="all-customers" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>전체 고객 목록 ({enhancedCustomers.length}명)</CardTitle>
                  <CardDescription>모든 고객의 방문 내역과 시술 정보를 확인하세요</CardDescription>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">페이지당:</span>
                  <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                    setItemsPerPage(Number(value))
                    setCurrentPage(1)
                  }}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-gray-500">로딩 중...</div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>고객명</TableHead>
                        <TableHead>전화번호</TableHead>
                        <TableHead>VIP 등급</TableHead>
                        <TableHead>총 방문</TableHead>
                        <TableHead>최근 방문</TableHead>
                        <TableHead>최근 시술</TableHead>
                        <TableHead>총 결제</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedCustomers.map((customer) => (
                        <TableRow 
                          key={customer.id}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleCustomerClick(customer)}
                        >
                          <TableCell className="font-medium">
                            {customer.firstName} {customer.lastName}
                          </TableCell>
                          <TableCell>{customer.phoneNumber}</TableCell>
                          <TableCell>
                            <Badge className={getVipBadgeColor(customer.vipLevel)}>
                              {customer.vipLevel}
                            </Badge>
                          </TableCell>
                          <TableCell>{customer.totalVisits}회</TableCell>
                          <TableCell>
                            {customer.lastVisit ? format(new Date(customer.lastVisit), 'yyyy-MM-dd') : '-'}
                          </TableCell>
                          <TableCell>
                            {customer.recentTreatments && customer.recentTreatments[0] ? 
                              customer.recentTreatments[0].service_name : '-'}
                          </TableCell>
                          <TableCell className="font-medium text-green-600">
                            ${customer.totalSpent.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-sm text-gray-600">
                        {startIndex + 1}-{Math.min(startIndex + itemsPerPage, enhancedCustomers.length)} / {enhancedCustomers.length}명
                      </p>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          이전
                        </Button>
                        
                        <span className="text-sm">
                          페이지 {currentPage} / {totalPages}
                        </span>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                        >
                          다음
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Individual Customer Tab */}
        <TabsContent value="individual" className="space-y-4">
          {/* Search Section */}
          <Card>
            <CardHeader>
              <CardTitle>개인 고객 검색</CardTitle>
              <CardDescription>전화번호나 성(Last Name)으로 고객을 검색하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Select value={searchType} onValueChange={(value) => setSearchType(value as 'phone' | 'lastName')}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        전화번호
                      </div>
                    </SelectItem>
                    <SelectItem value="lastName">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Last Name
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder={searchType === 'phone' ? "010-1234-5678" : "김, 이, 박..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />

                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4 mr-2" />
                  검색
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Customer Detail Layout */}
          {(defaultCustomer || searchResults.length > 0) && (
            <div className="grid lg:grid-cols-12 gap-6">
              {/* Left Side - Customer Photo and Basic Info */}
              <div className="lg:col-span-4">
                <Card className="sticky top-4">
                  <CardContent className="p-6">
                    {/* Customer Photo */}
                    <div className="text-center mb-6">
                      <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center border-4 border-purple-200 shadow-lg">
                        <User className="h-16 w-16 text-purple-600" />
                      </div>
                      
                      {(defaultCustomer || searchResults[0]) && (
                        <div className="mt-4">
                          <h2 className="text-2xl font-bold text-gray-900">
                            {(defaultCustomer || searchResults[0]).firstName} {(defaultCustomer || searchResults[0]).lastName}
                          </h2>
                          <Badge className={`mt-2 ${getVipBadgeColor((defaultCustomer || searchResults[0]).vipLevel)}`}>
                            {(defaultCustomer || searchResults[0]).vipLevel} Member
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Basic Customer Info */}
                    {(defaultCustomer || searchResults[0]) && (
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{(defaultCustomer || searchResults[0]).phoneNumber}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>총 방문: <span className="font-medium">{(defaultCustomer || searchResults[0]).totalVisits}회</span></span>
                        </div>
                        <div className="flex items-center gap-3">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span>총 결제: <span className="font-medium text-green-600">${(defaultCustomer || searchResults[0]).totalSpent.toLocaleString()}</span></span>
                        </div>
                        {(defaultCustomer || searchResults[0]).lastVisit && (
                          <div className="flex items-center gap-3">
                            <User className="h-4 w-4 text-gray-500" />
                            <span>최근 방문: <span className="font-medium">{format(new Date((defaultCustomer || searchResults[0]).lastVisit), 'yyyy-MM-dd')}</span></span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Selected Treatment Details */}
                    {selectedTreatment && (
                      <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <h3 className="font-semibold text-purple-800 mb-3">시술 상세 정보</h3>
                        <div className="space-y-2 text-sm">
                          <div><span className="font-medium">서비스:</span> {selectedTreatment.service_name}</div>
                          <div><span className="font-medium">날짜:</span> {format(new Date(selectedTreatment.treatment_date), 'yyyy-MM-dd')}</div>
                          <div><span className="font-medium">금액:</span> <span className="text-green-600 font-medium">${(selectedTreatment.grand_total_cents / 100).toLocaleString()}</span></div>
                          <div><span className="font-medium">상태:</span> 
                            <Badge variant={selectedTreatment.status === 'completed' ? 'default' : 'secondary'} className="ml-2">
                              {selectedTreatment.status}
                            </Badge>
                          </div>
                          {selectedTreatment.notes && (
                            <div><span className="font-medium">메모:</span> {selectedTreatment.notes}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Side - Customer History */}
              <div className="lg:col-span-8">
                <div className="space-y-6">
                  {/* Current Month Bookings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        금월 방문 내역
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {(defaultCustomer || searchResults[0]) && 
                         bookings
                           .filter(b => {
                             const currentCustomer = defaultCustomer || searchResults[0]
                             const bookingDate = new Date(b.booking_date)
                             const currentMonth = new Date().getMonth()
                             const currentYear = new Date().getFullYear()
                             return b.customer_id === currentCustomer.id && 
                                    bookingDate.getMonth() === currentMonth && 
                                    bookingDate.getFullYear() === currentYear
                           })
                           .map((booking) => (
                             <div 
                               key={booking.id} 
                               className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                               onClick={() => {
                                 const treatment = treatments.find(t => 
                                   t.customer_id === booking.customer_id && 
                                   new Date(t.treatment_date).toDateString() === new Date(booking.booking_date).toDateString()
                                 )
                                 if (treatment) setSelectedTreatment(treatment)
                               }}
                             >
                               <div className="flex justify-between items-center">
                                 <div>
                                   <span className="font-medium">{format(new Date(booking.booking_date), 'MM/dd')} {booking.time_slot}</span>
                                   <span className="text-gray-600 ml-2">{booking.service_name}</span>
                                 </div>
                                 <Badge variant={booking.status === 'completed' ? 'default' : 'secondary'}>
                                   {booking.status}
                                 </Badge>
                               </div>
                             </div>
                           ))}
                        {(defaultCustomer || searchResults[0]) && 
                         bookings.filter(b => {
                           const currentCustomer = defaultCustomer || searchResults[0]
                           const bookingDate = new Date(b.booking_date)
                           const currentMonth = new Date().getMonth()
                           const currentYear = new Date().getFullYear()
                           return b.customer_id === currentCustomer.id && 
                                  bookingDate.getMonth() === currentMonth && 
                                  bookingDate.getFullYear() === currentYear
                         }).length === 0 && (
                           <p className="text-gray-500 text-center py-4">금월 방문 내역이 없습니다.</p>
                         )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* All Treatment History */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        전체 시술 내역
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {(defaultCustomer || searchResults[0]) && 
                         treatments
                           .filter(t => t.customer_id === (defaultCustomer || searchResults[0]).id)
                           .sort((a, b) => new Date(b.treatment_date).getTime() - new Date(a.treatment_date).getTime())
                           .map((treatment) => (
                             <div 
                               key={treatment.id} 
                               className={`p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                                 selectedTreatment?.id === treatment.id ? 'ring-2 ring-purple-500 bg-purple-50' : ''
                               }`}
                               onClick={() => setSelectedTreatment(treatment)}
                             >
                               <div className="flex justify-between items-center">
                                 <div>
                                   <span className="font-medium">{format(new Date(treatment.treatment_date), 'yyyy-MM-dd')}</span>
                                   <span className="text-gray-600 ml-2">{treatment.service_name}</span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                   <span className="font-medium text-green-600">
                                     ${(treatment.grand_total_cents / 100).toLocaleString()}
                                   </span>
                                   <Badge variant={treatment.status === 'completed' ? 'default' : 'secondary'}>
                                     {treatment.status}
                                   </Badge>
                                 </div>
                               </div>
                               {treatment.notes && (
                                 <p className="text-sm text-gray-500 mt-1">{treatment.notes}</p>
                               )}
                             </div>
                           ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* Search Results (when searching) */}
          {searchQuery && searchResults.length === 0 && (
            <Card>
              <CardContent className="text-center py-8 text-gray-500">
                검색 결과가 없습니다.
              </CardContent>
            </Card>
          )}

          {!searchQuery && !defaultCustomer && !isLoading && (
            <Card>
              <CardContent className="text-center py-8 text-gray-500">
                고객 데이터를 불러오는 중...
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <CustomerDetailModal />
    </div>
  )
}