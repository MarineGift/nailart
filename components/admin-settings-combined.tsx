'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Settings, Save, CheckCircle, Percent, Mail } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface AdminEmailSettings {
  admin_email: string
  notification_enabled: boolean
  booking_notifications: boolean
  payment_notifications: boolean
}

interface DiscountSettings {
  discountRate: number
}

export function AdminSettingsCombined() {
  const [emailSettings, setEmailSettings] = useState<AdminEmailSettings>({
    admin_email: '',
    notification_enabled: true,
    booking_notifications: true,
    payment_notifications: true
  })
  const [discountSettings, setDiscountSettings] = useState<DiscountSettings>({
    discountRate: 10
  })
  const [emailLoading, setEmailLoading] = useState(false)
  const [discountLoading, setDiscountLoading] = useState(false)
  const [emailSaving, setEmailSaving] = useState(false)
  const [discountSaving, setDiscountSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchEmailSettings()
    fetchDiscountSettings()
  }, [])

  const fetchEmailSettings = async () => {
    setEmailLoading(true)
    try {
      const response = await fetch('/api/settings/admin-email')
      if (response.ok) {
        const data = await response.json()
        setEmailSettings(prevSettings => ({ ...prevSettings, ...data }))
      }
    } catch (error) {
      console.error('Error fetching admin email settings:', error)
    }
    setEmailLoading(false)
  }

  const fetchDiscountSettings = async () => {
    setDiscountLoading(true)
    try {
      const response = await fetch('/api/settings/discount')
      if (response.ok) {
        const data = await response.json()
        setDiscountSettings({ discountRate: data.discountRate || 10 })
      }
    } catch (error) {
      console.error('Error fetching discount settings:', error)
    }
    setDiscountLoading(false)
  }

  const handleSaveEmailSettings = async () => {
    if (!emailSettings.admin_email || !emailSettings.admin_email.includes('@')) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive'
      })
      return
    }

    setEmailSaving(true)
    try {
      const response = await fetch('/api/settings/admin-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailSettings)
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
    setEmailSaving(false)
  }

  const handleSaveDiscountSettings = async () => {
    if (discountSettings.discountRate < 0 || discountSettings.discountRate > 50) {
      toast({
        title: 'Invalid Discount Rate',
        description: 'Discount rate must be between 0 and 50%',
        variant: 'destructive'
      })
      return
    }

    setDiscountSaving(true)
    try {
      const response = await fetch('/api/settings/discount', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(discountSettings)
      })

      if (response.ok) {
        toast({
          title: 'Settings Saved',
          description: 'Discount settings have been updated successfully'
        })
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving discount settings:', error)
      toast({
        title: 'Save Failed',
        description: 'Failed to save discount settings',
        variant: 'destructive'
      })
    }
    setDiscountSaving(false)
  }

  if (emailLoading || discountLoading) {
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
            <Settings className="h-5 w-5 text-purple-600" />
            Administrator Settings
          </CardTitle>
          <CardDescription>
            Configure administrator email and system discount settings
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Admin Email Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              Email Configuration
            </CardTitle>
            <CardDescription>
              Set up administrator email for booking notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="admin_email">Administrator Email Address</Label>
              <Input
                id="admin_email"
                type="email"
                placeholder="admin@connienail.com"
                value={emailSettings.admin_email}
                onChange={(e) => setEmailSettings({ ...emailSettings, admin_email: e.target.value })}
              />
              <p className="text-sm text-gray-600">
                This email will receive booking confirmations and system alerts
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900">Notification Preferences</h4>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="notification_enabled"
                    checked={emailSettings.notification_enabled}
                    onChange={(e) => setEmailSettings({ ...emailSettings, notification_enabled: e.target.checked })}
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
                    checked={emailSettings.booking_notifications}
                    onChange={(e) => setEmailSettings({ ...emailSettings, booking_notifications: e.target.checked })}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    disabled={!emailSettings.notification_enabled}
                  />
                  <Label htmlFor="booking_notifications" className="text-sm">
                    Booking confirmation emails
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="payment_notifications"
                    checked={emailSettings.payment_notifications}
                    onChange={(e) => setEmailSettings({ ...emailSettings, payment_notifications: e.target.checked })}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    disabled={!emailSettings.notification_enabled}
                  />
                  <Label htmlFor="payment_notifications" className="text-sm">
                    Payment confirmation emails
                  </Label>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleSaveEmailSettings} 
              disabled={emailSaving}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {emailSaving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Email Settings
            </Button>

            {emailSettings.admin_email && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Email Configuration Active</p>
                    <p className="text-sm text-green-700">
                      Notifications will be sent to: <span className="font-mono">{emailSettings.admin_email}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Discount Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-green-600" />
              Discount Settings
            </CardTitle>
            <CardDescription>
              Set discount rate applied to online payments during customer bookings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="discountRate">Discount Rate (%)</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="discountRate"
                  type="number"
                  min="0"
                  max="50"
                  value={discountSettings.discountRate}
                  onChange={(e) => setDiscountSettings({ discountRate: parseInt(e.target.value) || 0 })}
                  className="max-w-24"
                />
                <span className="text-sm text-gray-600">%</span>
              </div>
              <p className="text-sm text-gray-600">
                Current setting: {discountSettings.discountRate}% discount applies during payment
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900">Preview</h4>
              <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Service Price:</span>
                    <span>$100.00</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({discountSettings.discountRate}%):</span>
                    <span>-${(100 * discountSettings.discountRate / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base border-t pt-2">
                    <span>Final Total:</span>
                    <span>${(100 * (100 - discountSettings.discountRate) / 100).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleSaveDiscountSettings} 
              disabled={discountSaving}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {discountSaving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Discount Settings
            </Button>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800">Discount Active</p>
                  <p className="text-sm text-blue-700">
                    {discountSettings.discountRate}% discount is applied to all new bookings and payment calculations
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}