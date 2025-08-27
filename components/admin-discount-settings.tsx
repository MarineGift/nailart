'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Settings, Percent, Save } from 'lucide-react'

export function AdminDiscountSettings() {
  const [discountRate, setDiscountRate] = useState(10)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchDiscountSettings()
  }, [])

  const fetchDiscountSettings = async () => {
    try {
      const response = await fetch('/api/settings/discount')
      if (response.ok) {
        const data = await response.json()
        setDiscountRate(data.rate)
      }
    } catch (error) {
      console.error('Error fetching discount settings:', error)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/settings/discount', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rate: discountRate })
      })

      if (response.ok) {
        toast({
          title: "Settings Saved",
          description: `Discount rate set to ${discountRate}%`,
        })
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving discount settings:', error)
      toast({
        title: "Save Failed",
        description: "Error occurred while saving discount rate",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Online Payment Discount Settings
        </CardTitle>
        <CardDescription>
          Set discount rate applied to online payments during customer bookings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="discount-rate" className="flex items-center gap-2">
            <Percent className="h-4 w-4" />
            Discount Rate
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="discount-rate"
              type="number"
              min="0"
              max="100"
              value={discountRate}
              onChange={(e) => setDiscountRate(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
              className="w-24"
              data-testid="input-discount-rate"
            />
            <span className="text-sm text-gray-500">%</span>
          </div>
          <p className="text-sm text-gray-600">
            Current setting: {discountRate}% discount applies during payment
          </p>
        </div>
        
        <Button 
          onClick={handleSave} 
          disabled={loading}
          className="w-full"
          data-testid="button-save-discount-rate"
        >
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </CardContent>
    </Card>
  )
}