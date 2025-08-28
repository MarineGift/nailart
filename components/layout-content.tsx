'use client'

import { Navigation } from '@/components/navigation'
import { LoginDialog } from '@/components/login-dialog'
import { useAuth } from '@/components/auth-provider'

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, userRole, username, login, logout } = useAuth()
  
  return (
    <>
      <Navigation />
      <div className="pt-12">
        {children}
      </div>
    </>
  )
}