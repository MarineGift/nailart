// Authentication placeholder
// This file should be replaced with your preferred authentication system

export interface AuthUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role: string
  department?: string
  permissions?: string[]
}

// Staff ID based authentication
export async function signIn(staffId: string): Promise<AuthUser | null> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staffId })
    })

    if (response.ok) {
      const user = await response.json()
      
      // Store user in session storage
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('connienail_user', JSON.stringify(user))
      }
      
      return user
    }
    
    return null
  } catch (error) {
    console.error('Login error:', error)
    return null
  }
}

export async function signOut(): Promise<void> {
  // Clear session storage
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('connienail_user')
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  // Check session storage for user
  if (typeof window !== 'undefined') {
    const userStr = sessionStorage.getItem('connienail_user')
    if (userStr) {
      try {
        return JSON.parse(userStr) as AuthUser
      } catch (error) {
        console.error('Error parsing user from session:', error)
        sessionStorage.removeItem('connienail_user')
      }
    }
  }
  return null
}

// Permission helper functions
export function hasPermission(user: AuthUser | null, permission: string): boolean {
  if (!user) return false
  return user.permissions?.includes('all') || user.permissions?.includes(permission) || false
}

export function canManageAdmins(user: AuthUser | null): boolean {
  return hasPermission(user, 'manage_admins') || user?.role === 'super_admin'
}

export function canManageBookings(user: AuthUser | null): boolean {
  return hasPermission(user, 'manage_bookings') || ['super_admin', 'admin'].includes(user?.role || '')
}

// Mock data functions - replace with real API calls
export async function getAdminUsers(): Promise<AuthUser[]> {
  // Return mock admin users for development
  return [
    {
      id: 'admin-001',
      email: 'admin@connienail.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'super_admin',
      department: 'Management',
      permissions: ['all']
    },
    {
      id: 'admin-002',
      email: 'manager@connienail.com',
      firstName: 'Manager',
      lastName: 'Kim',
      role: 'admin',
      department: 'Operations',
      permissions: ['manage_bookings', 'manage_customers']
    }
  ]
}

export async function createAdmin(adminData: any): Promise<AuthUser> {
  // Mock admin creation for development
  const newAdmin: AuthUser = {
    id: `admin-${Date.now()}`,
    email: adminData.email,
    firstName: adminData.firstName,
    lastName: adminData.lastName,
    role: adminData.role || 'admin',
    department: adminData.department,
    permissions: adminData.permissions || []
  }
  
  return newAdmin
}