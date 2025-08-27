'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  role: 'admin' | 'manager' | 'staff'
  position: string
  status: string
}

interface AuthContextType {
  currentUser: Employee | null
  login: (staffId: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  hasPermission: (requiredRole: 'admin' | 'manager' | 'staff') => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Employee | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check for stored authentication
    const storedUser = localStorage.getItem('connienail_user')
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        setCurrentUser(user)
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('connienail_user')
      }
    }
  }, [])

  const login = async (staffId: string): Promise<boolean> => {
    try {
      // Staff ID based authentication
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId })
      })

      if (response.ok) {
        const user = await response.json()
        setCurrentUser(user)
        setIsAuthenticated(true)
        localStorage.setItem('connienail_user', JSON.stringify(user))
        return true
      }
      
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = async () => {
    // Record logout time in login_info table
    if (currentUser) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ staffId: currentUser.id })
        })
      } catch (error) {
        console.error('Failed to record logout:', error)
      }
    }
    
    setCurrentUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('connienail_user')
  }

  const hasPermission = (requiredRole: 'admin' | 'manager' | 'staff'): boolean => {
    if (!currentUser) return false
    
    const roleHierarchy = { admin: 3, manager: 2, staff: 1 }
    const userLevel = roleHierarchy[currentUser.role] || 0
    const requiredLevel = roleHierarchy[requiredRole] || 0
    
    return userLevel >= requiredLevel
  }

  return (
    <AuthContext.Provider value={{
      currentUser,
      login,
      logout,
      isAuthenticated,
      hasPermission
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}