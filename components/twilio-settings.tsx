'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Loader2, MessageSquare, Phone, Key } from 'lucide-react'

interface TwilioSettings {
  account_sid: string
  auth_token: string
  phone_number: string
}

export default function TwilioSettings() {
  const [settings, setSettings] = useState<TwilioSettings>({
    account_sid: '',
    auth_token: '',
    phone_number: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchTwilioSettings()
  }, [])

  const fetchTwilioSettings = async () => {
    try {
      setIsFetching(true)
      const response = await fetch('/api/settings/twilio')
      if (response.ok) {
        const data = await response.json()
        setSettings({
          account_sid: data.account_sid || '',
          auth_token: data.auth_token || '',
          phone_number: data.phone_number || '',
        })
      }
    } catch (error) {
      console.error('Error fetching Twilio settings:', error)
    } finally {
      setIsFetching(false)
    }
  }

  const handleSave = async () => {
    if (!settings.account_sid || !settings.auth_token || !settings.phone_number) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all Twilio configuration fields.',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/settings/twilio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        toast({
          title: 'Settings Saved',
          description: 'Twilio configuration has been saved successfully.',
        })
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: 'Failed to save Twilio settings. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof TwilioSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  if (isFetching) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Twilio SMS Configuration
          </CardTitle>
          <CardDescription>
            Configure Twilio credentials for SMS notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Twilio SMS Configuration
        </CardTitle>
        <CardDescription>
          Configure Twilio credentials to enable SMS notifications for customers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="account-sid" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Account SID
          </Label>
          <Input
            id="account-sid"
            type="text"
            placeholder="Enter your Twilio Account SID"
            value={settings.account_sid}
            onChange={(e) => handleInputChange('account_sid', e.target.value)}
            data-testid="twilio-account-sid"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="auth-token" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Auth Token
          </Label>
          <Input
            id="auth-token"
            type="password"
            placeholder="Enter your Twilio Auth Token"
            value={settings.auth_token}
            onChange={(e) => handleInputChange('auth_token', e.target.value)}
            data-testid="twilio-auth-token"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone-number" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Phone Number
          </Label>
          <Input
            id="phone-number"
            type="tel"
            placeholder="+1234567890"
            value={settings.phone_number}
            onChange={(e) => handleInputChange('phone_number', e.target.value)}
            data-testid="twilio-phone-number"
          />
          <p className="text-sm text-gray-500">
            Enter your Twilio phone number in international format (e.g., +1234567890)
          </p>
        </div>

        <div className="pt-4">
          <Button 
            onClick={handleSave} 
            disabled={isLoading}
            className="w-full"
            data-testid="save-twilio-settings"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Twilio Settings'
            )}
          </Button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">How to get Twilio credentials:</h4>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Sign up for a Twilio account at twilio.com</li>
            <li>2. Go to Console Dashboard</li>
            <li>3. Find your Account SID and Auth Token</li>
            <li>4. Purchase a phone number from Twilio</li>
            <li>5. Enter the credentials above</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}