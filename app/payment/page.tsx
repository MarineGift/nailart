import PaymentPageClient from './PaymentPageClient'

// Force complete client-side rendering - no SSR at all
export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export default function PaymentPage() {
  return <PaymentPageClient />
}