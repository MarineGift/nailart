'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Checkbox } from './ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Mail, MessageSquare, Search, Filter, Send, Users, Calendar, Star, Phone, CheckCircle, XCircle } from 'lucide-react'
import { format, subDays, subMonths } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { useToast } from '@/hooks/use-toast'

interface Customer {
  id: number
  firstName: string
  lastName: string
  email?: string
  phone_number: string
  created_at: string
  totalSpent: number
  totalVisits: number
  lastVisit: string
  preferredServices: string[]
  bookings: Booking[]
}

interface Booking {
  id: number
  booking_date: string
  time_slot: string
  status: string
  price: number
  service: {
    name: string
    duration: number
    price: number
  }
}

interface Service {
  id: number
  name: string
  duration: number
  price: number
  description: string
}

interface MessageTemplate {
  id: string
  name: string
  type: 'email' | 'sms'
  subject?: string
  content: string
  category: 'thank_you' | 'appointment_reminder' | 'follow_up' | 'promotion'
}

const messageTemplates: MessageTemplate[] = [
  {
    id: '1',
    name: 'Thank You Message',
    type: 'sms',
    content: 'Thank you for visiting ConnieNail! We hope you loved your service. Book your next appointment: [BOOKING_LINK]',
    category: 'thank_you'
  },
  {
    id: '2',
    name: 'Thank You Email',
    type: 'email',
    subject: 'Thank you for choosing ConnieNail!',
    content: 'Dear [CUSTOMER_NAME],\n\nThank you for choosing ConnieNail for your nail care needs. We hope you absolutely love your new look!\n\nYour service details:\n- Service: [SERVICE_NAME]\n- Date: [SERVICE_DATE]\n- Total: [SERVICE_PRICE]\n\nWe would love to see you again soon. Book your next appointment online or call us.\n\nBest regards,\nConnieNail Team',
    category: 'thank_you'
  },
  {
    id: '3',
    name: 'Appointment Reminder',
    type: 'sms',
    content: 'Hi [CUSTOMER_NAME]! Reminder: You have an appointment at ConnieNail tomorrow at [TIME]. See you soon!',
    category: 'appointment_reminder'
  },
  {
    id: '4',
    name: 'Follow-up Message',
    type: 'sms',
    content: 'Hi [CUSTOMER_NAME]! It\'s been a while since your last visit. Ready for a fresh new look? Book now: [BOOKING_LINK]',
    category: 'follow_up'
  },
  {
    id: '5',
    name: 'Special Promotion',
    type: 'email',
    subject: 'Special Offer Just for You! 20% Off Your Next Service',
    content: 'Dear [CUSTOMER_NAME],\n\nWe miss you at ConnieNail! As one of our valued customers, we\'re offering you 20% off your next service.\n\nOffer valid until [EXPIRY_DATE]\nUse code: WELCOME20\n\nBook your appointment today and treat yourself to beautiful nails!\n\nBest regards,\nConnieNail Team',
    category: 'promotion'
  }
]

