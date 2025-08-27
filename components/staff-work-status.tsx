'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, DollarSign, Clock, User, FileText, CreditCard, Banknote } from 'lucide-react'

interface Staff {
  id: string
  firstName: string
  lastName: string
  position: string
  workingStartTime?: string
  workingEndTime?: string
  role?: string
}

interface Treatment {
  id: number
  bookingId: number
  customerId: number
  staffId: string
  serviceDate: string
  actualPrice: number
  tipAmount: number
  tipCardAmount?: number
  tipCashAmount?: number
  finalAmount: number
  treatmentStatus: 'completed' | 'cancelled' | 'no_show'
  serviceNotes?: string
  paymentMethod?: 'cash' | 'card' | 'mixed'
  tipPaymentMethod?: 'cash' | 'card' | 'mixed'
  customer?: {
    first_name: string
    last_name: string
    phone: string
  }
  service?: {
    name: string
    duration: number
  }
  time_slot?: string
}

interface StaffWorkData {
  staff: Employee
  treatments: Treatment[]
  totalRevenue: number
  totalTips: number
  completedTreatments: number
}

export function StaffWorkStatus() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [workingStaff, setWorkingEmployees] = useState<Staff[]>([])
  const [staffWorkData, setStaffWorkData] = useState<StaffWorkData[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchWorkStatusData()
  }, [selectedDate])

  const fetchWorkStatusData = async () => {
    try {
      setLoading(true)
      const formattedDate = format(selectedDate, 'yyyy-MM-dd')
      
      // Fetch working employees for selected date
      const staffRes = await fetch(`/api/staff?date=${formattedDate}`)
      const staffData = staffRes.ok ? await staffRes.json() : []
      setWorkingEmployees(staffData)

      // Fetch all employees (not just working ones)
      const allEmployeesRes = await fetch('/api/staff')
      const allEmployeesData = allEmployeesRes.ok ? await allEmployeesRes.json() : []
      
      // Sort employees by role: manager > staff > admin
      const roleOrder = { 'manager': 1, 'staff': 2, 'admin': 3 }
      const sortedEmployees = allEmployeesData.sort((a: Employee, b: Employee) => {
        const aRole = a.role || a.position.toLowerCase()
        const bRole = b.role || b.position.toLowerCase()
        const aOrder = roleOrder[aRole as keyof typeof roleOrder] || 4
        const bOrder = roleOrder[bRole as keyof typeof roleOrder] || 4
        return aOrder - bOrder
      })

      // Fetch treatments for each staff
      const workData: StaffWorkData[] = []
      
      for (const staff of sortedEmployees) {
        const treatmentsRes = await fetch(`/api/treatments?date=${formattedDate}&staffId=${staff.id}`)
        const treatments = treatmentsRes.ok ? await treatmentsRes.json() : []
        
        // Calculate enhanced tip amounts
        const enhancedTreatments = treatments.map((t: Treatment) => {
          const tipCard = t.tipPaymentMethod === 'card' ? t.tipAmount : (t.tipPaymentMethod === 'mixed' ? (t.tipCardAmount || t.tipAmount * 0.5) : 0)
          const tipCash = t.tipPaymentMethod === 'cash' ? t.tipAmount : (t.tipPaymentMethod === 'mixed' ? (t.tipCashAmount || t.tipAmount * 0.5) : 0)
          
          return {
            ...t,
            tipCardAmount: tipCard,
            tipCashAmount: tipCash
          }
        })
        
        const totalRevenue = enhancedTreatments.reduce((sum: number, t: Treatment) => sum + (t.finalAmount || 0), 0)
        const totalTips = enhancedTreatments.reduce((sum: number, t: Treatment) => sum + (t.tipAmount || 0), 0)
        const completedTreatments = enhancedTreatments.filter((t: Treatment) => t.treatmentStatus === 'completed').length

        workData.push({
          staff,
          treatments: enhancedTreatments,
          totalRevenue,
          totalTips,
          completedTreatments
        })
      }

      setStaffWorkData(workData)

    } catch (error) {
      console.error('Error fetching work status data:', error)
      toast({
        title: "Error",
        description: "Failed to load work status data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number | undefined) => {
    const safeAmount = amount || 0
    return `$${safeAmount.toLocaleString()}`
  }

  const getPaymentMethodBadge = (method?: string) => {
    switch (method) {
      case 'cash':
        return <Badge variant="outline" className="text-green-600"><Banknote className="h-3 w-3 mr-1" />Cash</Badge>
      case 'card':
        return <Badge variant="outline" className="text-blue-600"><CreditCard className="h-3 w-3 mr-1" />Card</Badge>
      case 'mixed':
        return <Badge variant="outline" className="text-purple-600">Mixed</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
      case 'no_show':
        return <Badge className="bg-yellow-100 text-yellow-800">No Show</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Select Date
            </CardTitle>
            <CardDescription>Choose a date to view work status</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Daily Summary */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Work Summary - {format(selectedDate, 'MMM dd, yyyy')}</CardTitle>
              <CardDescription>
                Overview of staff performance for the selected date
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{workingStaff.length}</div>
                  <div className="text-sm text-gray-500">Working Staff</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {staffWorkData.reduce((sum, emp) => sum + emp.completedTreatments, 0)}
                  </div>
                  <div className="text-sm text-gray-500">Completed Treatments</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(staffWorkData.reduce((sum, emp) => sum + emp.totalRevenue, 0))}
                  </div>
                  <div className="text-sm text-gray-500">Total Revenue</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {formatCurrency(staffWorkData.reduce((sum, emp) => sum + emp.totalTips, 0))}
                  </div>
                  <div className="text-sm text-gray-500">Total Tips</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Staff Work Details */}
      {staffWorkData.map((empData) => (
        <Card key={empData.staff.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {empData.staff.firstName} {empData.staff.lastName}
              </span>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {empData.staff.workingStartTime} - {empData.staff.workingEndTime}
                </span>
                <Badge variant="secondary">{empData.staff.position}</Badge>
              </div>
            </CardTitle>
            <CardDescription>
              Treatments: {empData.completedTreatments} | Revenue: {formatCurrency(empData.totalRevenue)} | Tips: {formatCurrency(empData.totalTips)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {empData.treatments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Service Cost</TableHead>
                    <TableHead>TIP Card</TableHead>
                    <TableHead>TIP Cash</TableHead>
                    <TableHead>Total Payment</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {empData.treatments.map((treatment) => (
                    <TableRow key={treatment.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{treatment.customer?.first_name} {treatment.customer?.last_name}</div>
                          <div className="text-xs text-gray-500">{treatment.customer?.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {treatment.time_slot}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{treatment.service?.name}</div>
                          <div className="text-xs text-gray-500">
                            {treatment.service?.duration ? `${treatment.service.duration}min` : ''}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-right font-medium">
                          {formatCurrency(treatment.actualPrice)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-right font-medium text-blue-600">
                          {treatment.tipCardAmount ? formatCurrency(treatment.tipCardAmount) : '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          {treatment.tipCashAmount && treatment.tipCashAmount > 0 ? (
                            <div className="flex items-center justify-center gap-1">
                              <span className="text-green-600 font-bold">O</span>
                              <span className="text-xs text-gray-500">({formatCurrency(treatment.tipCashAmount)})</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-right font-bold">
                          {formatCurrency(treatment.finalAmount)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(treatment.treatmentStatus)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {workingStaff.some(we => we.id === empData.staff.id) ? 
                  'No treatments recorded for this staff on the selected date' :
                  'Staff not scheduled to work on the selected date'
                }
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {staffWorkData.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Staff Information</h3>
            <p className="text-gray-500">
              No staff members found in the system
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}