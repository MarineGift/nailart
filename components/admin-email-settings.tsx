'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Mail, Save, CheckCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface AdminEmailSettings {
  admin_email: string
  notification_enabled: boolean
  booking_notifications: boolean
  payment_notifications: boolean
}

export function AdminEmailSettings() {
  const [settings, setSettings] = useState<AdminEmailSettings>({
    admin_email: '',
    notification_enabled: true,
    booking_notifications: true,
    payment_notifications: true
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/settings/admin-email')
      if (response.ok) {
        const data = await response.json()
        setSettings(prevSettings => ({ ...prevSettings, ...data }))
      }
    } catch (error) {
      console.error('Error fetching admin email settings:', error)
    }
    setLoading(false)
  }

  const handleSave = async () => {
    if (!settings.admin_email || !settings.admin_email.includes('@')) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive'
      })
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/settings/admin-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        toast({
          title: 'Settings Saved',
          description: 'Admin email settings have been updated successfully'
        })
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving admin email settings:', error)
      toast({
        title: 'Save Failed',
        description: 'Failed to save admin email settings',
        variant: 'destructive'
      })
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-purple-600" />
            Admin Email Configuration
          </CardTitle>
          <CardDescription>
            Configure administrator email for notifications and system alerts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="admin_email">Administrator Email Address</Label>
            <Input
              id="admin_email"
              type="email"
              placeholder="admin@connienail.com"
              value={settings.admin_email}
              onChange={(e) => setSettings({ ...settings, admin_email: e.target.value })}
              className="max-w-md"
            />
            <p className="text-sm text-gray-600">
              This email will receive booking confirmations, payment notifications, and system alerts
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Notification Preferences</h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="notification_enabled"
                  checked={settings.notification_enabled}
                  onChange={(e) => setSettings({ ...settings, notification_enabled: e.target.checked })}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <Label htmlFor="notification_enabled" className="text-sm">
                  Enable email notifications
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="booking_notifications"
                  checked={settings.booking_notifications}
                  onChange={(e) => setSettings({ ...settings, booking_notifications: e.target.checked })}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  disabled={!settings.notification_enabled}
                />
                <Label htmlFor="booking_notifications" className="text-sm">
                  Booking confirmation emails
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="payment_notifications"
                  checked={settings.payment_notifications}
                  onChange={(e) => setSettings({ ...settings, payment_notifications: e.target.checked })}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  disabled={!settings.notification_enabled}
                />
                <Label htmlFor="payment_notifications" className="text-sm">
                  Payment confirmation emails
                </Label>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Email Settings
            </Button>
          </div>

          {settings.admin_email && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Email Configuration Active</p>
                  <p className="text-sm text-green-700">
                    Notifications will be sent to: <span className="font-mono">{settings.admin_email}</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}