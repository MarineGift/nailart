'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { CalendarIcon, TrendingUp, DollarSign, Clock, User, CreditCard, Star } from 'lucide-react'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'

interface StaffSaleRecord {
  id: string
  booking_time: string
  treatment_time: string
  treatment_details: string
  cost: number
  tip_included: boolean
  payment_method: string
  rebooking_date?: string
  satisfaction_rating: number
  notes: string
  customer_name: string
}

export function StaffPersonalSales() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [staffList, setStaffList] = useState<any[]>([])
  const [selectedStaff, setSelectedStaff] = useState<string>('')
  const [salesRecords, setSalesRecords] = useState<StaffSaleRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [searchPeriod, setSearchPeriod] = useState<'daily' | 'monthly' | 'range' | 'annual'>('daily')
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date>(new Date())
  const { toast } = useToast()

  // Sample data for demonstration
  const sampleSalesRecords: StaffSaleRecord[] = [
    {
      id: '1',
      booking_time: '2024-08-22 10:00',
      treatment_time: '90',
      treatment_details: 'Gel Manicure with Nail Art',
      cost: 75.00,
      tip_included: true,
      payment_method: 'Credit Card',
      rebooking_date: '2024-09-22',
      satisfaction_rating: 5,
      notes: 'Customer requested specific nail art design',
      customer_name: 'Sarah Johnson'
    },
    {
      id: '2',
      booking_time: '2024-08-22 14:30',
      treatment_time: '60',
      treatment_details: 'Classic Pedicure',
      cost: 45.00,
      tip_included: false,
      payment_method: 'Cash',
      satisfaction_rating: 4,
      notes: 'Regular customer, prefers light colors',
      customer_name: 'Emma Davis'
    },
    {
      id: '3',
      booking_time: '2024-08-22 16:00',
      treatment_time: '120',
      treatment_details: 'Acrylic Extensions with French Tips',
      cost: 95.00,
      tip_included: true,
      payment_method: 'Credit Card',
      rebooking_date: '2024-09-15',
      satisfaction_rating: 5,
      notes: 'New customer, very satisfied with service',
      customer_name: 'Lisa Chen'
    }
  ]

  const sampleStaffList = [
    { id: '1', name: 'Sarah Kim', role: 'Senior Nail Technician' },
    { id: '2', name: 'Emma Johnson', role: 'Manicurist' },
    { id: '3', name: 'Lisa Chen', role: 'Nail Artist' },
    { id: '4', name: 'Maria Garcia', role: 'Pedicurist' }
  ]

  useEffect(() => {
    setStaffList(sampleStaffList)
    setSelectedStaff('1')
    setSalesRecords(sampleSalesRecords)
  }, [])

  const fetchSalesData = async () => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setSalesRecords(sampleSalesRecords)
      setLoading(false)
    }, 1000)
  }

  const calculateTotalSales = () => {
    return salesRecords.reduce((total, record) => total + record.cost, 0)
  }

  const calculateAverageRating = () => {
    if (salesRecords.length === 0) return 0
    return salesRecords.reduce((sum, record) => sum + record.satisfaction_rating, 0) / salesRecords.length
  }

  const getPaymentMethodColor = (method: string) => {
    switch (method.toLowerCase()) {
      case 'cash':
        return 'bg-green-100 text-green-800'
      case 'credit card':
        return 'bg-blue-100 text-blue-800'
      case 'debit card':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Staff Selection and Date Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Personal Sales Analysis
          </CardTitle>
          <CardDescription>
            Daily/monthly/period sales and customer service history analysis by staff member
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Staff Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Select Staff</label>
              <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Staff" />
                </SelectTrigger>
                <SelectContent>
                  {staffList.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.name} - {staff.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search Period */}
            <div>
              <label className="text-sm font-medium mb-2 block">Search Period</label>
              <Select value={searchPeriod} onValueChange={(value: 'daily' | 'monthly' | 'range' | 'annual') => setSearchPeriod(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="range">Date Range</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                {searchPeriod === 'daily' ? 'Select Date' : 'Start Date'}
              </label>
              <Input
                type="date"
                value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
                onChange={(e) => e.target.value && setSelectedDate(new Date(e.target.value))}
              />
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <Button onClick={fetchSalesData} className="w-full">
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold">${calculateTotalSales().toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <User className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Customers Served</p>
                <p className="text-2xl font-bold">{salesRecords.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Clock className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Average Treatment Time</p>
                <p className="text-2xl font-bold">
                  {salesRecords.length > 0 
                    ? Math.round(salesRecords.reduce((sum, r) => sum + parseInt(r.treatment_time), 0) / salesRecords.length)
                    : 0} min
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Star className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Average Satisfaction</p>
                <p className="text-2xl font-bold">{calculateAverageRating().toFixed(1)}/5</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Service History</CardTitle>
          <CardDescription>
            Detailed service records for the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Booking Time</TableHead>
                    <TableHead>Treatment Time</TableHead>
                    <TableHead>Treatment Details</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>TIP</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Rebooking</TableHead>
                    <TableHead>Satisfaction</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.customer_name}</TableCell>
                      <TableCell>{format(new Date(record.booking_time), 'MM/dd HH:mm')}</TableCell>
                      <TableCell>{record.treatment_time} min</TableCell>
                      <TableCell className="max-w-xs truncate">{record.treatment_details}</TableCell>
                      <TableCell className="font-medium">${record.cost.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={record.tip_included ? "default" : "secondary"}>
                          {record.tip_included ? 'Included' : 'Not Included'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPaymentMethodColor(record.payment_method)}>
                          {record.payment_method}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {record.rebooking_date ? format(new Date(record.rebooking_date), 'MM/dd') : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          {record.satisfaction_rating}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{record.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}