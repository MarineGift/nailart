'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AuthContextType {
  isLoggedIn: boolean
  userRole: string
  username: string
  login: (role: string, name: string) => void
  logout: () => void
  hasPermission: (requiredRoles: string[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState('')
  const [username, setUsername] = useState('')

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    try {
      const savedAuth = localStorage.getItem('connie-nail-auth')
      if (savedAuth && savedAuth.trim() !== '' && savedAuth !== 'null' && savedAuth !== 'undefined') {
        const parsed = JSON.parse(savedAuth)
        if (parsed && typeof parsed === 'object' && parsed.role && parsed.name) {
          setIsLoggedIn(true)
          setUserRole(parsed.role)
          setUsername(parsed.name)
        } else {
          localStorage.removeItem('connie-nail-auth')
        }
      }
    } catch (error) {
      console.error('Error parsing stored auth:', error)
      localStorage.removeItem('connie-nail-auth')
    }
  }, [])

  const login = (role: string, name: string) => {
    setIsLoggedIn(true)
    setUserRole(role)
    setUsername(name)
    localStorage.setItem('connie-nail-auth', JSON.stringify({ role, name }))
  }

  const logout = () => {
    setIsLoggedIn(false)
    setUserRole('')
    setUsername('')
    localStorage.removeItem('connie-nail-auth')
    window.location.href = '/'
  }

  const hasPermission = (requiredRoles: string[]) => {
    return isLoggedIn && requiredRoles.includes(userRole)
  }

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      userRole,
      username,
      login,
      logout,
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