'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Calendar, User, Phone, CreditCard, AlertTriangle, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'

interface Customer {
  id: number
  name: string
  phone_number: string
  email?: string
  total_visits: number
  vip_level: 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
  address?: string
  last_visit?: string
  preferred_services?: string[]
}

interface Booking {
  id: number
  booking_date: string
  time_slot: string
  customer_id: number
  service_id: number
  assigned_staff_id: string | null
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'no_show'
  price: number
  duration: number
  notes: string
  service_name?: string
  customer_name?: string
  staff_name?: string
}

interface Payment {
  id: number
  booking_id: number
  customer_id: number
  amount: number
  tip_amount?: number
  payment_method: 'cash' | 'card'
  payment_status: 'completed' | 'pending' | 'failed'
  transaction_id: string
  payment_date: string
  notes: string
}

interface CustomerManagementSheetProps {
  onBack: () => void
}

export default function CustomerManagementSheet({ onBack }: CustomerManagementSheetProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [customers, setCustomers] = useState<Customer[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showCustomerDetail, setShowCustomerDetail] = useState(false)
  const [customerBookings, setCustomerBookings] = useState<Booking[]>([])
  const [customerPayments, setCustomerPayments] = useState<Payment[]>([])

  const dateStr = selectedDate.toISOString().split('T')[0]

  useEffect(() => {
    fetchData()
  }, [selectedDate])

  const fetchData = async () => {
    try {
      const [customersRes, bookingsRes] = await Promise.all([
        fetch('/api/customers'),
        fetch(`/api/bookings?date=${dateStr}`)
      ])

      let customersData: Customer[] = []
      let bookingsData: Booking[] = []

      if (customersRes.ok) {
        customersData = await customersRes.json()
      } else {
        // Mock data
        customersData = [
          { id: 1, name: 'Emma Johnson', phone_number: '010-1234-5678', email: 'emma@email.com', total_visits: 12, vip_level: 'Gold', address: '123 Main St, Seoul', last_visit: '2025-08-10', preferred_services: ['Gel Manicure', 'Nail Art'] },
          { id: 2, name: 'Sarah Kim', phone_number: '010-2345-6789', email: 'sarah@email.com', total_visits: 8, vip_level: 'Silver', address: '456 Oak Ave, Seoul', last_visit: '2025-08-05', preferred_services: ['Basic Manicure'] },
          { id: 3, name: 'Lisa Chen', phone_number: '010-3456-7890', email: 'lisa@email.com', total_visits: 5, vip_level: 'Bronze', address: '789 Pine St, Seoul', last_visit: '2025-07-28', preferred_services: ['Gel Manicure', 'Pedicure'] },
          { id: 4, name: 'Anna Smith', phone_number: '010-4567-8901', email: 'anna@email.com', total_visits: 15, vip_level: 'Platinum', address: '321 Elm Dr, Seoul', last_visit: '2025-08-12', preferred_services: ['Nail Art', 'Premium Care'] },
          { id: 5, name: 'Maria Garcia', phone_number: '010-5678-9012', email: 'maria@email.com', total_visits: 3, vip_level: 'Bronze', address: '654 Maple Ln, Seoul', last_visit: '2025-08-01', preferred_services: ['Basic Manicure'] }
        ]
      }

      if (bookingsRes.ok) {
        bookingsData = await bookingsRes.json()
      } else {
        // Mock bookings data
        bookingsData = [
          { id: 1, booking_date: dateStr, time_slot: '10:00', customer_id: 1, service_id: 1, assigned_staff_id: '1', status: 'completed', price: 45000, duration: 90, notes: 'Regular customer', service_name: 'Gel Manicure', customer_name: 'Emma Johnson', staff_name: 'Emily Choi' },
          { id: 2, booking_date: dateStr, time_slot: '11:30', customer_id: 2, service_id: 2, assigned_staff_id: '2', status: 'no_show', price: 55000, duration: 120, notes: '', service_name: 'Nail Art', customer_name: 'Sarah Kim', staff_name: 'Jessica Jung' },
          { id: 3, booking_date: dateStr, time_slot: '13:00', customer_id: 3, service_id: 1, assigned_staff_id: '3', status: 'completed', price: 45000, duration: 90, notes: 'First time customer', service_name: 'Gel Manicure', customer_name: 'Lisa Chen', staff_name: 'Grace Yoon' },
          { id: 4, booking_date: dateStr, time_slot: '14:30', customer_id: 4, service_id: 3, assigned_staff_id: '1', status: 'completed', price: 75000, duration: 150, notes: 'VIP customer', service_name: 'Premium Care', customer_name: 'Anna Smith', staff_name: 'Emily Choi' }
        ]
      }

      // Mock payment data
      const paymentsData: Payment[] = bookingsData
        .filter(booking => booking.status === 'completed')
        .map(booking => ({
          id: booking.id,
          booking_id: booking.id,
          customer_id: booking.customer_id,
          amount: booking.price,
          tip_amount: Math.floor(Math.random() * 10000) + 5000, // Random tip 5k-15k
          payment_method: Math.random() > 0.5 ? 'card' : 'cash' as 'card' | 'cash',
          payment_status: 'completed' as const,
          transaction_id: `TXN-${booking.id.toString().padStart(6, '0')}`,
          payment_date: booking.booking_date,
          notes: ''
        }))

      setCustomers(customersData)
      setBookings(bookingsData)
      setPayments(paymentsData)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleCustomerClick = (customer: Customer) => {
    setSelectedCustomer(customer)
    
    // Get customer's bookings and payments
    const customerBookingsData = bookings.filter(booking => booking.customer_id === customer.id)
    const customerPaymentsData = payments.filter(payment => payment.customer_id === customer.id)
    
    setCustomerBookings(customerBookingsData)
    setCustomerPayments(customerPaymentsData)
    setShowCustomerDetail(true)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      confirmed: { variant: 'default' as const, icon: <CheckCircle className="h-3 w-3" />, color: 'text-blue-600' },
      pending: { variant: 'secondary' as const, icon: <CheckCircle className="h-3 w-3" />, color: 'text-yellow-600' },
      completed: { variant: 'outline' as const, icon: <CheckCircle className="h-3 w-3" />, color: 'text-green-600' },
      cancelled: { variant: 'destructive' as const, icon: <XCircle className="h-3 w-3" />, color: 'text-red-600' },
      no_show: { variant: 'destructive' as const, icon: <AlertTriangle className="h-3 w-3" />, color: 'text-orange-600' }
    }
    
    const config = variants[status as keyof typeof variants] || variants.confirmed
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {status === 'no_show' ? 'No Show' : status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getVipBadgeColor = (level: string) => {
    switch (level) {
      case 'Platinum': return 'bg-purple-100 text-purple-800'
      case 'Gold': return 'bg-yellow-100 text-yellow-800'
      case 'Silver': return 'bg-gray-100 text-gray-800'
      default: return 'bg-orange-100 text-orange-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex items-center gap-2"
          data-testid="button-back-to-dashboard"
        >
          <ArrowLeft className="h-4 w-4" />
          대시보드로 돌아가기
        </Button>
        
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          <h1 className="text-2xl font-bold">customer management</h1>
        </div>
        
        <div className="ml-auto">
          <Input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="w-40"
            data-testid="input-customer-management-date"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {format(selectedDate, 'yyyy년 MM월 dd일')} customer 현황
          </CardTitle>
          <CardDescription>
            booking, 시술 내역, payment information, No Show 등을 confirmed하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>customer명</TableHead>
                <TableHead>전화번호</TableHead>
                <TableHead>VIP 등급</TableHead>
                <TableHead>booking time</TableHead>
                <TableHead>service</TableHead>
                <TableHead>담당자</TableHead>
                <TableHead>status</TableHead>
                <TableHead>payment 금액</TableHead>
                <TableHead>팁</TableHead>
                <TableHead>payment 방식</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => {
                const customer = customers.find(c => c.id === booking.customer_id)
                const payment = payments.find(p => p.booking_id === booking.id)
                
                if (!customer) return null

                return (
                  <TableRow 
                    key={booking.id} 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleCustomerClick(customer)}
                    data-testid={`customer-row-${booking.id}`}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span>{customer.name}</span>
                        <Badge className={`text-xs ${getVipBadgeColor(customer.vip_level)}`}>
                          {customer.vip_level}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{customer.phone_number}</TableCell>
                    <TableCell>{customer.vip_level}</TableCell>
                    <TableCell>{booking.time_slot}</TableCell>
                    <TableCell>{booking.service_name}</TableCell>
                    <TableCell>{booking.staff_name}</TableCell>
                    <TableCell>{getStatusBadge(booking.status)}</TableCell>
                    <TableCell>${booking.price ? booking.price.toLocaleString() : '0'}</TableCell>
                    <TableCell>
                      {payment?.tip_amount ? `$${payment.tip_amount.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell>
                      {payment && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <CreditCard className="h-3 w-3" />
                          {payment.payment_method === 'card' ? '카드' : '현금'}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          
          {bookings.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              select한 날짜에 booking 내역이 없습니다.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Detail Dialog */}
      <Dialog open={showCustomerDetail} onOpenChange={setShowCustomerDetail}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {selectedCustomer?.name} 상세 information
            </DialogTitle>
            <DialogDescription>
              customer의 booking 내역, payment information, 방문 기록을 confirmed합니다
            </DialogDescription>
          </DialogHeader>
          
          {selectedCustomer && (
            <div className="space-y-6">
              {/* Customer Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">customer information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p><span className="font-medium">이름:</span> {selectedCustomer.name}</p>
                      <p><span className="font-medium">전화번호:</span> {selectedCustomer.phone_number}</p>
                      <p><span className="font-medium">이메일:</span> {selectedCustomer.email || '-'}</p>
                    </div>
                    <div>
                      <p><span className="font-medium">VIP 등급:</span> <Badge className={getVipBadgeColor(selectedCustomer.vip_level)}>{selectedCustomer.vip_level}</Badge></p>
                      <p><span className="font-medium">총 방문:</span> {selectedCustomer.total_visits}회</p>
                      <p><span className="font-medium">마지막 방문:</span> {selectedCustomer.last_visit ? format(new Date(selectedCustomer.last_visit), 'yyyy-MM-dd') : '-'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Booking History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">booking 내역</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>날짜</TableHead>
                        <TableHead>time</TableHead>
                        <TableHead>service</TableHead>
                        <TableHead>담당자</TableHead>
                        <TableHead>status</TableHead>
                        <TableHead>금액</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customerBookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>{booking.booking_date}</TableCell>
                          <TableCell>{booking.time_slot}</TableCell>
                          <TableCell>{booking.service_name}</TableCell>
                          <TableCell>{booking.staff_name}</TableCell>
                          <TableCell>{getStatusBadge(booking.status)}</TableCell>
                          <TableCell>${booking.price ? booking.price.toLocaleString() : '0'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Payment History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">payment 내역</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>payment일</TableHead>
                        <TableHead>service 금액</TableHead>
                        <TableHead>팁</TableHead>
                        <TableHead>총액</TableHead>
                        <TableHead>payment 방식</TableHead>
                        <TableHead>거래 ID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customerPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{payment.payment_date}</TableCell>
                          <TableCell>${payment.amount.toLocaleString()}</TableCell>
                          <TableCell>${(payment.tip_amount || 0).toLocaleString()}</TableCell>
                          <TableCell className="font-medium">${(payment.amount + (payment.tip_amount || 0)).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="flex items-center gap-1">
                              <CreditCard className="h-3 w-3" />
                              {payment.payment_method === 'card' ? '카드' : '현금'}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{payment.transaction_id}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}