'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
// Temporary inline Alert component until UI is fixed
const Alert = ({ children, variant, ...props }: { children: React.ReactNode, variant?: 'destructive' | 'default' }) => (
  <div className={`p-3 rounded-lg border ${variant === 'destructive' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`} {...props}>
    {children}
  </div>
)
const AlertDescription = ({ children }: { children: React.ReactNode }) => <div>{children}</div>
import { useAuth } from '@/components/auth-provider'
import { LogIn, User, Shield } from 'lucide-react'

export function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password.')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Mock user credentials
      const users = {
        'admin': { password: 'admin123', role: 'admin', name: 'Admin User' },
        'manager': { password: 'manager123', role: 'manager', name: 'Manager User' },
        'staff1': { password: 'staff123', role: 'staff', name: 'Staff Member' },
        'jane': { password: 'jane123', role: 'staff', name: 'Jane Smith' },
        'jessica': { password: 'jessica123', role: 'staff', name: 'Jessica Brown' }
      }

      const user = users[username as keyof typeof users]
      
      if (user && user.password === password) {
        login(user.role, user.name)
        setError('')
      } else {
        setError('Login failed. Please check your username and password.')
      }
    } catch (error) {
      setError('An error occurred during login.')
    } finally {
      setLoading(false)
    }
  }

  const quickLogin = async (role: string, username: string, name: string) => {
    setLoading(true)
    setError('')
    try {
      login(role, name)
      setError('')
    } catch (error) {
      setError('An error occurred during login.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            ConnieNail
          </h1>
          <p className="text-gray-600 mt-2">Staff Management System</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogIn className="h-5 w-5" />
              Login
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  data-testid="input-username"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  data-testid="input-password"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
                data-testid="button-login"
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="h-4 w-4" />
              Test Accounts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => quickLogin('admin', 'admin', 'Admin User')}
              disabled={loading}
              data-testid="button-admin-login"
            >
              <Shield className="h-4 w-4 mr-2 text-red-500" />
              Admin Login (admin / admin123)
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => quickLogin('manager', 'manager', 'Manager User')}
              disabled={loading}
              data-testid="button-manager-login"
            >
              <Shield className="h-4 w-4 mr-2 text-yellow-500" />
              Manager Login (manager / manager123)
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => quickLogin('staff', 'staff1', 'Staff Member')}
              disabled={loading}
              data-testid="button-staff-login"
            >
              <User className="h-4 w-4 mr-2 text-blue-500" />
              Staff Login (staff1 / staff123)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}