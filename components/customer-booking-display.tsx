'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  User, Clock, Phone, Globe, RotateCcw, MapPin, 
  CreditCard, DollarSign, Star, FileText, Calendar,
  CheckCircle, XCircle, AlertCircle
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface BookingSource {
  id: number
  name: string
  description: string
}

interface PaymentRecord {
  id: number
  payment_method: string
  amount: number
  tip_amount: number
  total_amount: number
  cash_received?: number
  change_given?: number
  credit_card?: {
    card_last_four: string
    card_type: string
    cardholder_name: string
  }
  transaction_id?: string
  payment_status: string
  payment_date: string
  notes?: string
}

interface CustomerBooking {
  id: number
  customer_name: string
  customer_email: string
  customer_phone: string
  booking_date: string
  time_slot: string
  actual_visit_time?: string
  booking_source: BookingSource
  service_name: string
  service_details: string
  actual_start_time?: string
  actual_end_time?: string
  actual_duration?: number
  price: number
  tip_amount: number
  final_amount: number
  payment_method: string
  payment_records: PaymentRecord[]
  customer_satisfaction?: number
  is_rescheduled: boolean
  no_show: boolean
  next_appointment_date?: string
  service_notes?: string
  status: string
  staff_name: string
}

interface CustomerBookingDisplayProps {
  staffId?: string
  currentUser: any
}

