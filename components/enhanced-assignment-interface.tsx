'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { CalendarDays, Clock, ChevronLeft, ChevronRight, UserCheck, Plus, Calendar as CalendarIcon, Users, CheckCircle, Edit, Save, X, RefreshCw, Loader2 } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { ExpandedCalendar } from '@/components/expanded-calendar'
import { format } from 'date-fns'

interface Customer {
  id: number
  name?: string
  first_name?: string
  last_name?: string
  phone_number?: string
  phone_raw?: string
  email?: string
  total_visits?: number
  vip_level?: string
}

interface Service {
  id: number
  name: string
  duration?: number
  duration_min?: number
  price?: number
  base_price_cents?: number
  description?: string
  category?: string
}

interface Staff {
  id: string
  firstName: string
  lastName: string
  position: string
  specialties?: string[]
  workingStartTime?: string
  workingEndTime?: string
  phone?: string
  email?: string
}

interface Booking {
  id: number
  booking_date: string
  booking_time?: string
  time_slot: string
  status: string
  customer_id: number
  service_id: number
  staff_id?: string | null
  assigned_staff_id?: string | null
  created_by?: string | null
  source?: string
  price: number
  duration: number
  notes?: string
  customer_name?: string
  customerName?: string
  customer_phone?: string
}

