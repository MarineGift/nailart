"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import {
  CreditCard, Calendar, Clock, User, Scissors, DollarSign, CheckCircle, AlertCircle,
} from "lucide-react";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";

interface BookingDetails {
  id: string;
  customerName: string;
  serviceName: string;
  staffName: string;
  date: string;
  time: string;
  price: number;    // USD
  duration: number; // minutes
}

/** ------- Payment Form (Elements 내부에서만 렌더) ------- */
function PaymentForm({
  bookingDetails,
  discountRate,
}: {
  bookingDetails: BookingDetails | null;
  discountRate: number;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);

  const originalAmount = bookingDetails?.price || 0;
  const discountAmount = originalAmount * (discountRate / 100);
  const finalAmount = Math.max(0, originalAmount - discountAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !bookingDetails) return;

    setProcessing(true);
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking-confirmation?booking_id=${bookingDetails.id}`,
        },
      });
      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button
        type="submit"
        className="w-full"
        disabled={!stripe || !elements || processing}
        data-testid="button-complete-payment"
      >
        {processing ? "Processing..." : `Pay $${finalAmount.toFixed(2)}`}
      </Button>
    </form>
  );
}

/** ---------------- Payment Client ---------------- */
export default function PaymentClient() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [clientSecret, setClientSecret] = useState<string>("");
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [discountRate, setDiscountRate] = useState(0);

  const bookingId = useMemo(() => searchParams.get("booking_id") || "", [searchParams]);

  // 금액은 "39.99" 형태 또는 "$39.99"도 허용
  const amountStrRaw = useMemo(() => searchParams.get("amount") || "", [searchParams]);
  const amountStr = useMemo(
    () => amountStrRaw.replace(/[^\d.]/g, ""),
    [amountStrRaw]
  );

  useEffect(() => {
    // Stripe publishable key 검증 및 초기화
    if (publishableKey) {
      setStripePromise(loadStripe(publishableKey));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!bookingId || !amountStr) {
        toast({
          title: "Invalid Payment Link",
          description: "Missing booking information. Please start from the booking page.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const originalAmountUsd = Number.parseFloat(amountStr);
      if (!Number.isFinite(originalAmountUsd) || originalAmountUsd <= 0) {
        toast({
          title: "Invalid Amount",
          description: "Payment amount is invalid.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // 1) 할인율 로드
      const fetchDiscountRate = async (): Promise<number> => {
        try {
          const res = await fetch("/api/settings/discount", { cache: "no-store" });
          if (res.ok) {
            const data = await res.json();
            const rate = Number(data?.rate) || 0;
            if (!cancelled) setDiscountRate(rate);
            return rate;
          }
        } catch {
          /* noop */
        }
        return 0;
      };

      // 2) Payment Intent 생성
      const createPaymentIntent = async (discount: number) => {
        try {
          const discountUsd = originalAmountUsd * (discount / 100);
          const finalUsd = Math.max(0, originalAmountUsd - discountUsd);
          const amountCents = Math.round(finalUsd * 100);

          const res = await fetch("/api/create-payment-intent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: amountCents, currency: "usd", booking_id: bookingId }),
          });
          if (!res.ok) throw new Error("Failed to create payment intent");
          const data = await res.json();
          if (!data?.clientSecret) throw new Error("No clientSecret in response");
          if (!cancelled) setClientSecret(data.clientSecret);
        } catch (e) {
          console.error("Payment intent error:", e);
          toast({
            title: "Payment Setup Failed",
            description: "Unable to setup payment. Please try again.",
            variant: "destructive",
          });
        }
      };

      // 3) 예약 정보 로드(선택적으로 실패 무시)
      const fetchBookingDetails = async () => {
        try {
          const res = await fetch(`/api/bookings/${bookingId}`, { cache: "no-store" });
          if (res.ok) {
            const booking = await res.json();
            if (!cancelled) {
              setBookingDetails({
                id: booking.id,
                customerName: booking.customerName || "Guest",
                serviceName: booking.serviceName || "Nail Service",
                staffName: booking.staffName || "ConnieNail Staff",
                date: new Date(booking.booking_start).toLocaleDateString(),
                time: new Date(booking.booking_start).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                price: originalAmountUsd,
                duration: booking.duration || 60,
              });
            }
          } else {
            if (!cancelled) {
              setBookingDetails({
                id: bookingId,
                customerName: "Guest",
                serviceName: "Nail Service",
                staffName: "ConnieNail Staff",
                date: "",
                time: "",
                price: originalAmountUsd,
                duration: 60,
              });
            }
          }
        } catch (e) {
          console.error("Booking details error:", e);
        }
      };

      const rate = await fetchDiscountRate();
      await Promise.all([createPaymentIntent(rate), fetchBookingDetails()]);
      if (!cancelled) setLoading(false);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [bookingId, amountStr, toast]);

  /** ----------- Loading UI ----------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Setting up your payment...</p>
        </div>
      </div>
    );
  }

  /** ----------- 초기화 실패/필수정보 누락 ----------- */
  if (!publishableKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Stripe Not Configured</h2>
            <p className="text-gray-600 mb-4">
              Missing <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code>. Please add it in Vercel →
              Project Settings → Environment Variables.
            </p>
            <Button onClick={() => window.history.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!clientSecret || !bookingDetails || !stripePromise) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Payment Setup Failed</h2>
            <p className="text-gray-600 mb-4">
              Unable to setup payment for this booking. Please try again or contact us for assistance.
            </p>
            <Button onClick={() => window.history.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /** ----------- Main UI ----------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* 상단 요약/배너 영역이 있다면 기존 코드 유지 */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 좌측: Booking Summary (원래 코드 유지 가정) */}

            {/* 우측: Payment Form */}
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
                {/* stripePromise와 clientSecret 준비 완료시에만 Elements 렌더 */}
                <Elements stripe={stripePromise} options={{ clientSecret }} key={clientSecret}>
                  <PaymentForm bookingDetails={bookingDetails} discountRate={discountRate} />
                </Elements>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
