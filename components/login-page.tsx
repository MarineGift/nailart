'use client'

import { useState } from 'react'
import { LogIn, User, Shield } from 'lucide-react'

interface LoginPageProps {
  onLogin?: (user: { username: string, role: string }) => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
        if (onLogin) {
          onLogin({ username: user.name, role: user.role })
        }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            ConnieNail Login
          </h1>
          <p className="text-gray-600 mt-2">Please sign in to continue</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  placeholder="Enter your username"
                  disabled={loading}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  <Shield className="w-4 h-4 inline mr-2" />
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg border bg-red-50 border-red-200 text-red-800">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center mb-3">Demo Credentials:</p>
            <div className="space-y-1 text-xs text-gray-400 text-center">
              <p><strong>Admin:</strong> admin / admin123</p>
              <p><strong>Manager:</strong> manager / manager123</p>
              <p><strong>Staff:</strong> staff1 / staff123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}