export function CustomerBookingDisplay({ staffId, currentUser }: CustomerBookingDisplayProps) {
  const [bookings, setBookings] = useState<CustomerBooking[]>([])
  const [selectedBooking, setSelectedBooking] = useState<CustomerBooking | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const { toast } = useToast()

  // Sample data for demonstration
  const sampleBookings: CustomerBooking[] = [
    {
      id: 1,
      customer_name: 'Sarah Johnson',
      customer_email: 'sarah.j@email.com',
      customer_phone: '(555) 123-4567',
      booking_date: '2025-08-22T10:00:00Z',
      time_slot: '10:00 AM',
      actual_visit_time: '2025-08-22T10:15:00Z',
      booking_source: { id: 1, name: 'Internet', description: 'Online booking through website' },
      service_name: 'Gel Manicure with Nail Art',
      service_details: 'Full gel manicure with custom nail art design',
      actual_start_time: '2025-08-22T10:20:00Z',
      actual_end_time: '2025-08-22T11:35:00Z',
      actual_duration: 75,
      price: 75.00,
      tip_amount: 15.00,
      final_amount: 90.00,
      payment_method: 'Credit Card',
      payment_records: [{
        id: 1,
        payment_method: 'credit_card',
        amount: 75.00,
        tip_amount: 15.00,
        total_amount: 90.00,
        credit_card: {
          card_last_four: '4532',
          card_type: 'Visa',
          cardholder_name: 'Sarah Johnson'
        },
        transaction_id: 'TXN_20250822_001',
        payment_status: 'completed',
        payment_date: '2025-08-22T11:35:00Z',
        notes: 'Payment processed successfully'
      }],
      customer_satisfaction: 5,
      is_rescheduled: false,
      no_show: false,
      next_appointment_date: '2025-09-21T10:00:00Z',
      service_notes: 'Customer requested special design with rhinestones',
      status: 'completed',
      staff_name: 'Emma Davis'
    },
    {
      id: 2,
      customer_name: 'Emma Davis',
      customer_email: 'emma.d@email.com',
      customer_phone: '(555) 234-5678',
      booking_date: '2025-08-22T14:30:00Z',
      time_slot: '2:30 PM',
      actual_visit_time: '2025-08-22T14:30:00Z',
      booking_source: { id: 2, name: 'Phone', description: 'Booking via phone call' },
      service_name: 'Classic Pedicure',
      service_details: 'Standard pedicure with polish',
      actual_start_time: '2025-08-22T14:35:00Z',
      actual_end_time: '2025-08-22T15:35:00Z',
      actual_duration: 60,
      price: 45.00,
      tip_amount: 9.00,
      final_amount: 54.00,
      payment_method: 'Cash',
      payment_records: [{
        id: 2,
        payment_method: 'cash',
        amount: 45.00,
        tip_amount: 9.00,
        total_amount: 54.00,
        cash_received: 60.00,
        change_given: 6.00,
        payment_status: 'completed',
        payment_date: '2025-08-22T15:35:00Z'
      }],
      customer_satisfaction: 4,
      is_rescheduled: false,
      no_show: false,
      service_notes: 'Regular customer, prefers classic style',
      status: 'completed',
      staff_name: 'Lisa Chen'
    },
    {
      id: 3,
      customer_name: 'Lisa Anderson',
      customer_email: 'lisa.a@email.com',
      customer_phone: '(555) 345-6789',
      booking_date: '2025-08-22T16:00:00Z',
      time_slot: '4:00 PM',
      booking_source: { id: 3, name: 'Rebooking', description: 'Rescheduled from previous appointment' },
      service_name: 'Acrylic Extensions with French Tips',
      service_details: 'Full set acrylic extensions with classic French manicure',
      actual_start_time: '2025-08-22T16:10:00Z',
      actual_end_time: '2025-08-22T18:05:00Z',
      actual_duration: 115,
      price: 95.00,
      tip_amount: 20.00,
      final_amount: 115.00,
      payment_method: 'Credit Card',
      payment_records: [{
        id: 3,
        payment_method: 'credit_card',
        amount: 95.00,
        tip_amount: 20.00,
        total_amount: 115.00,
        credit_card: {
          card_last_four: '1234',
          card_type: 'MasterCard',
          cardholder_name: 'Lisa Anderson'
        },
        transaction_id: 'TXN_20250822_003',
        payment_status: 'completed',
        payment_date: '2025-08-22T18:05:00Z'
      }],
      customer_satisfaction: 5,
      is_rescheduled: true,
      no_show: false,
      service_notes: 'New customer, very satisfied with service',
      status: 'completed',
      staff_name: 'Sarah Kim'
    }
  ]

  useEffect(() => {
    setBookings(sampleBookings)
    setLoading(false)
  }, [])

  const getBookingSourceIcon = (sourceName: string) => {
    switch (sourceName.toLowerCase()) {
      case 'internet': return <Globe className="h-4 w-4" />
      case 'phone': return <Phone className="h-4 w-4" />
      case 'rebooking': return <RotateCcw className="h-4 w-4" />
      case 'walk-in': return <MapPin className="h-4 w-4" />
      default: return <Calendar className="h-4 w-4" />
    }
  }

  const getBookingSourceColor = (sourceName: string) => {
    switch (sourceName.toLowerCase()) {
      case 'internet': return 'bg-blue-100 text-blue-800'
      case 'phone': return 'bg-green-100 text-green-800'
      case 'rebooking': return 'bg-orange-100 text-orange-800'
      case 'walk-in': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSatisfactionStars = (rating?: number) => {
    if (!rating) return null
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm ml-1">({rating}/5)</span>
      </div>
    )
  }

  const getStatusIcon = (booking: CustomerBooking) => {
    if (booking.no_show) return <XCircle className="h-4 w-4 text-red-500" />
    if (booking.is_rescheduled) return <RotateCcw className="h-4 w-4 text-orange-500" />
    if (booking.status === 'completed') return <CheckCircle className="h-4 w-4 text-green-500" />
    return <AlertCircle className="h-4 w-4 text-blue-500" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Customer Service Details</h2>
          <p className="text-gray-600">Complete booking flow and service information</p>
        </div>
      </div>

      <div className="space-y-4">
        {bookings.map((booking) => (
          <Card key={booking.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                {/* Customer Info */}
                <div className="lg:col-span-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {booking.customer_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">{booking.customer_name}</p>
                      <p className="text-xs text-gray-500">{booking.customer_phone}</p>
                    </div>
                  </div>
                </div>

                {/* Booking Time */}
                <div className="lg:col-span-1">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Booking Time</p>
                    <p className="font-medium text-sm">{booking.time_slot}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(booking.booking_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Booking Source */}
                <div className="lg:col-span-1">
                  <div className="flex justify-center">
                    <Badge className={`${getBookingSourceColor(booking.booking_source.name)} text-xs px-2 py-1`}>
                      <div className="flex items-center gap-1">
                        {getBookingSourceIcon(booking.booking_source.name)}
                        {booking.booking_source.name}
                      </div>
                    </Badge>
                  </div>
                </div>

                {/* Visit Time */}
                <div className="lg:col-span-1">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Visit Time</p>
                    <p className="font-medium text-sm">
                      {booking.actual_visit_time 
                        ? new Date(booking.actual_visit_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '-'
                      }
                    </p>
                  </div>
                </div>

                {/* Service Time */}
                <div className="lg:col-span-1">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Service Time</p>
                    <p className="font-medium text-sm">{booking.actual_duration || 0} min</p>
                  </div>
                </div>

                {/* Treatment Details */}
                <div className="lg:col-span-2">
                  <div>
                    <p className="font-medium text-sm">{booking.service_name}</p>
                    <p className="text-xs text-gray-500">{booking.service_details}</p>
                    <p className="text-xs text-blue-600 mt-1">By: {booking.staff_name}</p>
                  </div>
                </div>

                {/* Cost & Tip */}
                <div className="lg:col-span-1">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Cost</p>
                    <p className="font-medium text-sm">${booking.price.toFixed(2)}</p>
                    <p className="text-xs text-green-600">Tip: ${booking.tip_amount.toFixed(2)}</p>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="lg:col-span-1">
                  <div className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedBooking(booking)
                        setIsPaymentDialogOpen(true)
                      }}
                      className="h-auto p-1"
                    >
                      <div className="flex flex-col items-center">
                        {booking.payment_method === 'Cash' ? (
                          <DollarSign className="h-4 w-4 text-green-600" />
                        ) : (
                          <CreditCard className="h-4 w-4 text-blue-600" />
                        )}
                        <span className="text-xs">{booking.payment_method}</span>
                      </div>
                    </Button>
                  </div>
                </div>

                {/* Status & Satisfaction */}
                <div className="lg:col-span-2">
                  <div className="text-center space-y-1">
                    <div className="flex items-center justify-center gap-2">
                      {getStatusIcon(booking)}
                      <span className="text-xs capitalize">{booking.status}</span>
                    </div>
                    {booking.customer_satisfaction && (
                      <div className="flex justify-center">
                        {getSatisfactionStars(booking.customer_satisfaction)}
                      </div>
                    )}
                    {booking.next_appointment_date && (
                      <p className="text-xs text-purple-600">
                        Next: {new Date(booking.next_appointment_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes */}
              {booking.service_notes && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                    <p className="text-sm text-gray-600">{booking.service_notes}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment Details Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              Payment information for {selectedBooking?.customer_name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && selectedBooking.payment_records.length > 0 && (
            <div className="space-y-4">
              {selectedBooking.payment_records.map((payment) => (
                <div key={payment.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Payment #{payment.id}</h4>
                    <Badge variant={payment.payment_status === 'completed' ? 'default' : 'secondary'}>
                      {payment.payment_status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Service Amount:</span>
                      <span>${payment.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tip Amount:</span>
                      <span>${payment.tip_amount.toFixed(2)}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>${payment.total_amount.toFixed(2)}</span>
                    </div>
                  </div>

                  {payment.payment_method === 'cash' && (
                    <div className="mt-3 pt-3 border-t space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Cash Received:</span>
                        <span>${payment.cash_received?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Change Given:</span>
                        <span>${payment.change_given?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>
                  )}

                  {payment.payment_method === 'credit_card' && payment.credit_card && (
                    <div className="mt-3 pt-3 border-t space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Card Type:</span>
                        <span>{payment.credit_card.card_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Card Number:</span>
                        <span>****{payment.credit_card.card_last_four}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cardholder:</span>
                        <span>{payment.credit_card.cardholder_name}</span>
                      </div>
                      {payment.transaction_id && (
                        <div className="flex justify-between">
                          <span>Transaction ID:</span>
                          <span className="text-xs">{payment.transaction_id}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                    <p>Payment Date: {new Date(payment.payment_date).toLocaleString()}</p>
                    {payment.notes && <p>Notes: {payment.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}