'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { 
  CreditCard, 
  Calendar, 
  Clock, 
  User, 
  Scissors, 
  DollarSign,
  CheckCircle,
  AlertCircle 
} from 'lucide-react'

// Force dynamic rendering to prevent static generation
export const dynamic = 'force-dynamic'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

interface BookingDetails {
  id: string
  customerName: string
  serviceName: string
  staffName: string
  date: string
  time: string
  price: number
  duration: number
}

function PaymentForm({ bookingDetails, discountRate }: { bookingDetails: BookingDetails | null, discountRate: number }) {
  const stripe = useStripe()
  const elements = useElements()
  const { toast } = useToast()
  const [processing, setProcessing] = useState(false)
  
  const originalAmount = bookingDetails?.price || 0
  const discountAmount = originalAmount * (discountRate / 100)
  const finalAmount = originalAmount - discountAmount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements || !bookingDetails) {
      return
    }

    setProcessing(true)

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking-confirmation?booking_id=${bookingDetails.id}`,
        },
      })

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        className="w-full"
        disabled={!stripe || !elements || processing}
        data-testid="button-complete-payment"
      >
        {processing ? 'Processing...' : `Pay $${finalAmount.toFixed(2)}`}
      </Button>
    </form>
  )
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-600">Setting up your payment...</p>
      </div>
    </div>
  )
}

function ErrorDisplay() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
      <Card className="max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Payment Setup Failed</h2>
          <p className="text-gray-600 mb-4">
            Unable to setup payment for this booking. Please try again or contact us for assistance.
          </p>
          <Button onClick={() => window.history.back()}>
            Go Back
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentPage() {
  const { toast } = useToast()
  const [clientSecret, setClientSecret] = useState<string>('')
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [discountRate, setDiscountRate] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState(false)

  // Ensure component is mounted before accessing window
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Simple URL parameter extraction without Next.js hooks
    let bookingId: string | null = null
    let amount: string | null = null

    try {
      if (typeof window !== 'undefined' && window.location.search) {
        const params = window.location.search.substring(1).split('&')
        for (const param of params) {
          const [key, value] = param.split('=')
          if (key === 'booking_id') {
            bookingId = decodeURIComponent(value)
          } else if (key === 'amount') {
            amount = decodeURIComponent(value)
          }
        }
      }
    } catch (e) {
      console.error('Error parsing URL params:', e)
    }

    if (!bookingId || !amount) {
      toast({
        title: "Invalid Payment Link",
        description: "Missing booking information. Please start from the booking page.",
        variant: "destructive",
      })
      setError(true)
      setLoading(false)
      return
    }

    const initializePayment = async () => {
      try {
        // Fetch discount rate
        let discount = 0
        try {
          const discountResponse = await fetch('/api/settings/discount')
          if (discountResponse.ok) {
            const discountData = await discountResponse.json()
            discount = discountData.rate || 0
            setDiscountRate(discount)
          }
        } catch (e) {
          console.error('Error fetching discount:', e)
        }

        // Calculate final amount with discount
        const originalAmount = parseFloat(amount)
        const discountAmount = originalAmount * (discount / 100)
        const finalAmount = originalAmount - discountAmount
        
        // Create payment intent
        const paymentResponse = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: finalAmount,
            booking_id: bookingId,
          }),
        })

        if (paymentResponse.ok) {
          const paymentData = await paymentResponse.json()
          setClientSecret(paymentData.clientSecret)
        } else {
          throw new Error('Failed to create payment intent')
        }

        // Fetch booking details
        try {
          const bookingResponse = await fetch(`/api/bookings/${bookingId}`)
          if (bookingResponse.ok) {
            const booking = await bookingResponse.json()
            setBookingDetails({
              id: booking.id,
              customerName: booking.customerName || 'Guest',
              serviceName: booking.serviceName || 'Nail Service',
              staffName: booking.staffName || 'ConnieNail Staff',
              date: new Date(booking.booking_start).toLocaleDateString(),
              time: new Date(booking.booking_start).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              }),
              price: originalAmount,
              duration: booking.duration || 60
            })
          }
        } catch (e) {
          console.error('Error fetching booking details:', e)
        }

        setLoading(false)
      } catch (error) {
        console.error('Payment initialization error:', error)
        toast({
          title: "Payment Setup Failed",
          description: "Unable to setup payment. Please try again.",
          variant: "destructive",
        })
        setError(true)
        setLoading(false)
      }
    }

    initializePayment()
  }, [mounted, toast])

  // Show loading until mounted
  if (!mounted || loading) {
    return <LoadingSpinner />
  }

  if (error || !clientSecret || !bookingDetails) {
    return <ErrorDisplay />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="mb-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
              <p className="text-xl text-gray-700 mb-6">Your appointment has been successfully reserved</p>
            </div>
            
            {discountRate > 0 && (
              <div className="bg-gradient-to-r from-green-100 to-blue-100 border border-green-200 rounded-lg p-6 mb-6 max-w-2xl mx-auto">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <DollarSign className="h-6 w-6 text-green-600" />
                  <h2 className="text-2xl font-bold text-green-800">Special Online Payment Discount!</h2>
                </div>
                <p className="text-lg text-gray-700 mb-2">
                  Complete your payment online now and receive a <span className="font-bold text-green-700">{discountRate}% discount</span> on your service!
                </p>
                <p className="text-sm text-gray-600">
                  Save money and secure your appointment with our convenient online payment system
                </p>
              </div>
            )}
            
            <p className="text-lg text-gray-600">Secure payment processing for your ConnieNail appointment</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Booking Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Booking Summary
                </CardTitle>
                <CardDescription>
                  Please review your appointment details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <User className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Customer</p>
                      <p className="text-sm text-gray-600">{bookingDetails.customerName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Scissors className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Service</p>
                      <p className="text-sm text-gray-600">{bookingDetails.serviceName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <User className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Technician</p>
                      <p className="text-sm text-gray-600">{bookingDetails.staffName}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Date</p>
                        <p className="text-sm text-gray-600">{bookingDetails.date}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Clock className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Time</p>
                        <p className="text-sm text-gray-600">{bookingDetails.time}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span>Original Service Price:</span>
                    <span>${bookingDetails.price.toFixed(2)}</span>
                  </div>
                  
                  {discountRate > 0 && (
                    <div className="flex justify-between items-center mb-2 text-green-600">
                      <span>Online Payment Discount ({discountRate}%):</span>
                      <span>-${(bookingDetails.price * (discountRate / 100)).toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center mb-2">
                    <span>Tax:</span>
                    <span>$0.00</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                    <span>Final Payment Amount:</span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-5 w-5" />
                      {(bookingDetails.price - (bookingDetails.price * (discountRate / 100))).toFixed(2)}
                    </span>
                  </div>
                  
                  {discountRate > 0 && (
                    <div className="mt-2 text-center">
                      <Badge className="bg-green-100 text-green-800">
                        You Save ${(bookingDetails.price * (discountRate / 100)).toFixed(2)}!
                      </Badge>
                    </div>
                  )}
                </div>

                <Badge className="w-full justify-center bg-green-100 text-green-800">
                  Secure Payment Processing
                </Badge>
              </CardContent>
            </Card>

            {/* Payment Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
                <CardDescription>
                  Enter your payment details to complete the booking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <PaymentForm bookingDetails={bookingDetails} discountRate={discountRate} />
                </Elements>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}