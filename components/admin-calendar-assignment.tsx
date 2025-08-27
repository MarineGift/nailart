'use client'

import { useState, useEffect } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { CalendarDays, Clock, User, Users, ChevronLeft, ChevronRight, Plus } from 'lucide-react'

interface Staff {
  id: string
  name: string
  position: string
  available: boolean
  working_days: string[]
  shift_start: string
  shift_end: string
}

interface Customer {
  id: number
  name: string
  phone_number: string
  email: string
}

interface Service {
  id: number
  name: string
  duration: number
  price: number
}

interface Booking {
  id: number
  customer_id: number
  staff_id: string
  service_id: number
  booking_date: string
  time_slot: string
  status: string
  customer?: Customer
  service?: Service
  staff?: Employee
}

interface TimeSlot {
  time: string
  hour: number
  minute: number
}

export function AdminCalendarAssignment() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [staff, setStaff] = useState<Staff[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const { toast } = useToast()

  const selectedDateString = format(selectedDate, 'yyyy-MM-dd')

  useEffect(() => {
    fetchData()
  }, [selectedDate])

  useEffect(() => {
    generateTimeSlots()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [staffRes, customersRes, servicesRes, bookingsRes] = await Promise.all([
        fetch(`/api/staff?date=${selectedDateString}`),
        fetch('/api/customers'),
        fetch('/api/services'),
        fetch(`/api/bookings?date=${selectedDateString}`)
      ])

      const [staffData, customersData, servicesData, bookingsData] = await Promise.all([
        staffRes.json(),
        customersRes.json(),
        servicesRes.json(),
        bookingsRes.json()
      ])

      setStaff(staffData || [])
      setCustomers(customersData || [])
      setServices(servicesData || [])
      setBookings(bookingsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const generateTimeSlots = () => {
    const slots: TimeSlot[] = []
    for (let hour = 10; hour < 19; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push({ time, hour, minute })
      }
    }
    setTimeSlots(slots)
  }

  const getWorkingEmployeesForDate = () => {
    const date = new Date(selectedDate)
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    
    return staff.filter(emp => 
      emp.available && emp.working_days.includes(dayName)
    )
  }

  const isStaffAvailableAtTime = (staff: Employee, timeSlot: string) => {
    const [hour, minute] = timeSlot.split(':').map(Number)
    const slotTime = hour * 60 + minute
    
    const [startHour, startMinute] = staff.shift_start.split(':').map(Number)
    const [endHour, endMinute] = staff.shift_end.split(':').map(Number)
    
    const shiftStart = startHour * 60 + startMinute
    const shiftEnd = endHour * 60 + endMinute
    
    return slotTime >= shiftStart && slotTime < shiftEnd
  }

  const getBookingAtTimeSlot = (staffId: string, timeSlot: string) => {
    return bookings.find(booking => 
      booking.staff_id === staffId && 
      booking.time_slot === timeSlot &&
      booking.booking_date === selectedDateString
    )
  }

  const workingStaff = getWorkingEmployeesForDate()
  
  const getBookingsForSelectedDate = () => {
    return bookings.filter(booking => booking.booking_date === selectedDateString)
  }

  const paginatedBookings = () => {
    const allBookings = getBookingsForSelectedDate()
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return allBookings.slice(startIndex, endIndex)
  }

  const totalPages = Math.ceil(getBookingsForSelectedDate().length / itemsPerPage)

  const getCellContent = (staff: Employee, timeSlot: string) => {
    if (!isStaffAvailableAtTime(staff, timeSlot)) {
      return <div className="w-full h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">Off-duty</div>
    }

    const booking = getBookingAtTimeSlot(staff.id, timeSlot)
    
    if (booking) {
      const customer = customers.find(c => c.id === booking.customer_id)
      const service = services.find(s => s.id === booking.service_id)
      
      return (
        <div className="w-full h-12 bg-blue-100 border border-blue-300 rounded p-1 cursor-pointer hover:bg-blue-200 transition-colors">
          <div className="text-xs font-medium text-blue-800 truncate">{customer?.name}</div>
          <div className="text-xs text-blue-600 truncate">{service?.name}</div>
        </div>
      )
    }

    return (
      <div className="w-full h-12 bg-green-50 border border-green-200 rounded flex items-center justify-center cursor-pointer hover:bg-green-100 transition-colors">
        <Plus className="h-4 w-4 text-green-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Staff Assignment Management
          </CardTitle>
          <CardDescription>
            Manage staff assignments and view booking schedules
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Calendar and Schedule Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left side - Calendar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Select Date</CardTitle>
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
        </div>

        {/* Right side - Staff Availability Grid */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{format(selectedDate, 'PPP', { locale: enUS })} - Staff Schedule</CardTitle>
              <CardDescription>
                {workingStaff.length} staff members working today
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                  <p>Loading schedule...</p>
                </div>
              ) : workingStaff.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CalendarDays className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No staff working on the selected date.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border border-gray-200 p-2 bg-gray-50 text-left font-medium">Time</th>
                        {workingStaff.map((staff) => (
                          <th key={staff.id} className="border border-gray-200 p-2 bg-gray-50 text-center font-medium min-w-[120px]">
                            <div>
                              <div className="font-medium">{staff.name}</div>
                              <div className="text-xs text-gray-500">{staff.position}</div>
                              <div className="text-xs text-gray-400">
                                {staff.shift_start}-{staff.shift_end}
                              </div>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {timeSlots.map((slot) => (
                        <tr key={slot.time}>
                          <td className="border border-gray-200 p-2 font-medium text-center bg-gray-50 whitespace-nowrap">
                            {slot.time}
                          </td>
                          {workingStaff.map((staff) => (
                            <td key={`${staff.id}-${slot.time}`} className="border border-gray-200 p-1">
                              {getCellContent(staff, slot.time)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Booking Information Sheet */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Bookings for {format(selectedDate, 'PPP', { locale: enUS })}</CardTitle>
              <CardDescription>
                {getBookingsForSelectedDate().length} total bookings
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Show:</span>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                setItemsPerPage(parseInt(value))
                setCurrentPage(1)
              }}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {getBookingsForSelectedDate().length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No bookings for this date.</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Phone</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedBookings().map((booking) => {
                    const customer = customers.find(c => c.id === booking.customer_id)
                    const service = services.find(s => s.id === booking.service_id)
                    const staff = staff.find(e => e.id === booking.staff_id)
                    
                    return (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">{booking.time_slot}</TableCell>
                        <TableCell>{customer?.name || 'Unknown'}</TableCell>
                        <TableCell>{service?.name || 'Unknown'}</TableCell>
                        <TableCell>{staff?.name || 'Unassigned'}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {booking.status}
                          </span>
                        </TableCell>
                        <TableCell>{customer?.phone_number || '-'}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                    {Math.min(currentPage * itemsPerPage, getBookingsForSelectedDate().length)} of{' '}
                    {getBookingsForSelectedDate().length} bookings
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}