'use client'

import { DashboardTabs } from '@/components/dashboard-tabs'
import { LoginPage } from '@/components/login-page'
import { useAuth } from '@/components/auth-provider'

export default function AdminPage() {
  const { username, isLoggedIn, userRole, logout } = useAuth()

  if (!isLoggedIn) {
    return <LoginPage />
  }

  // Create a user object compatible with DashboardTabs
  const currentUser = {
    id: 1,
    username: username,
    firstName: username.split(' ')[0] || username,
    lastName: username.split(' ')[1] || '',
    role: userRole,
    position: userRole === 'admin' ? 'Administrator' : userRole === 'manager' ? 'Manager' : 'Staff',
    email: `${username}@connienail.com`,
    permissions: userRole === 'admin' ? ['super_admin'] : userRole === 'manager' ? ['admin'] : ['editor']
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardTabs currentUser={currentUser} logout={logout} />
      </main>
    </div>
  )
}