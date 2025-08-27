'use client'

import { Navigation } from '@/components/navigation'

export function LayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      <div className="pt-12">
        {children}
      </div>
    </>
  )
}