'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { CreditCard, Percent } from 'lucide-react'

// Initialize Stripe
// For demo purposes, we'll use a test key that won't actually process payments
const stripePromise = loadStripe('pk_test_demo_key_for_ui_testing')

export interface PaymentCheckoutProps {
  amount: number
  discountRate?: number
  onSuccess: () => void
  onCancel: () => void
}

const CheckoutForm = ({ amount, discountRate = 0, onSuccess, onCancel }: PaymentCheckoutProps) => {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const discountedAmount = amount * (1 - discountRate / 100)
  const discountAmount = amount - discountedAmount

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setLoading(true)

    const cardElement = elements.getElement(CardElement)

    if (!cardElement) {
      setLoading(false)
      return
    }

    try {
      // Create payment intent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          amount: discountedAmount / 100 // Convert to dollars for Stripe
        })
      })

      const { clientSecret } = await response.json()

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement
        }
      })

      if (error) {
        toast({
          title: "payment 실패",
          description: error.message,
          variant: "destructive"
        })
      } else if (paymentIntent?.status === 'succeeded') {
        toast({
          title: "payment completed",
          description: "payment가 성공적으로 process되었습니다!",
        })
        onSuccess()
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast({
        title: "payment 오류",
        description: "payment process 중 오류가 발생했습니다.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5" />
            payment information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {discountRate > 0 && (
            <div className="bg-green-50 p-3 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-green-700 font-medium">
                <Percent className="h-4 w-4" />
                온라인 payment 특별 할인 {discountRate}%
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span>원가:</span>
                  <span>${amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>할인:</span>
                  <span>-${discountAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-center font-bold text-lg">
              <span>최종 payment 금액:</span>
              <span className="text-blue-600">${discountedAmount.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">카드 information</label>
            <div className="border rounded-md p-3">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex gap-2">
        <Button 
          type="submit" 
          disabled={!stripe || loading}
          className="flex-1"
          data-testid="button-confirm-payment"
        >
          {loading ? 'process 중...' : `$${discountedAmount.toLocaleString()} payment하기`}
        </Button>
        
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={loading}
          data-testid="button-cancel-payment"
        >
          cancelled
        </Button>
      </div>
    </form>
  )
}

export function PaymentCheckout(props: PaymentCheckoutProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  )
}