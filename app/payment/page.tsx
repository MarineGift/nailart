// app/payment/page.tsx
import { Suspense } from "react";
import PaymentClient from "./payment-client";

export const dynamic = "force-dynamic"; // 사전 렌더/ISR 제외 (CSR로 처리)
// export const revalidate = 0;         // 위 대신 이 옵션을 사용해도 됨

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
