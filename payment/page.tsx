// app/payment/page.tsx
import { Suspense } from "react";
import PaymentClient from "./payment-client";

// SSG/ISR를 강제로 끄고 동적 렌더링
export const dynamic = "force-dynamic";

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Loading payment details...</p>
          </div>
        </div>
      }
    >
      <PaymentClient />
    </Suspense>
  );
}
