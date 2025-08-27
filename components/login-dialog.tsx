'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { LogIn, User } from 'lucide-react'

interface LoginDialogProps {
  onLogin: (userRole: string, username: string) => void
  isLoggedIn: boolean
  username: string
  userRole: string
  onLogout: () => void
}

export function LoginDialog({ onLogin, isLoggedIn, username, userRole, onLogout }: LoginDialogProps) {
  const [open, setOpen] = useState(false)
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  })
  const { toast } = useToast()

  // Mock user credentials - in real app this would be from database
  const users = {
    'admin': { password: 'admin123', role: 'admin', name: 'Admin User' },
    'manager': { password: 'manager123', role: 'manager', name: 'Manager User' },
    'staff1': { password: 'staff123', role: 'staff', name: 'Staff Member' },
    'jane': { password: 'jane123', role: 'staff', name: 'Jane Smith' },
    'jessica': { password: 'jessica123', role: 'staff', name: 'Jessica Brown' }
  }

  const handleLogin = () => {
    const user = users[loginForm.username as keyof typeof users]
    
    if (user && user.password === loginForm.password) {
      onLogin(user.role, user.name)
      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.name}!`,
      })
      setOpen(false)
      setLoginForm({ username: '', password: '' })
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid username or password",
        variant: "destructive"
      })
    }
  }

  const handleLogout = () => {
    onLogout()
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    })
  }

  if (isLoggedIn) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
          <User className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium">{username}</span>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            {userRole}
          </span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleLogout}
          className="bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white"
          data-testid="button-logout"
        >
          Logout
        </Button>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white"
          data-testid="button-login"
        >
          <LogIn className="h-4 w-4 mr-1" />
          Login
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Login</DialogTitle>
          <DialogDescription>
            Enter your credentials to access the system
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={loginForm.username}
              onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
              placeholder="Enter username"
              data-testid="input-username"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
              placeholder="Enter password"
              data-testid="input-password"
            />
          </div>
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <p className="font-medium mb-2">Demo Credentials:</p>
            <p>Admin: admin / admin123</p>
            <p>Manager: manager / manager123</p>
            <p>Staff: staff1 / staff123</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleLogin} data-testid="button-login-submit">
              Login
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}