export function CRMManagement() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [serviceFilter, setServiceFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [spendingFilter, setSpendingFilter] = useState('all')
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null)
  const [customMessage, setCustomMessage] = useState('')
  const [customSubject, setCustomSubject] = useState('')
  const [messageType, setMessageType] = useState<'email' | 'sms'>('sms')
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      const [customersRes, servicesRes] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/services')
      ])

      const customersData = await customersRes.json()
      const servicesData = await servicesRes.json()
      
      setServices(Array.isArray(servicesData) ? servicesData : [])

      const bookingsRes = await fetch('/api/bookings')
      let allBookings = []
      
      if (bookingsRes.ok) {
        allBookings = await bookingsRes.json()
      }

      const customersWithData = customersData.map((customer: any) => {
        const customerBookings = Array.isArray(allBookings) ? allBookings.filter((booking: any) => booking.customer_id === customer.id) : []
        const totalSpent = customerBookings.reduce((sum: number, booking: any) => sum + (booking.price || 0), 0)
        const completedBookings = customerBookings.filter((b: any) => b.status === 'completed' || b.status === 'confirmed')
        const totalVisits = completedBookings.length
        
        const sortedBookings = customerBookings.sort((a: any, b: any) => {
          const dateA = new Date(a.booking_date)
          const dateB = new Date(b.booking_date)
          return dateB.getTime() - dateA.getTime()
        })
        const lastVisit = sortedBookings.length > 0 ? sortedBookings[0].booking_date : customer.created_at

        const serviceCount: { [key: string]: number } = {}
        customerBookings.forEach((booking: any) => {
          const service = servicesData.find((s: Service) => s.id === booking.service_id)
          if (service?.name) {
            serviceCount[service.name] = (serviceCount[service.name] || 0) + 1
          }
        })
        const preferredServices = Object.entries(serviceCount)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([service]) => service)

        return {
          ...customer,
          totalSpent,
          totalVisits,
          lastVisit,
          preferredServices,
          bookings: customerBookings.map((booking: any) => ({
            ...booking,
            service: servicesData.find((s: Service) => s.id === booking.service_id) || { name: 'Unknown Service', duration: 0, price: 0 }
          }))
        }
      })

      setCustomers(customersWithData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getFilteredCustomers = () => {
    return customers.filter(customer => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone_number.includes(searchTerm) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase())

      // Service filter
      const matchesService = serviceFilter === 'all' || serviceFilter === '' || 
        customer.preferredServices.some(service => service.toLowerCase().includes(serviceFilter.toLowerCase()))

      // Date filter
      let matchesDate = true
      if (dateFilter && dateFilter !== 'all') {
        const customerLastVisit = new Date(customer.lastVisit)
        const now = new Date()
        
        switch (dateFilter) {
          case 'last_7_days':
            matchesDate = customerLastVisit >= subDays(now, 7)
            break
          case 'last_30_days':
            matchesDate = customerLastVisit >= subDays(now, 30)
            break
          case 'last_3_months':
            matchesDate = customerLastVisit >= subMonths(now, 3)
            break
          case 'last_6_months':
            matchesDate = customerLastVisit >= subMonths(now, 6)
            break
          case 'over_6_months':
            matchesDate = customerLastVisit < subMonths(now, 6)
            break
        }
      }

      // Spending filter
      let matchesSpending = true
      if (spendingFilter && spendingFilter !== 'all') {
        switch (spendingFilter) {
          case 'low':
            matchesSpending = customer.totalSpent < 200
            break
          case 'medium':
            matchesSpending = customer.totalSpent >= 200 && customer.totalSpent < 500
            break
          case 'high':
            matchesSpending = customer.totalSpent >= 500 && customer.totalSpent < 1000
            break
          case 'vip':
            matchesSpending = customer.totalSpent >= 1000
            break
        }
      }

      return matchesSearch && matchesService && matchesDate && matchesSpending
    })
  }

  const handleCustomerSelect = (customerId: number, checked: boolean) => {
    if (checked) {
      setSelectedCustomers(prev => [...prev, customerId])
    } else {
      setSelectedCustomers(prev => prev.filter(id => id !== customerId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCustomers(getFilteredCustomers().map(c => c.id))
    } else {
      setSelectedCustomers([])
    }
  }

  const handleTemplateSelect = (template: MessageTemplate) => {
    setSelectedTemplate(template)
    setMessageType(template.type)
    setCustomMessage(template.content)
    setCustomSubject(template.subject || '')
  }

  const handleSendMessage = async () => {
    if (selectedCustomers.length === 0) {
      toast({
        title: "No recipients selected",
        description: "Please select at least one customer to send the message.",
        variant: "destructive"
      })
      return
    }

    if (!customMessage.trim()) {
      toast({
        title: "Message required",
        description: "Please enter a message to send.",
        variant: "destructive"
      })
      return
    }

    setSendingMessage(true)
    
    try {
      // Simulate API call - in real implementation, this would call your email/SMS service
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: "Messages sent successfully!",
        description: `${messageType.toUpperCase()} sent to ${selectedCustomers.length} customer${selectedCustomers.length > 1 ? 's' : ''}.`
      })
      
      setSelectedCustomers([])
      setCustomMessage('')
      setCustomSubject('')
      setSelectedTemplate(null)
    } catch (error) {
      toast({
        title: "Failed to send messages",
        description: "There was an error sending the messages. Please try again.",
        variant: "destructive"
      })
    } finally {
      setSendingMessage(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy', { locale: enUS })
    } catch {
      return dateString
    }
  }

  const filteredCustomers = getFilteredCustomers()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Relationship Management</h1>
          <p className="text-gray-600 mt-1">Send emails and SMS messages to your customers</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-lg px-3 py-1">
            <Users className="h-4 w-4 mr-2" />
            {selectedCustomers.length} Selected
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Selection Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Customer Filters
              </CardTitle>
              <CardDescription>
                Filter customers by various criteria to target your messages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Name, phone, email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      data-testid="input-crm-search"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="service-filter">Service</Label>
                  <Select value={serviceFilter} onValueChange={setServiceFilter}>
                    <SelectTrigger data-testid="select-service-filter">
                      <SelectValue placeholder="All services" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All services</SelectItem>
                      {(services || []).map(service => (
                        <SelectItem key={service.id} value={service.name}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="date-filter">Last Visit</Label>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger data-testid="select-date-filter">
                      <SelectValue placeholder="All dates" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All dates</SelectItem>
                      <SelectItem value="last_7_days">Last 7 days</SelectItem>
                      <SelectItem value="last_30_days">Last 30 days</SelectItem>
                      <SelectItem value="last_3_months">Last 3 months</SelectItem>
                      <SelectItem value="last_6_months">Last 6 months</SelectItem>
                      <SelectItem value="over_6_months">Over 6 months ago</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="spending-filter">Spending Level</Label>
                  <Select value={spendingFilter} onValueChange={setSpendingFilter}>
                    <SelectTrigger data-testid="select-spending-filter">
                      <SelectValue placeholder="All levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All levels</SelectItem>
                      <SelectItem value="low">Low (&lt;$200)</SelectItem>
                      <SelectItem value="medium">Medium ($200-$499)</SelectItem>
                      <SelectItem value="high">High ($500-$999)</SelectItem>
                      <SelectItem value="vip">VIP ($1000+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-gray-600">
                  {filteredCustomers.length} customers match your criteria
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectAll(true)}
                    data-testid="button-select-all"
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectAll(false)}
                    data-testid="button-deselect-all"
                  >
                    Deselect All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer List */}
          <Card>
            <CardHeader>
              <CardTitle>Customer List</CardTitle>
              <CardDescription>
                Select customers to send messages to
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                          onCheckedChange={handleSelectAll}
                          data-testid="checkbox-select-all"
                        />
                      </TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Last Visit</TableHead>
                      <TableHead>Total Spent</TableHead>
                      <TableHead>Preferred Services</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedCustomers.includes(customer.id)}
                            onCheckedChange={(checked) => handleCustomerSelect(customer.id, checked as boolean)}
                            data-testid={`checkbox-customer-${customer.id}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm">
                                {customer.firstName?.[0] || 'C'}{customer.lastName?.[0] || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold">{customer.firstName} {customer.lastName}</div>
                              <div className="text-sm text-gray-500">{customer.totalVisits} visits</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {customer.phone_number}
                            </div>
                            {customer.email && (
                              <div className="flex items-center gap-1 text-gray-600">
                                <Mail className="h-3 w-3" />
                                {customer.email}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{formatDate(customer.lastVisit)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-green-600">${customer.totalSpent}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {customer.preferredServices.slice(0, 2).map((service, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                            {customer.preferredServices.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{customer.preferredServices.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Message Composition Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Compose Message
              </CardTitle>
              <CardDescription>
                Create and send messages to selected customers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Message Type */}
              <div>
                <Label>Message Type</Label>
                <Tabs value={messageType} onValueChange={(value) => setMessageType(value as 'email' | 'sms')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="sms" data-testid="tab-sms">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      SMS
                    </TabsTrigger>
                    <TabsTrigger value="email" data-testid="tab-email">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Templates */}
              <div>
                <Label>Message Templates</Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {messageTemplates
                    .filter(template => template.type === messageType)
                    .map(template => (
                      <Button
                        key={template.id}
                        variant={selectedTemplate?.id === template.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleTemplateSelect(template)}
                        className="justify-start"
                        data-testid={`button-template-${template.id}`}
                      >
                        {template.name}
                      </Button>
                    ))}
                </div>
              </div>

              {/* Subject (for emails) */}
              {messageType === 'email' && (
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    placeholder="Enter email subject..."
                    data-testid="input-email-subject"
                  />
                </div>
              )}

              {/* Message Content */}
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder={`Enter your ${messageType} message...`}
                  rows={6}
                  data-testid="textarea-message-content"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Available variables: [CUSTOMER_NAME], [SERVICE_NAME], [SERVICE_DATE], [SERVICE_PRICE], [BOOKING_LINK]
                </div>
              </div>

              {/* Send Button */}
              <Button
                onClick={handleSendMessage}
                disabled={selectedCustomers.length === 0 || !customMessage.trim() || sendingMessage}
                className="w-full"
                data-testid="button-send-message"
              >
                {sendingMessage ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send {messageType.toUpperCase()} to {selectedCustomers.length} customer{selectedCustomers.length !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Message History */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Messages</CardTitle>
              <CardDescription>
                Recently sent messages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <div className="text-sm">
                      <div className="font-medium">Thank You SMS</div>
                      <div className="text-gray-500">15 customers • 2 hours ago</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <div className="text-sm">
                      <div className="font-medium">Promotion Email</div>
                      <div className="text-gray-500">32 customers • 1 day ago</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <div className="text-sm">
                      <div className="font-medium">Appointment Reminder</div>
                      <div className="text-gray-500">8 customers • 3 days ago</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}