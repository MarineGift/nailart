'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CreditCard, Calendar, TrendingUp, DollarSign, Filter, Receipt } from 'lucide-react'
import { format } from 'date-fns'

interface PaymentRecord {
  id: number
  booking_id: number
  customer_id: number
  customer_name: string
  amount: number
  payment_method: string
  payment_status: string
  transaction_id: string
  payment_date: string
  notes: string
}

interface ServiceRecord {
  id: number
  booking_id: number
  customer_id: number
  customer_name: string
  staff_id: string
  staff_name: string
  service_id: number
  service_name: string
  actual_duration: number
  actual_price: number
  service_notes: string
  customer_satisfaction: number
  service_date: string
  status: string
}

export function AdminPaymentAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('today')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [serviceFilter, setServiceFilter] = useState('all')

  // Mock payment data with comprehensive details
  const mockPayments: PaymentRecord[] = [
    { id: 1, booking_id: 1, customer_id: 1, customer_name: 'Emma Johnson', amount: 35000, payment_method: 'Card', payment_status: 'completed', transaction_id: 'TXN-000001', payment_date: '2025-08-17', notes: '' },
    { id: 2, booking_id: 2, customer_id: 2, customer_name: 'Sarah Kim', amount: 45000, payment_method: 'Cash', payment_status: 'completed', transaction_id: 'TXN-000002', payment_date: '2025-08-17', notes: '' },
    { id: 3, booking_id: 3, customer_id: 3, customer_name: 'Lisa Chen', amount: 35000, payment_method: 'Card', payment_status: 'pending', transaction_id: 'TXN-000003', payment_date: '2025-08-17', notes: 'Processing...' },
    { id: 4, booking_id: 8, customer_id: 1, customer_name: 'Emma Johnson', amount: 35000, payment_method: 'Card', payment_status: 'completed', transaction_id: 'TXN-000008', payment_date: '2025-08-16', notes: '' },
    { id: 5, booking_id: 9, customer_id: 2, customer_name: 'Sarah Kim', amount: 45000, payment_method: 'Cash', payment_status: 'completed', transaction_id: 'TXN-000009', payment_date: '2025-08-15', notes: '' },
    { id: 6, booking_id: 10, customer_id: 3, customer_name: 'Lisa Chen', amount: 55000, payment_method: 'Card', payment_status: 'completed', transaction_id: 'TXN-000010', payment_date: '2025-08-14', notes: 'Premium service' },
  ]

  // Mock service records with detailed staff performance
  const mockServiceRecords: ServiceRecord[] = [
    { id: 1, booking_id: 1, customer_id: 1, customer_name: 'Emma Johnson', staff_id: '1', staff_name: '김미영', service_id: 1, service_name: 'Basic Manicure', actual_duration: 65, actual_price: 35000, service_notes: 'Customer requested French style', customer_satisfaction: 5, service_date: '2025-08-17', status: 'completed' },
    { id: 2, booking_id: 2, customer_id: 2, customer_name: 'Sarah Kim', staff_id: '2', staff_name: '박지은', service_id: 2, service_name: 'Gel Manicure', actual_duration: 85, actual_price: 45000, service_notes: 'Applied UV protection coating', customer_satisfaction: 4, service_date: '2025-08-17', status: 'completed' },
    { id: 3, booking_id: 8, customer_id: 1, customer_name: 'Emma Johnson', staff_id: '1', staff_name: '김미영', service_id: 1, service_name: 'Basic Manicure', actual_duration: 60, actual_price: 35000, service_notes: 'Regular maintenance', customer_satisfaction: 5, service_date: '2025-08-16', status: 'completed' },
    { id: 4, booking_id: 9, customer_id: 2, customer_name: 'Sarah Kim', staff_id: '2', staff_name: '박지은', service_id: 2, service_name: 'Gel Manicure', actual_duration: 90, actual_price: 45000, service_notes: 'Summer collection design', customer_satisfaction: 4, service_date: '2025-08-15', status: 'completed' },
    { id: 5, booking_id: 10, customer_id: 3, customer_name: 'Lisa Chen', staff_id: '3', staff_name: '이수진', service_id: 3, service_name: 'Nail Art', actual_duration: 115, actual_price: 55000, service_notes: 'Complex floral pattern design', customer_satisfaction: 5, service_date: '2025-08-14', status: 'completed' },
  ]

  const today = new Date()
  const todayStr = format(today, 'yyyy-MM-dd')

  const getFilteredPayments = () => {
    let filtered = mockPayments

    if (selectedPeriod === 'today') {
      filtered = filtered.filter(p => p.payment_date === todayStr)
    } else if (selectedPeriod === 'week') {
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      filtered = filtered.filter(p => new Date(p.payment_date) >= weekAgo)
    } else if (selectedPeriod === 'month') {
      filtered = filtered.filter(p => {
        const paymentDate = new Date(p.payment_date)
        return paymentDate.getMonth() === today.getMonth() && paymentDate.getFullYear() === today.getFullYear()
      })
    }

    if (paymentFilter !== 'all') {
      filtered = filtered.filter(p => p.payment_status === paymentFilter)
    }

    return filtered
  }

  const getFilteredServiceRecords = () => {
    let filtered = mockServiceRecords

    if (selectedPeriod === 'today') {
      filtered = filtered.filter(s => s.service_date === todayStr)
    } else if (selectedPeriod === 'week') {
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      filtered = filtered.filter(s => new Date(s.service_date) >= weekAgo)
    } else if (selectedPeriod === 'month') {
      filtered = filtered.filter(s => {
        const serviceDate = new Date(s.service_date)
        return serviceDate.getMonth() === today.getMonth() && serviceDate.getFullYear() === today.getFullYear()
      })
    }

    if (serviceFilter !== 'all') {
      filtered = filtered.filter(s => s.staff_id === serviceFilter)
    }

    return filtered
  }

  const filteredPayments = getFilteredPayments()
  const filteredServiceRecords = getFilteredServiceRecords()

  const totalRevenue = filteredPayments.reduce((sum, p) => sum + p.amount, 0)
  const completedPayments = filteredPayments.filter(p => p.payment_status === 'completed')
  const pendingPayments = filteredPayments.filter(p => p.payment_status === 'pending')

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getSatisfactionBadge = (rating: number) => {
    if (rating >= 5) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
    if (rating >= 4) return <Badge className="bg-blue-100 text-blue-800">Good</Badge>
    if (rating >= 3) return <Badge className="bg-yellow-100 text-yellow-800">Average</Badge>
    return <Badge className="bg-red-100 text-red-800">Poor</Badge>
  }

  // Staff performance statistics
  const employeeStats = mockServiceRecords.reduce((acc, record) => {
    if (!acc[record.staff_id]) {
      acc[record.staff_id] = {
        name: record.staff_name,
        totalServices: 0,
        totalRevenue: 0,
        totalCustomers: new Set(),
        averageRating: 0,
        totalHours: 0
      }
    }
    
    acc[record.staff_id].totalServices++
    acc[record.staff_id].totalRevenue += record.actual_price
    acc[record.staff_id].totalCustomers.add(record.customer_id)
    acc[record.staff_id].averageRating += record.customer_satisfaction
    acc[record.staff_id].totalHours += record.actual_duration / 60

    return acc
  }, {} as any)

  // Calculate averages
  Object.keys(employeeStats).forEach(staffId => {
    const stats = employeeStats[staffId]
    stats.averageRating = (stats.averageRating / stats.totalServices).toFixed(1)
    stats.totalCustomers = stats.totalCustomers.size
    stats.totalHours = stats.totalHours.toFixed(1)
  })

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>

        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Payment Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={serviceFilter} onValueChange={setServiceFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Employee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Employees</SelectItem>
            <SelectItem value="1">김미영</SelectItem>
            <SelectItem value="2">박지은</SelectItem>
            <SelectItem value="3">이수진</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payment Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {completedPayments.length} completed payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Payments</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedPayments.length}</div>
            <p className="text-xs text-muted-foreground">
              ${completedPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayments.length}</div>
            <p className="text-xs text-muted-foreground">
              ${pendingPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Services Completed</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredServiceRecords.length}</div>
            <p className="text-xs text-muted-foreground">
              Avg rating: {(filteredServiceRecords.reduce((sum, s) => sum + s.customer_satisfaction, 0) / filteredServiceRecords.length || 0).toFixed(1)}⭐
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Records Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Records
            </CardTitle>
            <CardDescription>
              Detailed payment history and transaction records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.customer_name}</TableCell>
                    <TableCell>${payment.amount.toLocaleString()}</TableCell>
                    <TableCell>{payment.payment_method}</TableCell>
                    <TableCell>{getPaymentStatusBadge(payment.payment_status)}</TableCell>
                    <TableCell>{format(new Date(payment.payment_date), 'MMM dd')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Service Records Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Service Records
            </CardTitle>
            <CardDescription>
              Completed services with customer satisfaction ratings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServiceRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.customer_name}</TableCell>
                    <TableCell>{record.staff_name}</TableCell>
                    <TableCell>{record.service_name}</TableCell>
                    <TableCell>{getSatisfactionBadge(record.customer_satisfaction)}</TableCell>
                    <TableCell>${record.actual_price.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Staff Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Staff Performance Summary
          </CardTitle>
          <CardDescription>
            Detailed performance metrics by staff with customer service data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Services</TableHead>
                <TableHead>Customers</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Avg Rating</TableHead>
                <TableHead>Efficiency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(employeeStats).map(([staffId, stats]: [string, any]) => (
                <TableRow key={staffId}>
                  <TableCell className="font-medium">{stats.name}</TableCell>
                  <TableCell>{stats.totalServices}</TableCell>
                  <TableCell>{stats.totalCustomers}</TableCell>
                  <TableCell>${stats.totalRevenue.toLocaleString()}</TableCell>
                  <TableCell>{stats.totalHours}h</TableCell>
                  <TableCell className="flex items-center gap-1">
                    {stats.averageRating}⭐
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-blue-100 text-blue-800">
                      ${Math.round(stats.totalRevenue / parseFloat(stats.totalHours)).toLocaleString()}/h
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper imports fix
import { CheckCircle, Clock, Star } from 'lucide-react'