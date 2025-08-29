'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
// Slider component will be custom
// Separator component will be custom div
import { useToast } from '@/hooks/use-toast'
import { 
  MessageSquare, 
  CreditCard, 
  Mail,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Save,
  Smartphone,
  DollarSign,
  Send
} from 'lucide-react'

interface TwilioSettings {
  account_sid: string
  auth_token: string
  phone_number: string
}

interface StripeSettings {
  publishable_key: string
  secret_key: string
  webhook_secret: string
}

interface EmailSettings {
  sendgrid_api_key: string
  from_email: string
  from_name: string
  admin_email: string
}

interface DiscountSettings {
  early_booking_discount: number
  loyalty_customer_discount: number
  group_booking_discount: number
  student_discount: number
  senior_discount: number
}

export default function EnhancedSettings() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  
  // Settings states
  const [twilioSettings, setTwilioSettings] = useState<TwilioSettings>({
    account_sid: '',
    auth_token: '',
    phone_number: ''
  })
  
  const [stripeSettings, setStripeSettings] = useState<StripeSettings>({
    publishable_key: '',
    secret_key: '',
    webhook_secret: ''
  })
  
  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    sendgrid_api_key: '',
    from_email: '',
    from_name: '',
    admin_email: ''
  })
  
  const [discountSettings, setDiscountSettings] = useState<DiscountSettings>({
    early_booking_discount: 10,
    loyalty_customer_discount: 15,
    group_booking_discount: 20,
    student_discount: 10,
    senior_discount: 15
  })

  // Status states
  const [connectionStatus, setConnectionStatus] = useState<Record<string, 'connected' | 'disconnected' | 'error'>>({
    twilio: 'disconnected',
    stripe: 'disconnected',
    email: 'disconnected'
  })

  useEffect(() => {
    loadAllSettings()
  }, [])

  const loadAllSettings = async () => {
    setLoading(true)
    try {
      // Load Twilio settings
      const twilioResponse = await fetch('/api/settings/twilio')
      if (twilioResponse.ok) {
        const twilioData = await twilioResponse.json()
        setTwilioSettings(twilioData)
        setConnectionStatus(prev => ({ 
          ...prev, 
          twilio: twilioData.account_sid ? 'connected' : 'disconnected' 
        }))
      }

      // Load Stripe settings
      const stripeResponse = await fetch('/api/settings/stripe')
      if (stripeResponse.ok) {
        const stripeData = await stripeResponse.json()
        setStripeSettings(stripeData)
        setConnectionStatus(prev => ({ 
          ...prev, 
          stripe: stripeData.publishable_key ? 'connected' : 'disconnected' 
        }))
      }

      // Load Email settings
      const emailResponse = await fetch('/api/settings/email')
      if (emailResponse.ok) {
        const emailData = await emailResponse.json()
        setEmailSettings(emailData)
        setConnectionStatus(prev => ({ 
          ...prev, 
          email: emailData.sendgrid_api_key ? 'connected' : 'disconnected' 
        }))
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveTwilioSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/settings/twilio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(twilioSettings)
      })

      if (response.ok) {
        setConnectionStatus(prev => ({ ...prev, twilio: 'connected' }))
        toast({
          title: "Twilio Settings Saved",
          description: "SMS service is now configured and ready to use.",
        })
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, twilio: 'error' }))
      toast({
        title: "Error",
        description: "Failed to save Twilio settings. Please check your credentials.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const saveStripeSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/settings/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stripeSettings)
      })

      if (response.ok) {
        setConnectionStatus(prev => ({ ...prev, stripe: 'connected' }))
        toast({
          title: "Stripe Settings Saved",
          description: "Payment processing is now configured and ready to use.",
        })
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, stripe: 'error' }))
      toast({
        title: "Error",
        description: "Failed to save Stripe settings. Please check your credentials.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const saveEmailSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/settings/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailSettings)
      })

      if (response.ok) {
        setConnectionStatus(prev => ({ ...prev, email: 'connected' }))
        toast({
          title: "Email Settings Saved",
          description: "Email service is now configured and ready to use.",
        })
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, email: 'error' }))
      toast({
        title: "Error",
        description: "Failed to save email settings. Please check your credentials.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleSecretVisibility = (field: string) => {
    setShowSecrets(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const StatusBadge = ({ status }: { status: 'connected' | 'disconnected' | 'error' }) => {
    const variants = {
      connected: { icon: CheckCircle2, color: "bg-green-100 text-green-800", text: "Connected" },
      disconnected: { icon: AlertCircle, color: "bg-gray-100 text-gray-800", text: "Not Configured" },
      error: { icon: AlertCircle, color: "bg-red-100 text-red-800", text: "Error" }
    }
    
    const { icon: Icon, color, text } = variants[status]
    return (
      <Badge className={`${color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {text}
      </Badge>
    )
  }

  const SecretInput = ({ 
    label, 
    value, 
    onChange, 
    placeholder, 
    fieldKey 
  }: { 
    label: string
    value: string
    onChange: (value: string) => void
    placeholder: string
    fieldKey: string 
  }) => (
    <div className="space-y-2">
      <Label htmlFor={fieldKey}>{label}</Label>
      <div className="relative">
        <Input
          id={fieldKey}
          type={showSecrets[fieldKey] ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pr-10"
          data-testid={`input-${fieldKey}`}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full px-3"
          onClick={() => toggleSecretVisibility(fieldKey)}
          data-testid={`button-toggle-${fieldKey}`}
        >
          {showSecrets[fieldKey] ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Service Integration Settings</h2>
        <p className="text-muted-foreground">
          Configure third-party services for SMS, payments, and email notifications
        </p>
      </div>

      <Tabs defaultValue="twilio" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="twilio" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            SMS (Twilio)
          </TabsTrigger>
          <TabsTrigger value="stripe" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payments (Stripe)
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email (SendGrid)
          </TabsTrigger>
          <TabsTrigger value="discounts" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            할인율 설정
          </TabsTrigger>
        </TabsList>

        {/* Twilio Settings */}
        <TabsContent value="twilio" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Twilio SMS Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure Twilio for SMS notifications to customers and staff
                  </CardDescription>
                </div>
                <StatusBadge status={connectionStatus.twilio} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="twilio-sid">Account SID</Label>
                  <Input
                    id="twilio-sid"
                    value={twilioSettings.account_sid}
                    onChange={(e) => setTwilioSettings(prev => ({ ...prev, account_sid: e.target.value }))}
                    placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    data-testid="input-twilio-account-sid"
                  />
                </div>

                <SecretInput
                  label="Auth Token"
                  value={twilioSettings.auth_token}
                  onChange={(value) => setTwilioSettings(prev => ({ ...prev, auth_token: value }))}
                  placeholder="Your Twilio Auth Token"
                  fieldKey="twilio-auth-token"
                />

                <div className="space-y-2">
                  <Label htmlFor="twilio-phone">Phone Number</Label>
                  <Input
                    id="twilio-phone"
                    value={twilioSettings.phone_number}
                    onChange={(e) => setTwilioSettings(prev => ({ ...prev, phone_number: e.target.value }))}
                    placeholder="+1234567890"
                    data-testid="input-twilio-phone-number"
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Required Twilio Information:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Account SID:</strong> Found in your Twilio Console Dashboard</li>
                  <li>• <strong>Auth Token:</strong> Your secret auth token from Twilio Console</li>
                  <li>• <strong>Phone Number:</strong> A Twilio phone number you've purchased</li>
                </ul>
              </div>

              <div className="border-t my-4" />

              <div className="flex justify-end">
                <Button onClick={saveTwilioSettings} disabled={loading} data-testid="button-save-twilio">
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Twilio Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stripe Settings */}
        <TabsContent value="stripe" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Stripe Payment Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure Stripe for secure online payment processing
                  </CardDescription>
                </div>
                <StatusBadge status={connectionStatus.stripe} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stripe-publishable">Publishable Key</Label>
                  <Input
                    id="stripe-publishable"
                    value={stripeSettings.publishable_key}
                    onChange={(e) => setStripeSettings(prev => ({ ...prev, publishable_key: e.target.value }))}
                    placeholder="pk_live_... or pk_test_..."
                    data-testid="input-stripe-publishable-key"
                  />
                </div>

                <SecretInput
                  label="Secret Key"
                  value={stripeSettings.secret_key}
                  onChange={(value) => setStripeSettings(prev => ({ ...prev, secret_key: value }))}
                  placeholder="sk_live_... or sk_test_..."
                  fieldKey="stripe-secret-key"
                />

                <SecretInput
                  label="Webhook Secret (Optional)"
                  value={stripeSettings.webhook_secret}
                  onChange={(value) => setStripeSettings(prev => ({ ...prev, webhook_secret: value }))}
                  placeholder="whsec_..."
                  fieldKey="stripe-webhook-secret"
                />
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Required Stripe Information:</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• <strong>Publishable Key:</strong> Public key for client-side integration</li>
                  <li>• <strong>Secret Key:</strong> Private key for server-side operations</li>
                  <li>• <strong>Webhook Secret:</strong> For secure webhook verification (optional)</li>
                </ul>
              </div>

              <div className="border-t my-4" />

              <div className="flex justify-end">
                <Button onClick={saveStripeSettings} disabled={loading} data-testid="button-save-stripe">
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Stripe Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    SendGrid Email Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure SendGrid for booking confirmations and notifications
                  </CardDescription>
                </div>
                <StatusBadge status={connectionStatus.email} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SecretInput
                  label="SendGrid API Key"
                  value={emailSettings.sendgrid_api_key}
                  onChange={(value) => setEmailSettings(prev => ({ ...prev, sendgrid_api_key: value }))}
                  placeholder="SG.xxxxxxxxxx..."
                  fieldKey="sendgrid-api-key"
                />

                <div className="space-y-2">
                  <Label htmlFor="from-email">From Email Address</Label>
                  <Input
                    id="from-email"
                    type="email"
                    value={emailSettings.from_email}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, from_email: e.target.value }))}
                    placeholder="noreply@connienail.com"
                    data-testid="input-from-email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="from-name">From Name</Label>
                  <Input
                    id="from-name"
                    value={emailSettings.from_name}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, from_name: e.target.value }))}
                    placeholder="ConnieNail Salon"
                    data-testid="input-from-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-email">Admin Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    value={emailSettings.admin_email}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, admin_email: e.target.value }))}
                    placeholder="admin@connienail.com"
                    data-testid="input-admin-email"
                  />
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">Required SendGrid Information:</h4>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• <strong>API Key:</strong> Generated in SendGrid Settings → API Keys</li>
                  <li>• <strong>From Email:</strong> Must be verified in SendGrid</li>
                  <li>• <strong>From Name:</strong> Display name for outgoing emails</li>
                  <li>• <strong>Admin Email:</strong> Where booking notifications are sent</li>
                </ul>
              </div>

              <div className="border-t my-4" />

              <div className="flex justify-end">
                <Button onClick={saveEmailSettings} disabled={loading} data-testid="button-save-email">
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Email Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Discount Settings */}
        <TabsContent value="discounts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    할인율 설정
                  </CardTitle>
                  <CardDescription>
                    다양한 할인 정책의 할인율을 설정하세요
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="early-booking">조기 예약 할인 (%)</Label>
                    <div className="flex items-center space-x-3">
                      <Input
                        id="early-booking"
                        type="number"
                        min="0"
                        max="50"
                        value={discountSettings.early_booking_discount}
                        onChange={(e) => setDiscountSettings(prev => ({ 
                          ...prev, 
                          early_booking_discount: parseInt(e.target.value) || 0 
                        }))}
                        className="w-20"
                        data-testid="input-early-booking-discount"
                      />
                      <span className="text-sm text-gray-600">7일 전 예약 시</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="loyalty-customer">단골 고객 할인 (%)</Label>
                    <div className="flex items-center space-x-3">
                      <Input
                        id="loyalty-customer"
                        type="number"
                        min="0"
                        max="50"
                        value={discountSettings.loyalty_customer_discount}
                        onChange={(e) => setDiscountSettings(prev => ({ 
                          ...prev, 
                          loyalty_customer_discount: parseInt(e.target.value) || 0 
                        }))}
                        className="w-20"
                        data-testid="input-loyalty-customer-discount"
                      />
                      <span className="text-sm text-gray-600">VIP 고객 대상</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="group-booking">그룹 예약 할인 (%)</Label>
                    <div className="flex items-center space-x-3">
                      <Input
                        id="group-booking"
                        type="number"
                        min="0"
                        max="50"
                        value={discountSettings.group_booking_discount}
                        onChange={(e) => setDiscountSettings(prev => ({ 
                          ...prev, 
                          group_booking_discount: parseInt(e.target.value) || 0 
                        }))}
                        className="w-20"
                        data-testid="input-group-booking-discount"
                      />
                      <span className="text-sm text-gray-600">3명 이상 동시 예약</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="student-discount">학생 할인 (%)</Label>
                    <div className="flex items-center space-x-3">
                      <Input
                        id="student-discount"
                        type="number"
                        min="0"
                        max="50"
                        value={discountSettings.student_discount}
                        onChange={(e) => setDiscountSettings(prev => ({ 
                          ...prev, 
                          student_discount: parseInt(e.target.value) || 0 
                        }))}
                        className="w-20"
                        data-testid="input-student-discount"
                      />
                      <span className="text-sm text-gray-600">학생증 제시 시</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="senior-discount">시니어 할인 (%)</Label>
                    <div className="flex items-center space-x-3">
                      <Input
                        id="senior-discount"
                        type="number"
                        min="0"
                        max="50"
                        value={discountSettings.senior_discount}
                        onChange={(e) => setDiscountSettings(prev => ({ 
                          ...prev, 
                          senior_discount: parseInt(e.target.value) || 0 
                        }))}
                        className="w-20"
                        data-testid="input-senior-discount"
                      />
                      <span className="text-sm text-gray-600">65세 이상</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">할인 정책 안내:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>조기 예약:</strong> 예약일로부터 7일 전에 예약하는 고객</li>
                  <li>• <strong>단골 고객:</strong> VIP 등급의 고객 (Gold, Platinum, Diamond)</li>
                  <li>• <strong>그룹 예약:</strong> 동일한 시간대에 3명 이상이 예약하는 경우</li>
                  <li>• <strong>학생 할인:</strong> 유효한 학생증을 제시하는 학생</li>
                  <li>• <strong>시니어 할인:</strong> 65세 이상의 고객</li>
                </ul>
              </div>

              <div className="border-t my-4" />

              <div className="flex justify-end">
                <Button onClick={() => {
                  toast({
                    title: "할인율 설정 저장됨",
                    description: "할인율 설정이 성공적으로 저장되었습니다.",
                  })
                }} disabled={loading} data-testid="button-save-discounts">
                  <Save className="h-4 w-4 mr-2" />
                  할인율 설정 저장
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}