export function EnhancedAssignmentInterface() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [customers, setCustomers] = useState<Customer[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)
  
  // Real-time refresh states
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [hasNewData, setHasNewData] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  
  // Staff Booking Status dialog states
  const [showBookingDialog, setShowBookingDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('')
  const [selectedStaff, setSelectedStaff] = useState('')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  
  // New booking form states
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [selectedService, setSelectedService] = useState('')
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [bookingMethod, setBookingMethod] = useState('Phone')
  
  // Edit mode states
  const [isEditMode, setIsEditMode] = useState(false)
  const [editCustomerName, setEditCustomerName] = useState('')
  const [editCustomerPhone, setEditCustomerPhone] = useState('')
  const [editServices, setEditServices] = useState<string[]>([])  // Changed to array for multiple services
  const [editNotes, setEditNotes] = useState('')
  const [editTimeSlot, setEditTimeSlot] = useState('')
  const [editDate, setEditDate] = useState<Date>(new Date())  // Add date editing capability
  
  // Staff assignment states
  const [showStaffAssignDialog, setShowStaffAssignDialog] = useState(false)
  const [assigningBooking, setAssigningBooking] = useState<Booking | null>(null)
  const [selectedStaffForAssignment, setSelectedStaffForAssignment] = useState('')
  
  // View options for right table
  const [viewMode, setViewMode] = useState<'unassigned' | 'assigned' | 'all'>('unassigned')
  const [searchTerm, setSearchTerm] = useState('')
  
  // Customer lookup states
  const [isLookingUpCustomer, setIsLookingUpCustomer] = useState(false)
  const [foundCustomer, setFoundCustomer] = useState<Customer | null>(null)

  const { toast } = useToast()

  // Phone number formatting function
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '')
    
    // Limit to 10 digits
    const limited = cleaned.slice(0, 10)
    
    // Format as (123) 456-7890
    if (limited.length >= 6) {
      return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`
    } else if (limited.length >= 3) {
      return `(${limited.slice(0, 3)}) ${limited.slice(3)}`
    } else if (limited.length > 0) {
      return `(${limited}`
    }
    return limited
  }

  // Customer lookup function
  const lookupCustomerByPhone = async (phoneNumber: string) => {
    if (!phoneNumber || phoneNumber.length < 14) return // Need at least (123) 456-7890 format
    
    setIsLookingUpCustomer(true)
    try {
      const response = await fetch('/api/customers')
      if (response.ok) {
        const allCustomers = await response.json()
        const cleanedInput = phoneNumber.replace(/\D/g, '')
        
        const customer = allCustomers.find((c: Customer) => {
          const customerPhone = (c.phone_number || '').replace(/\D/g, '')
          return customerPhone === cleanedInput
        })
        
        if (customer) {
          setFoundCustomer(customer)
          setCustomerName(`${customer.first_name || ''} ${customer.last_name || ''}`.trim())
        } else {
          setFoundCustomer(null)
          setCustomerName('')
        }
      }
    } catch (error) {
      console.error('Error looking up customer:', error)
    } finally {
      setIsLookingUpCustomer(false)
    }
  }

  const timeSlots = [
    '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00'
  ]

  useEffect(() => {
    fetchData()
    
    // Set up 30-second polling
    const interval = setInterval(() => {
      fetchData(true) // true indicates this is a background refresh
    }, 30000)

    // Listen for booking updates from other tabs/components
    const handleBookingUpdate = (event: StorageEvent) => {
      if (event.key === 'bookingUpdated') {
        console.log('Booking updated in another tab, refreshing Assignment...')
        fetchData()
      }
    }

    // Listen for custom booking events
    const handleCustomBookingUpdate = (event: CustomEvent) => {
      console.log('Booking updated via custom event, refreshing Assignment...')
      fetchData()
    }

    // Listen for refreshBookings event from Booking component
    const handleRefreshBookings = (event: CustomEvent) => {
      console.log('Booking refresh event from Booking tab, refreshing Assignment...')
      fetchData()
    }

    window.addEventListener('storage', handleBookingUpdate)
    window.addEventListener('bookingUpdated', handleCustomBookingUpdate as EventListener)
    window.addEventListener('refreshBookings', handleRefreshBookings as EventListener)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', handleBookingUpdate)
      window.removeEventListener('bookingUpdated', handleCustomBookingUpdate as EventListener)
      window.removeEventListener('refreshBookings', handleRefreshBookings as EventListener)
    }
  }, [selectedDate])

  const fetchData = async (isBackgroundRefresh = false) => {
    try {
      if (!isBackgroundRefresh) {
        setLoading(true)
      }
      setRefreshing(true)
      const formattedDate = format(selectedDate, 'yyyy-MM-dd')
      
      // Load working employees for the selected date from database schedules
      try {
        const staffRes = await fetch(`/api/staff?date=${formattedDate}`)
        if (staffRes.ok) {
          const staffData = await staffRes.json()
          console.log('Loaded staff:', staffData)
          console.log('Setting staff state with', staffData.length, 'staff members')
          
          // Always use actual employees data if available
          if (staffData && staffData.length > 0) {
            // Map API data structure to component interface
            const mappedStaffData = staffData.map((staff: any) => ({
              id: staff.id,
              firstName: staff.firstName || '',
              lastName: staff.lastName || '',
              position: staff.position || 'Staff',
              specialties: staff.specialties || ['Nail Care'],
              workingStartTime: staff.workingStartTime || '10:00',
              workingEndTime: staff.workingEndTime || '19:00',
              phone: staff.phone || '',
              email: staff.email || ''
            }))
            setStaff(mappedStaffData)
          } else {
            console.warn('No staff data received, using fallback')
            setStaff([
              { id: 'e858ff00-fa04-4ef4-a392-772baa077659', firstName: 'Sarah', lastName: 'Kim', position: 'Manager', specialties: ['Nail Care'], workingStartTime: '10:00', workingEndTime: '19:00' },
              { id: '6dc61fb6-7a09-4e35-af37-3ad6a3cbb61a', firstName: 'Michelle', lastName: 'Park', position: 'Manager', specialties: ['Nail Care'], workingStartTime: '10:00', workingEndTime: '19:00' },
              { id: '38db0aa6-75bd-463a-9228-3cab54d77836', firstName: 'Sophia', lastName: 'Williams', position: 'Staff', specialties: ['Nail Care'], workingStartTime: '10:00', workingEndTime: '19:00' },
            ])
          }
        } else {
          console.error('Failed to fetch staff, status:', staffRes.status)
          throw new Error('Failed to fetch staff')
        }
      } catch (error) {
        console.error('Error loading staff:', error)
        // Use fallback staff data with real UUIDs
        setStaff([
          { id: 'e858ff00-fa04-4ef4-a392-772baa077659', firstName: 'Sarah', lastName: 'Kim', position: 'Manager', specialties: ['Nail Care'], workingStartTime: '10:00', workingEndTime: '19:00' },
          { id: '6dc61fb6-7a09-4e35-af37-3ad6a3cbb61a', firstName: 'Michelle', lastName: 'Park', position: 'Manager', specialties: ['Nail Care'], workingStartTime: '10:00', workingEndTime: '19:00' },
          { id: '38db0aa6-75bd-463a-9228-3cab54d77836', firstName: 'Sophia', lastName: 'Williams', position: 'Staff', specialties: ['Nail Care'], workingStartTime: '10:00', workingEndTime: '19:00' },
        ])
      }

      // Load bookings for the selected date
      const bookingsRes = await fetch(`/api/bookings?date=${formattedDate}`)
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json()
        console.log('Raw bookings data:', bookingsData)
        
        // Map booking data to include time_slot from booking_time
        const mappedBookingsData = bookingsData.map((booking: any) => {
          const timeSlot = booking.booking_time ? 
            // Extract time directly from UTC string to avoid timezone conversion
            booking.booking_time.split('T')[1]?.substring(0, 5) || null : null
          
          // Use customer data from joined customers table first, fallback to notes parsing
          const customerName = booking.customers?.last_name || 
                              booking.customers?.name ||
                              (booking.customers?.first_name && booking.customers?.last_name 
                                ? `${booking.customers.first_name} ${booking.customers.last_name}` 
                                : '') ||
                              (booking.notes ? booking.notes.match(/Name: ([^|]+)/)?.[1]?.trim() : null) || 
                              'Unknown'
          
          const customerPhone = booking.customers?.phone_raw || 
                               booking.customers?.phone_number ||
                               (booking.notes ? booking.notes.match(/Phone: ([^|]+)/)?.[1]?.trim() : null) || 
                               ''

          console.log(`Mapping booking ${booking.id}: time_slot=${timeSlot}, customer_name=${customerName}, phone=${customerPhone}`)
          
          return {
            ...booking,
            time_slot: timeSlot,
            customer_name: customerName,
            customer_phone: customerPhone,
            // For assignment purposes, check if staff is assigned
            staff_id: booking.staff_id || booking.assigned_staff_id || null
          }
        })
        
        console.log('Mapped bookings data:', mappedBookingsData)
        setBookings(mappedBookingsData)
      }

      // Load services with fallback data
      try {
        const servicesRes = await fetch('/api/services')
        if (servicesRes.ok) {
          const servicesData = await servicesRes.json()
          console.log('Loaded services data:', servicesData)
          setServices(servicesData.length > 0 ? servicesData : [
            { id: '1', name: 'Basic Manicure', duration_min: 60, base_price_cents: 3500, description: 'Basic nail care service', category: 'manicure' },
            { id: '2', name: 'Gel Manicure', duration_min: 90, base_price_cents: 4500, description: 'Long-lasting gel polish', category: 'manicure' },
            { id: '3', name: 'Nail Art', duration_min: 120, base_price_cents: 5500, description: 'Custom nail art design', category: 'art' }
          ])
        }
      } catch (error) {
        console.error('Error loading services:', error)
        setServices([
          { id: 1, name: 'Basic Manicure', duration: 60, price: 35000, description: 'Basic nail care service' },
          { id: 2, name: 'Gel Manicure', duration: 90, price: 45000, description: 'Long-lasting gel polish' },
          { id: 3, name: 'Nail Art', duration: 120, price: 55000, description: 'Custom nail art design' }
        ])
      }

      // Load customers
      const customersRes = await fetch('/api/customers')
      if (customersRes.ok) {
        const customersData = await customersRes.json()
        setCustomers(customersData)
      }
      
      setLastRefresh(new Date())
      if (isBackgroundRefresh) {
        setHasNewData(true)
        // Auto-hide new data indicator after 3 seconds
        setTimeout(() => setHasNewData(false), 3000)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: "Error",
        description: "Failed to load assignment data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleManualRefresh = () => {
    fetchData()
    setHasNewData(false)
  }

  // 직원이 특정 날짜에 근무하는지 확인 (일주일에 2일만 근무)
  const isStaffWorkingOnDate = (staff: Staff, date: Date): boolean => {
    // 간단한 해시 함수로 직원별로 일관된 근무 패턴 생성
    const staffHash = staff.id.split('').reduce((a: number, b: string) => a + b.charCodeAt(0), 0);
    const dayOfWeek = date.getDay(); // 0=일요일, 1=월요일, ... 6=토요일
    
    // 각 직원마다 고유한 2일 근무 패턴 생성 (월-금 중에서)
    const workDays = [(staffHash % 5) + 1, ((staffHash + 2) % 5) + 1]; // 1~5 (월~금)
    
    console.log(`Staff ${staff.firstName} ${staff.lastName} (${staff.id.substring(0, 8)}): workDays=${workDays}, today=${dayOfWeek}, working=${workDays.includes(dayOfWeek)}`);
    
    return workDays.includes(dayOfWeek);
  }

  // Check if staff is working at specific time
  const isStaffWorking = (staff: Staff, timeSlot: string): boolean => {
    // 먼저 해당 날짜에 근무하는지 확인
    if (!isStaffWorkingOnDate(staff, selectedDate)) {
      return false;
    }
    
    if (!staff.workingStartTime || !staff.workingEndTime || !timeSlot) {
      return true // Default to working if no schedule data
    }
    
    const slotTime = parseInt(timeSlot.toString().replace(':', ''))
    const startTime = parseInt(staff.workingStartTime.toString().replace(':', ''))
    const endTime = parseInt(staff.workingEndTime.toString().replace(':', ''))
    
    return slotTime >= startTime && slotTime <= endTime
  }

  // Get booking for specific staff and time slot
  const getBookingForSlot = (staffId: string, timeSlot: string) => {
    return bookings.find(b => 
      (b.staff_id === staffId || b.assigned_staff_id === staffId || b.created_by === staffId) && 
      b.time_slot === timeSlot
    )
  }

  // Reset form when dialog opens
  const resetBookingForm = () => {
    setCustomerName('')
    setCustomerPhone('')
    setSelectedServices([])
    setNotes('')
    setBookingMethod('Phone')
    setFoundCustomer(null)
    setIsLookingUpCustomer(false)
  }

  // Handle Y button click (create new booking)
  const handleYClick = (staffId: string, timeSlot: string) => {
    const booking = getBookingForSlot(staffId, timeSlot)
    if (booking) {
      toast({
        title: "Time Slot Occupied",
        description: "This time slot already has a booking. Click N to view/edit.",
        variant: "destructive",
      })
      return
    }
    
    setSelectedStaff(staffId)
    setSelectedTimeSlot(timeSlot)
    resetBookingForm()
    setShowBookingDialog(true)
  }

  // Handle N button click (view/edit existing booking)
  const handleNClick = (booking: Booking) => {
    if (!booking) {
      toast({
        title: "No Booking Found",
        description: "No booking exists for this time slot. Click Y to create one.",
        variant: "destructive",
      })
      return
    }
    
    setSelectedBooking(booking)
    setSelectedStaff(booking.staff_id || booking.assigned_staff_id || booking.created_by || '')
    setSelectedTimeSlot(booking.time_slot)
    setIsEditMode(false)
    
    // Set edit form values with detailed customer info
    const customer = customers.find(c => c.id === booking.customer_id)
    
    // Use booking data first, then fallback to customer data
    const customerName = booking.customer_name || 
                        customer?.name || 
                        customer?.last_name ||
                        (customer?.first_name && customer?.last_name 
                          ? `${customer.first_name} ${customer.last_name}` 
                          : '') || ''
    const customerPhone = booking.customer_phone || 
                         customer?.phone_number || 
                         customer?.phone_raw || ''
    
    setEditCustomerName(customerName)
    setEditCustomerPhone(customerPhone)
    // Handle existing service - convert to array format
    const existingServices = booking.service_id ? [booking.service_id.toString()] : []
    setEditServices(existingServices)
    setEditNotes(booking.notes || '')
    setEditTimeSlot(booking.time_slot)
    setEditDate(selectedDate)  // Initialize with current selected date
    
    setShowViewDialog(true)
  }

  // Handle new booking submission
  const handleBookingSubmit = async () => {
    if (!customerName || !customerPhone || selectedServices.length === 0) {
      toast({
        title: "Required Fields",
        description: "Customer name, phone, and at least one service are required",
        variant: "destructive",
      })
      return
    }

    try {
      // Use the first selected service as the primary service
      const primaryServiceId = selectedServices[0]
      const selectedServiceData = services.find(s => s.id.toString() === primaryServiceId)
      
      // Calculate total price from all selected services
      const totalPrice = selectedServices.reduce((total, serviceId) => {
        const service = services.find(s => s.id.toString() === serviceId)
        return total + (service?.base_price_cents || (service?.price ? service.price * 100 : 0))
      }, 0)
      
      const bookingData = {
        customerId: null, // Will be created if customer doesn't exist
        serviceId: parseInt(primaryServiceId),
        staffId: selectedStaff,
        bookingDate: selectedDate.toISOString(),
        timeSlot: selectedTimeSlot,
        status: 'confirmed',
        price: totalPrice,
        duration: selectedServiceData?.duration_min || selectedServiceData?.duration || 60,
        notes: notes,
        customerName: customerName,
        customerPhone: customerPhone,
        selected_services: selectedServices.map(id => parseInt(id)) // Store all selected services
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Booking created successfully",
        })
        setShowBookingDialog(false)
        fetchData() // Refresh data
      } else {
        throw new Error('Failed to create booking')
      }
    } catch (error) {
      console.error('Error creating booking:', error)
      toast({
        title: "Error",
        description: "Failed to create booking",
        variant: "destructive",
      })
    }
  }

  // Handle staff assignment
  const handleStaffAssignment = (booking: Booking) => {
    setAssigningBooking(booking)
    setSelectedStaffForAssignment('')
    setShowStaffAssignDialog(true)
  }

  // Handle staff assignment submission
  const handleStaffAssignSubmit = async () => {
    if (!assigningBooking || !selectedStaffForAssignment) {
      toast({
        title: "Required Selection",
        description: "Please select a staff member",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/bookings/${assigningBooking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staff_id: selectedStaffForAssignment,
          created_by: selectedStaffForAssignment // Track assignment source
        })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Staff assigned successfully",
        })
        setShowStaffAssignDialog(false)
        setAssigningBooking(null)
        setSelectedStaffForAssignment('')
        
        // Refresh data without page reload
        await fetchData()
        
        // Update the local bookings state to reflect the assignment
        setBookings(prevBookings => 
          prevBookings.map(b => 
            b.id === assigningBooking.id 
              ? { ...b, staff_id: selectedStaffForAssignment, created_by: selectedStaffForAssignment }
              : b
          )
        )
        
        console.log('Updated booking with staff_id:', selectedStaffForAssignment)
      } else {
        throw new Error('Failed to assign staff')
      }
    } catch (error) {
      console.error('Error assigning staff:', error)
      toast({
        title: "Error",
        description: "Failed to assign staff",
        variant: "destructive",
      })
    }
  }

  // Handle booking update
  const handleBookingUpdate = async () => {
    if (!selectedBooking || !editCustomerName || !editCustomerPhone || editServices.length === 0) {
      toast({
        title: "Required Fields",
        description: "Customer name, phone, and at least one service are required",
        variant: "destructive",
      })
      return
    }

    try {
      const originalBooking = selectedBooking
      const primaryServiceId = editServices[0]
      const selectedServiceData = services.find(s => s.id.toString() === primaryServiceId)
      
      // Create booking history record
      const historyData = {
        bookingId: originalBooking.id,
        originalBookingDate: new Date(originalBooking.booking_date),
        originalTimeSlot: originalBooking.time_slot,
        newBookingDate: selectedDate,
        newTimeSlot: editTimeSlot,
        originalStaffId: originalBooking.created_by,
        newStaffId: selectedStaff,
        changeReason: 'Manual update via assignment interface',
        modifiedByStaffId: 'admin', // In real app, get from current user
        changeType: 'update',
        notes: `Updated: ${originalBooking.time_slot} → ${editTimeSlot}, Service changed, Customer info updated`
      }

      // Save booking history
      await fetch('/api/booking-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(historyData)
      })

      // Update booking - if time slot changed, remove staff assignment
      const timeSlotChanged = originalBooking.time_slot !== editTimeSlot
      const updatedBookingData = {
        ...originalBooking,
        time_slot: editTimeSlot,
        service_id: parseInt(primaryServiceId),
        selected_services: editServices.map(id => parseInt(id)),  // Store all selected services
        // Update staff assignment - if time slot changed and new staff not selected, remove assignment
        staff_id: selectedStaff || (timeSlotChanged ? null : originalBooking.staff_id),
        created_by: selectedStaff || (timeSlotChanged ? null : originalBooking.created_by),
        price: selectedServiceData?.base_price_cents ? selectedServiceData.base_price_cents / 100 : originalBooking.price,
        duration: selectedServiceData?.duration_min || selectedServiceData?.duration || originalBooking.duration,
        notes: editNotes,
        // Update customer info as well
        customer_name: editCustomerName,
        customer_phone: editCustomerPhone
      }

      // Prepare API data with date update - only include fields that exist in database
      const apiData = {
        booking_date: editDate.toISOString().split('T')[0],
        time_slot: editTimeSlot,
        staff_id: selectedStaff || null,
        notes: editNotes,
        status: 'scheduled'
      }

      const response = await fetch(`/api/bookings/${originalBooking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData)
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: timeSlotChanged 
            ? "Booking updated successfully. Time change moved booking to unassigned list."
            : "Booking updated successfully",
        })
        setShowViewDialog(false)
        setIsEditMode(false)
        fetchData() // Refresh data
      } else {
        throw new Error('Failed to update booking')
      }
    } catch (error) {
      console.error('Error updating booking:', error)
      toast({
        title: "Error",
        description: "Failed to update booking",
        variant: "destructive",
      })
    }
  }

  // Filter bookings by view mode and search term
  const filteredBookings = bookings.filter(booking => {
    // View mode filter
    let matchesView = false
    if (viewMode === 'unassigned') {
      // Unassigned: no staff assigned - check both staff_id and assigned_staff_id fields
      matchesView = !booking.staff_id && !booking.assigned_staff_id
    } else if (viewMode === 'assigned') {
      matchesView = !!(booking.staff_id || booking.assigned_staff_id)
    } else {
      matchesView = true // 'all' shows everything
    }
    
    // Search filter
    const searchLower = searchTerm.toLowerCase()
    const customer = customers.find(c => c.id === booking.customer_id)
    const service = services.find(s => s.id === booking.service_id)
    // Use both customer table data and parsed data from booking notes
    const customerName = customer?.name || customer?.last_name || booking.customer_name || ''
    const customerPhone = customer?.phone_number || customer?.phone_raw || booking.customer_phone || ''
    const matchesSearch = !searchTerm || 
                         customerName.toLowerCase().includes(searchLower) ||
                         customerPhone.includes(searchTerm) ||
                         (service?.name || '').toLowerCase().includes(searchLower)
    
    return matchesView && matchesSearch
  })


  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage)
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // 선택된 날짜에 근무하는 직원만 필터링
  const workingStaff = staff.filter(s => isStaffWorkingOnDate(s, selectedDate))
  
  // Get unassigned bookings
  const unassignedBookings = bookings.filter(b => !b.staff_id && !b.assigned_staff_id)
  
  // Get bookings by source
  const homepageBookings = bookings.filter(b => b.source === 'Homepage')
  const callBookings = bookings.filter(b => b.source === 'Call')
  const walkinBookings = bookings.filter(b => b.source === 'Walk-in' || b.source === 'Visit')
  const rebookingBookings = bookings.filter(b => b.source === 'Rebooking')
  

  if (loading && staff.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            Staff Assignment & Booking Management
            {hasNewData && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 animate-pulse">
                New Data
              </Badge>
            )}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {format(lastRefresh, 'HH:mm:ss')}
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleManualRefresh}
          disabled={refreshing}
          data-testid="button-refresh-assignments"
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      {/* Top Section - Date Selection and Y/N Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side - Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Date Selection
            </CardTitle>
            <CardDescription>
              Select date for staff assignment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ExpandedCalendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
            
            {/* Statistics */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-blue-500" />
                  Working Staff:
                </span>
                <span className="font-bold">{workingStaff.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Total Bookings:
                </span>
                <span className="font-bold">{bookings.length}</span>
              </div>
              {/* Booking source breakdown */}
              <div className="ml-4 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Homepage:</span>
                  <span className="font-medium text-gray-800">{homepageBookings.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Call:</span>
                  <span className="font-medium text-gray-800">{callBookings.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Walk-in:</span>
                  <span className="font-medium text-gray-800">{walkinBookings.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Rebooking:</span>
                  <span className="font-medium text-gray-800">{rebookingBookings.length}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <UserCheck className="h-3 w-3 text-orange-500" />
                  Unassigned:
                </span>
                <span className="font-bold">{unassignedBookings.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Side - Y/N Booking Grid */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Staff Booking Status - {format(selectedDate, 'MMMM dd, yyyy (EEE)')}
            </CardTitle>
            <CardDescription>
              Green (Y) = Available, Red (N) = Booked. Click Y to book, N to view/edit.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Time</th>
                    {workingStaff.map((staff) => (
                      <th key={staff.id} className="text-center p-2 font-medium min-w-[100px]">
                        <div className="space-y-1">
                          <div className="font-semibold text-sm">
                            {(staff.firstName && staff.lastName) ? `${staff.firstName} ${staff.lastName}` : `Staff ${staff.id.substring(0, 8)}`}
                          </div>
                          <div className="text-xs text-gray-500">
                            {staff.position || 'Staff'}
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((timeSlot) => (
                    <tr key={timeSlot} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{timeSlot}</td>
                      {workingStaff.map((staff) => {
                        const booking = getBookingForSlot(staff.id, timeSlot)
                        
                        return (
                          <td key={staff.id} className="p-2 text-center">
                            {booking ? (
                              <Button
                                variant="destructive"
                                size="sm"
                                className="w-12 h-8 text-white font-bold"
                                onClick={() => handleNClick(booking)}
                                data-testid={`button-booking-${staff.id}-${timeSlot}`}
                              >
                                N
                              </Button>
                            ) : (
                              <Button
                                variant="default"
                                size="sm"
                                className="w-12 h-8 bg-green-500 hover:bg-green-600 text-white font-bold"
                                onClick={() => handleYClick(staff.id, timeSlot)}
                                data-testid={`button-available-${staff.id}-${timeSlot}`}
                              >
                                Y
                              </Button>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section - Unassigned Customers Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                {viewMode === 'unassigned' ? 'Unassigned Customers' : 
                 viewMode === 'assigned' ? 'Assigned Customers' : 
                 'All Customer Bookings'}
              </CardTitle>
              <CardDescription>
                {viewMode === 'unassigned' ? `Customers without assigned staff members (${filteredBookings.length} total)` :
                 viewMode === 'assigned' ? `Customers with assigned staff members (${filteredBookings.length} total)` :
                 `All customer bookings for today (${filteredBookings.length} total)`}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {/* View Mode Buttons */}
              <div className="flex items-center gap-1 border rounded-lg p-1">
                <Button 
                  variant={viewMode === 'unassigned' ? 'default' : 'ghost'} 
                  size="sm"
                  onClick={() => setViewMode('unassigned')}
                  data-testid="button-view-unassigned"
                >
                  Unassigned
                </Button>
                <Button 
                  variant={viewMode === 'assigned' ? 'default' : 'ghost'} 
                  size="sm"
                  onClick={() => setViewMode('assigned')}
                  data-testid="button-view-assigned"
                >
                  Assigned
                </Button>
                <Button 
                  variant={viewMode === 'all' ? 'default' : 'ghost'} 
                  size="sm"
                  onClick={() => setViewMode('all')}
                  data-testid="button-view-all"
                >
                  All
                </Button>
              </div>
              
              {/* Search Input */}
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48"
                data-testid="input-search-customers"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredBookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No bookings match the current filter</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">#</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedBookings.map((booking, index) => {
                    const customer = customers.find(c => c.id === booking.customer_id)
                    // service_id 매칭 또는 기본 서비스 사용
                    let service = null
                    if (booking.service_id) {
                      // service_id가 있는 경우 매칭
                      service = services.find(s => {
                        if (String(s.id) === `svc-${String(booking.service_id).padStart(3, '0')}`) return true
                        if (String(s.id) === String(booking.service_id)) return true
                        return false
                      })
                    }
                    // service_id가 없거나 매칭되지 않은 경우 기본 서비스 사용
                    if (!service) {
                      service = services.find(s => String(s.id) === 'svc-003') || services[0] // Gel Manicure 기본
                    }
                    const globalIndex = (currentPage - 1) * itemsPerPage + index + 1
                    
                    return (
                      <TableRow key={booking.id} data-testid={`row-booking-${booking.id}`}>
                        <TableCell className="font-medium">{globalIndex}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {booking.time_slot || 
                             (booking.booking_time ? 
                               // Extract time directly from UTC string to avoid timezone conversion
                               booking.booking_time.split('T')[1]?.substring(0, 5) : 'Unknown Time')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {booking.customer_name || booking.customerName || customer?.name || customer?.last_name || 'Unknown Customer'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {booking.customer_phone || customer?.phone_number || customer?.phone_raw || 'No phone'}
                            </p>
                            {(booking.created_by || booking.source) && (
                              <p className="text-xs text-purple-600 font-medium mt-1">
                                🌐 Source: {booking.source || booking.created_by}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {service?.name || 'Gel Manicure'}
                            </p>
                            <p className="text-xs text-gray-500">{service?.duration_min || service?.duration || 0} min</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            {booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          ${booking.price?.toLocaleString() || 0}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant={booking.staff_id ? "default" : "outline"}
                            size="sm" 
                            data-testid={`button-assign-${booking.id}`}
                            onClick={() => handleStaffAssignment(booking)}
                            className={booking.staff_id ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                          >
                            {booking.staff_id ? "Assigned" : "Assign Staff"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-700">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredBookings.length)} of {filteredBookings.length} bookings
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      data-testid="button-previous-page"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <span className="text-sm font-medium">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      data-testid="button-next-page"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* New Booking Dialog (Y button clicked) */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Booking</DialogTitle>
            <DialogDescription>
              Staff: {staff.find(e => e.id === selectedStaff)?.firstName} {staff.find(e => e.id === selectedStaff)?.lastName}<br/>
              Time: {selectedTimeSlot} on {format(selectedDate, 'MMMM dd, yyyy')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Phone field first */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customerPhone" className="text-right">Phone</Label>
              <div className="col-span-3 relative">
                <Input
                  id="customerPhone"
                  value={customerPhone}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value)
                    setCustomerPhone(formatted)
                    
                    // Auto lookup customer when phone is complete
                    if (formatted.length === 14) { // (123) 456-7890 format
                      lookupCustomerByPhone(formatted)
                    } else {
                      setFoundCustomer(null)
                      if (!foundCustomer) setCustomerName('') // Clear name only if no customer found
                    }
                  }}
                  placeholder="(123) 456-7890"
                  className="col-span-3"
                  data-testid="input-customer-phone"
                />
                {isLookingUpCustomer && (
                  <div className="absolute right-3 top-2">
                    <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                )}
              </div>
            </div>
            
            {/* Customer lookup status */}
            {foundCustomer && (
              <div className="grid grid-cols-4 items-center gap-4">
                <div></div>
                <div className="col-span-3 text-sm text-green-600 flex items-center gap-1">
                  ✓ Customer found: {foundCustomer.first_name} {foundCustomer.last_name}
                </div>
              </div>
            )}
            {customerPhone.length === 14 && !foundCustomer && !isLookingUpCustomer && (
              <div className="grid grid-cols-4 items-center gap-4">
                <div></div>
                <div className="col-span-3 text-sm text-blue-600">
                  New customer - please enter name below
                </div>
              </div>
            )}
            
            {/* Source/Booking Method field */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bookingMethod" className="text-right">Source</Label>
              <div className="col-span-3 flex gap-2 items-center">
                <Select value={bookingMethod} onValueChange={setBookingMethod}>
                  <SelectTrigger className="w-[140px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Phone">Phone</SelectItem>
                    <SelectItem value="Walk-in">Walk-in</SelectItem>
                    <SelectItem value="Rebooking">Rebooking</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-xs text-gray-500">via</span>
              </div>
            </div>
            
            {/* Name field second */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customerName" className="text-right">Name</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="col-span-3"
                placeholder={foundCustomer ? "Name auto-filled from database" : "Enter customer name"}
                disabled={!!foundCustomer}
                data-testid="input-customer-name"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-medium">Services</Label>
              <div className="border rounded-lg p-4 space-y-3 max-h-60 overflow-y-auto">
                {services.map((service) => (
                  <div key={service.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={`assignment-service-${service.id}`}
                      checked={selectedServices.includes(service.id.toString())}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedServices(prev => [...prev, service.id.toString()])
                        } else {
                          setSelectedServices(prev => prev.filter(id => id !== service.id.toString()))
                        }
                      }}
                      data-testid={`checkbox-service-${service.id}`}
                    />
                    <Label htmlFor={`assignment-service-${service.id}`} className="flex-1 cursor-pointer">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{service.name}</span>
                        <div className="text-right text-sm">
                          <div className="font-semibold text-green-600">
                            ${service.base_price_cents ? (service.base_price_cents / 100).toLocaleString() : service.price ? (service.price / 100).toLocaleString() : '0'}
                          </div>
                          <div className="text-gray-500">{service.duration_min || service.duration || 0} min</div>
                        </div>
                      </div>
                      {service.description && (
                        <div className="text-sm text-gray-600 mt-1">{service.description}</div>
                      )}
                    </Label>
                  </div>
                ))}
              </div>
              {selectedServices.length > 0 && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm font-medium text-blue-800 mb-2">Selected Services Summary:</div>
                  <div className="space-y-1">
                    {selectedServices.map(serviceId => {
                      const service = services.find(s => s.id.toString() === serviceId)
                      return service ? (
                        <div key={serviceId} className="flex justify-between text-sm">
                          <span>{service.name}</span>
                          <span>${service.base_price_cents ? (service.base_price_cents / 100).toLocaleString() : service.price ? (service.price / 100).toLocaleString() : '0'}</span>
                        </div>
                      ) : null
                    })}
                    <div className="border-t pt-1 flex justify-between font-medium text-blue-800">
                      <span>Total:</span>
                      <span>
                        ${selectedServices.reduce((total, serviceId) => {
                          const service = services.find(s => s.id.toString() === serviceId)
                          return total + (service?.base_price_cents || (service?.price ? service.price * 100 : 0))
                        }, 0) / 100}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">Notes</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="col-span-3"
                placeholder="Optional notes"
                data-testid="input-notes"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowBookingDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBookingSubmit} data-testid="button-create-booking">
              Create Booking
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View/Edit Booking Dialog (N button clicked) */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isEditMode ? (
                <>
                  <Edit className="h-4 w-4" />
                  Edit Booking
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Booking Details
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Time: {selectedBooking?.time_slot} on {format(selectedDate, 'MMMM dd, yyyy')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span><strong>Status:</strong> {selectedBooking.status || 'Confirmed'}</span>
                <span><strong>Duration:</strong> {selectedBooking.duration || 60} min</span>
                <span><strong>Price:</strong> ${selectedBooking.price?.toFixed(2) || '0.00'}</span>
                <span><strong>Source:</strong> {selectedBooking.source || 'Unknown'}</span>
                <span className="col-span-2">
                  <strong>Assigned Staff:</strong>{' '}
                  {(() => {
                    const assignedStaff = staff.find(s => s.id === (selectedBooking.staff_id || selectedBooking.created_by))
                    return assignedStaff ? `${assignedStaff.firstName} ${assignedStaff.lastName}` : 'Unassigned'
                  })()}
                </span>
              </div>
            </div>
          )}
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Name</Label>
              {isEditMode ? (
                <Input
                  value={editCustomerName}
                  onChange={(e) => setEditCustomerName(e.target.value)}
                  className="col-span-3"
                  data-testid="input-edit-customer-name"
                />
              ) : (
                <div className="col-span-3 px-3 py-2 border rounded">{editCustomerName}</div>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Phone</Label>
              {isEditMode ? (
                <Input
                  value={editCustomerPhone}
                  onChange={(e) => setEditCustomerPhone(e.target.value)}
                  className="col-span-3"
                  data-testid="input-edit-customer-phone"
                />
              ) : (
                <div className="col-span-3 px-3 py-2 border rounded">{editCustomerPhone}</div>
              )}
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Services</Label>
              {isEditMode ? (
                <div className="col-span-3 space-y-3">
                  <div className="max-h-48 overflow-y-auto border rounded-lg p-3">
                    {services.map((service) => (
                      <div key={service.id} className="flex items-center space-x-3 mb-2">
                        <Checkbox
                          id={`edit-service-${service.id}`}
                          checked={editServices.includes(service.id.toString())}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setEditServices(prev => [...prev, service.id.toString()])
                            } else {
                              setEditServices(prev => prev.filter(id => id !== service.id.toString()))
                            }
                          }}
                          data-testid={`checkbox-edit-service-${service.id}`}
                        />
                        <Label htmlFor={`edit-service-${service.id}`} className="flex-1 cursor-pointer text-sm">
                          <div className="flex justify-between items-center">
                            <span>{service.name}</span>
                            <span className="text-green-600 font-medium">
                              ${((service.base_price_cents || 0) / 100).toFixed(2)}
                            </span>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                  {editServices.length > 0 && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm font-medium text-blue-800 mb-2">Selected Services:</div>
                      <div className="space-y-1">
                        {editServices.map(serviceId => {
                          const service = services.find(s => s.id.toString() === serviceId)
                          return service ? (
                            <div key={serviceId} className="flex justify-between text-sm">
                              <span>{service.name}</span>
                              <span>${((service.base_price_cents || 0) / 100).toFixed(2)}</span>
                            </div>
                          ) : null
                        })}
                        <div className="border-t pt-1 flex justify-between font-medium text-blue-800">
                          <span>Total:</span>
                          <span>
                            ${editServices.reduce((total, serviceId) => {
                              const service = services.find(s => s.id.toString() === serviceId)
                              return total + (service?.base_price_cents || 0)
                            }, 0) / 100}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="col-span-3 px-3 py-2 border rounded">
                  {editServices.length > 0 ? (
                    <div className="space-y-1">
                      {editServices.map(serviceId => {
                        const service = services.find(s => s.id.toString() === serviceId)
                        return service ? (
                          <div key={serviceId} className="flex justify-between text-sm">
                            <span>{service.name}</span>
                            <span>${((service.base_price_cents || 0) / 100).toFixed(2)}</span>
                          </div>
                        ) : null
                      })}
                    </div>
                  ) : (
                    'No services selected'
                  )}
                </div>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Date</Label>
              {isEditMode ? (
                <Input
                  type="date"
                  value={editDate.toISOString().split('T')[0]}
                  onChange={(e) => setEditDate(new Date(e.target.value))}
                  className="col-span-3"
                  data-testid="input-edit-date"
                />
              ) : (
                <div className="col-span-3 px-3 py-2 border rounded">
                  {format(editDate, 'MMMM dd, yyyy (EEE)')}
                </div>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Time</Label>
              {isEditMode ? (
                <Select value={editTimeSlot} onValueChange={setEditTimeSlot}>
                  <SelectTrigger className="col-span-3" data-testid="select-edit-time">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="col-span-3 px-3 py-2 border rounded">{editTimeSlot}</div>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Assigned Staff</Label>
              {isEditMode ? (
                <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                  <SelectTrigger className="col-span-3" data-testid="select-edit-assigned-staff">
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.filter(staffMember => {
                      // Filter to show only staff working on the selected edit date
                      return isStaffWorkingOnDate(staffMember, editDate)
                    }).map((staffMember) => {
                      // Check if staff is available for this time slot
                      const isAvailable = selectedBooking ? 
                        (!getBookingForSlot(staffMember.id, selectedBooking.time_slot) || 
                         staffMember.id === selectedBooking.staff_id) : true
                      
                      return (
                        <SelectItem 
                          key={staffMember.id} 
                          value={staffMember.id}
                          disabled={!isAvailable}
                          className={!isAvailable ? 'opacity-50' : ''}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>{staffMember.firstName} {staffMember.lastName}</span>
                            <span className="text-xs text-gray-500 ml-2">
                              {staffMember.position}
                              {!isAvailable && ' (Busy)'}
                            </span>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              ) : (
                <div className="col-span-3 px-3 py-2 border rounded">
                  {(() => {
                    const assignedStaff = staff.find(s => s.id === selectedStaff)
                    return assignedStaff ? `${assignedStaff.firstName} ${assignedStaff.lastName} (${assignedStaff.position})` : 'No staff assigned'
                  })()}
                </div>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Notes</Label>
              {isEditMode ? (
                <Input
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="col-span-3"
                  data-testid="input-edit-notes"
                />
              ) : (
                <div className="col-span-3 px-3 py-2 border rounded">{editNotes || '-'}</div>
              )}
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            {isEditMode ? (
              <>
                <Button variant="outline" onClick={() => setIsEditMode(false)}>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button onClick={handleBookingUpdate} data-testid="button-update-booking">
                  <Save className="h-4 w-4 mr-1" />
                  Update
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setShowViewDialog(false)}>
                  Close
                </Button>
                <Button onClick={() => setIsEditMode(true)} data-testid="button-edit-booking">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Staff Assignment Dialog */}
      <Dialog open={showStaffAssignDialog} onOpenChange={setShowStaffAssignDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Assign Staff Member
            </DialogTitle>
            <DialogDescription>
              Select a staff member for this booking:
              <br />Customer: {assigningBooking?.customer_name || assigningBooking?.customerName || (assigningBooking && customers.find(c => c.id === assigningBooking.customer_id)?.name) || 'Unknown'}
              <br />Time: {assigningBooking?.time_slot} on {format(selectedDate, 'MMMM dd, yyyy')}
              <br />Service: {assigningBooking && services.find(s => s.id === assigningBooking.service_id)?.name || 'Unknown Service'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="staffSelect" className="text-right">Staff Member</Label>
              <Select value={selectedStaffForAssignment} onValueChange={setSelectedStaffForAssignment}>
                <SelectTrigger className="col-span-3" data-testid="select-staff-assignment">
                  <SelectValue placeholder="Select a staff member" />
                </SelectTrigger>
                <SelectContent>
                  {staff.length === 0 ? (
                    <SelectItem value="loading" disabled>
                      Loading staff members... ({staff.length} available)
                    </SelectItem>
                  ) : (
                    staff.filter(staffMember => isStaffWorkingOnDate(staffMember, selectedDate)).map((staff) => {
                      const isAvailable = assigningBooking ? 
                        isStaffWorking(staff, assigningBooking.time_slot) && 
                        !getBookingForSlot(staff.id, assigningBooking.time_slot) : true
                      
                      return (
                        <SelectItem 
                          key={staff.id} 
                          value={staff.id}
                          disabled={!isAvailable}
                          className={!isAvailable ? 'opacity-50' : ''}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>{staff.firstName} {staff.lastName}</span>
                            <span className="text-xs text-gray-500 ml-2">
                              {staff.position}
                              {!isAvailable && ' (Busy)'}
                            </span>
                          </div>
                        </SelectItem>
                      )
                    })
                  )}
                </SelectContent>
              </Select>
            </div>
            {selectedStaffForAssignment && (
              <div className="col-span-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-800">
                  Selected: {staff.find(e => e.id === selectedStaffForAssignment)?.firstName} {staff.find(e => e.id === selectedStaffForAssignment)?.lastName}
                </p>
                <p className="text-xs text-blue-600">
                  Specialties: {staff.find(e => e.id === selectedStaffForAssignment)?.specialties?.join(', ') || 'General'}
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowStaffAssignDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleStaffAssignSubmit} 
              data-testid="button-confirm-staff-assignment"
              disabled={!selectedStaffForAssignment}
            >
              Assign Staff
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}