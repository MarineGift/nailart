'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Calendar, Clock, User, Plus, Minus, RefreshCw, Users } from 'lucide-react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'

interface Booking {
  id: string
  customer_id: string
  booking_time: string
  status: string
  notes: string
  customer?: {
    id: string
    name: string
    phone: string
    email?: string
  }
}

interface Service {
  id: string
  name: string
  duration_min: number
  base_price_cents: number
  description: string
  category?: string
}

interface Staff {
  id: string
  firstName: string
  lastName: string
  position: string
}

interface Treatment {
  id?: string
  booking_id: string
  customer_id: string
  staff_id: string
  service_ids: string[]
  actual_services: string[]
  total_price_cents: number
  notes: string
  status: string
}

interface TreatmentManagementProps {
  selectedDate: Date
}

export function TreatmentManagement({ selectedDate }: TreatmentManagementProps) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [treatmentServices, setTreatmentServices] = useState<string[]>([])
  const [assignedStaff, setAssignedStaff] = useState('')
  const [treatmentNotes, setTreatmentNotes] = useState('')
  const [actualCustomer, setActualCustomer] = useState<any>(null)
  const [isDifferentCustomer, setIsDifferentCustomer] = useState(false)
  const [newCustomerInfo, setNewCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    relationship: ''
  })

  const { toast } = useToast()
  const router = useRouter()

  const fetchBookings = async () => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0]
      const response = await fetch(`/api/bookings?date=${dateStr}`)
      if (response.ok) {
        const data = await response.json()
        setBookings(data || [])
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    }
  }

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services')
      if (response.ok) {
        const data = await response.json()
        setServices(data || [])
      }
    } catch (error) {
      console.error('Error fetching services:', error)
    }
  }

  const fetchStaff = async () => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0]
      const response = await fetch(`/api/staff?date=${dateStr}`)
      if (response.ok) {
        const data = await response.json()
        setStaff(data || [])
      }
    } catch (error) {
      console.error('Error fetching staff:', error)
    }
  }

  useEffect(() => {
    fetchBookings()
    fetchServices()
    fetchStaff()
  }, [selectedDate])

  const handleBookingSelect = (booking: Booking) => {
    setSelectedBooking(booking)
    // Parse original booking services from notes
    try {
      const notesData = booking.notes
      const servicesMatch = notesData.match(/Services: (\[[^\]]+\])/)
      if (servicesMatch) {
        const originalServices = JSON.parse(servicesMatch[1])
        setTreatmentServices(originalServices.map(String))
      }
    } catch (error) {
      console.error('Error parsing booking services:', error)
      setTreatmentServices([])
    }
    
    setTreatmentNotes('')
    setIsDifferentCustomer(false)
    setActualCustomer(null)
  }

  const calculateTotalPrice = () => {
    return treatmentServices.reduce((total, serviceId) => {
      const service = services.find(s => s.id === serviceId)
      return total + (service?.base_price_cents || 0)
    }, 0)
  }

  const handleServiceToggle = (serviceId: string) => {
    setTreatmentServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  const saveTreatment = async () => {
    if (!selectedBooking || !assignedStaff) {
      toast({
        title: 'Required Information Missing',
        description: 'Please select booking and assigned staff.',
        variant: 'destructive'
      })
      return
    }

    try {
      let customerId = selectedBooking.customer_id
      
      // Handle different customer case
      if (isDifferentCustomer && newCustomerInfo.name && newCustomerInfo.phone) {
        const customerResponse = await fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newCustomerInfo.name,
            phone: newCustomerInfo.phone,
            email: newCustomerInfo.email,
            relationship_to_booker: newCustomerInfo.relationship,
            related_customer_id: selectedBooking.customer_id
          })
        })
        
        if (customerResponse.ok) {
          const newCustomer = await customerResponse.json()
          customerId = newCustomer.id
        }
      }

      const treatmentData = {
        booking_id: selectedBooking.id,
        customer_id: customerId,
        staff_id: assignedStaff,
        service_ids: treatmentServices,
        total_price_cents: calculateTotalPrice(),
        notes: treatmentNotes,
        treatment_date: selectedDate.toISOString().split('T')[0]
      }

      const response = await fetch('/api/treatments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(treatmentData)
      })

      if (response.ok) {
        toast({
          title: 'Treatment Information Saved',
          description: 'Treatment history has been successfully saved.'
        })
        // Reset form
        setSelectedBooking(null)
        setTreatmentServices([])
        setAssignedStaff('')
        setTreatmentNotes('')
        setIsDifferentCustomer(false)
        setNewCustomerInfo({ name: '', phone: '', email: '', relationship: '' })
      } else {
        throw new Error('Failed to save treatment')
      }
    } catch (error) {
      console.error('Error saving treatment:', error)
      toast({
        title: 'Save Failed',
        description: 'An error occurred while saving treatment information.',
        variant: 'destructive'
      })
    }
  }

  const handleRebooking = (booking: Booking) => {
    // Navigate to booking page with rebooking data
    const rebookingData = {
      source: 'rebooking',
      booking_id: booking.id,
      customer_id: booking.customer_id,
      phone: booking.notes.match(/Phone: ([^|]+)/)?.[1] || '',
      name: booking.notes.match(/Name: ([^|]+)/)?.[1] || ''
    }
    
    // Store rebooking data in sessionStorage for booking page
    sessionStorage.setItem('rebookingData', JSON.stringify(rebookingData))
    router.push('/booking')
  }

  const groupedServices = services.reduce((acc, service) => {
    const category = service.category || 'Other Services'
    if (!acc[category]) acc[category] = []
    acc[category].push(service)
    return acc
  }, {} as Record<string, Service[]>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Treatment Management - {format(selectedDate, 'MMM dd, yyyy')}
          </CardTitle>
          <CardDescription>
            Manage actual treatment details for booked customers on the selected date
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Booking List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Booking List
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {bookings.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No bookings for this date.</p>
            ) : (
              bookings.map((booking) => {
                // Safe date parsing to avoid Invalid time value error
                let bookingTime = 'Time TBD'
                try {
                  if (booking.booking_time) {
                    const date = new Date(booking.booking_time)
                    if (!isNaN(date.getTime())) {
                      bookingTime = date.toLocaleTimeString('ko-KR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })
                    }
                  }
                } catch (error) {
                  console.error('Date parsing error:', error)
                }
                
                const customerName = booking.notes?.match(/Name: ([^|]+)/)?.[1] || 'No Customer Name'
                const customerPhone = booking.notes?.match(/Phone: ([^|]+)/)?.[1] || ''
                
                return (
                  <div
                    key={booking.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedBooking?.id === booking.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleBookingSelect(booking)}
                    data-testid={`booking-${booking.id}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">{customerName}</div>
                        <div className="text-sm text-gray-600">{customerPhone}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {bookingTime}
                        </div>
                      </div>
                      <Badge variant="secondary">{booking.status}</Badge>
                    </div>
                    <div className="mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRebooking(booking)
                        }}
                        className="w-full"
                        data-testid={`rebooking-${booking.id}`}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Rebooking
                      </Button>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* Right: Treatment Details */}
        {selectedBooking && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Treatment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Staff Assignment */}
              <div>
                <Label htmlFor="staff-select">Assigned Staff</Label>
                <Select value={assignedStaff} onValueChange={setAssignedStaff}>
                  <SelectTrigger data-testid="staff-select">
                    <SelectValue placeholder="Select assigned staff" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.firstName} {member.lastName} - {member.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Different Customer Toggle */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="different-customer"
                  checked={isDifferentCustomer}
                  onChange={(e) => setIsDifferentCustomer(e.target.checked)}
                  data-testid="different-customer-checkbox"
                />
                <Label htmlFor="different-customer">Actual customer is different from the booker</Label>
              </div>

              {/* New Customer Info */}
              {isDifferentCustomer && (
                <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
                  <Label>Actual Customer Information</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Input
                        placeholder="Name"
                        value={newCustomerInfo.name}
                        onChange={(e) => setNewCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                        data-testid="new-customer-name"
                      />
                    </div>
                    <div>
                      <Input
                        placeholder="Phone Number"
                        value={newCustomerInfo.phone}
                        onChange={(e) => setNewCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                        data-testid="new-customer-phone"
                      />
                    </div>
                    <div>
                      <Input
                        placeholder="Email (optional)"
                        value={newCustomerInfo.email}
                        onChange={(e) => setNewCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                        data-testid="new-customer-email"
                      />
                    </div>
                    <div>
                      <Select 
                        value={newCustomerInfo.relationship} 
                        onValueChange={(value) => setNewCustomerInfo(prev => ({ ...prev, relationship: value }))}
                      >
                        <SelectTrigger data-testid="relationship-select">
                          <SelectValue placeholder="Relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="family">Family</SelectItem>
                          <SelectItem value="friend">Friend</SelectItem>
                          <SelectItem value="colleague">Colleague</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Service Selection */}
              <div className="space-y-3">
                <Label>Treatment Services (modifiable based on original booking)</Label>
                <div className="max-h-64 overflow-y-auto border rounded-lg p-3">
                  {Object.entries(groupedServices).map(([categoryName, categoryServices]) => (
                    <div key={categoryName} className="mb-4">
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">{categoryName}</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {categoryServices.map((service) => (
                          <div
                            key={service.id}
                            className={`p-2 border rounded cursor-pointer transition-all ${
                              treatmentServices.includes(service.id)
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => handleServiceToggle(service.id)}
                            data-testid={`treatment-service-${service.id}`}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-medium text-sm">{service.name}</div>
                                <div className="text-xs text-gray-500">{service.duration_min} min</div>
                              </div>
                              <div className="text-sm font-medium">
                                ${(service.base_price_cents / 100).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Price */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Amount:</span>
                  <span className="font-bold text-lg">
                    ${(calculateTotalPrice() / 100).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Treatment Notes */}
              <div>
                <Label htmlFor="treatment-notes">Treatment Notes</Label>
                <Textarea
                  id="treatment-notes"
                  placeholder="Record any special notes or customer requests during treatment..."
                  value={treatmentNotes}
                  onChange={(e) => setTreatmentNotes(e.target.value)}
                  data-testid="treatment-notes"
                />
              </div>

              {/* Save Button */}
              <Button 
                onClick={saveTreatment} 
                className="w-full"
                data-testid="save-treatment"
              >
                Save Treatment Information
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}