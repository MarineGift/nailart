'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MessageSquare, Phone, Mail, Clock, User, AlertTriangle, CheckCircle, XCircle, Plus, Send, MessageCircle, Edit } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { formatPhoneNumber } from '@/utils/phone-formatter'

interface Inquiry {
  id: string
  title: string
  customerName: string
  phoneNumber: string
  email: string
  message: string
  status: 'new' | 'in_progress' | 'resolved' | 'urgent'
  priority: 'normal' | 'high' | 'urgent'
  createdAt: string
  assignedTo?: string
}

export function CustomerInquiries() {
  const [loading, setLoading] = useState(true)
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [emailMessage, setEmailMessage] = useState('')
  const [smsMessage, setSmsMessage] = useState('')
  const [isEmailSending, setIsEmailSending] = useState(false)
  const [isSMSSending, setIsSMSSending] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editEmail, setEditEmail] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const { toast } = useToast()
  const [inquiries, setInquiries] = useState<Inquiry[]>([
    {
      id: '1',
      title: 'Appointment Change Request',
      customerName: '김미영',
      phoneNumber: '2025551001',
      email: 'mikim@email.com',
      message: 'I would like to change my appointment from 2 PM to 3 PM on August 25th.',
      status: 'new',
      priority: 'normal',
      createdAt: '2025-08-21',
      assignedTo: undefined
    },
    {
      id: '2',
      title: 'Service Inquiry',
      customerName: '박지수',
      phoneNumber: '2025551002',
      email: 'jisupark@email.com',
      message: 'I would like to know the difference and price between gel nails and regular manicure.',
      status: 'in_progress',
      priority: 'normal',
      createdAt: '2025-08-21',
      assignedTo: 'Sarah Kim'
    },
    {
      id: '3',
      title: 'Service Complaint',
      customerName: 'Marine Gift',
      phoneNumber: '5715138278',
      email: 'marinegift4u@gmail.com',
      message: 'I was not satisfied with the service during my last visit.',
      status: 'urgent',
      priority: 'urgent',
      createdAt: '2025-08-21',
      assignedTo: undefined
    }
  ])

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000)
  }, [])

  const handleViewDetails = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry)
    setShowDetailDialog(true)
    setEmailMessage(`Dear ${inquiry.customerName},\n\nThank you for contacting ConnieNail. We have received your inquiry regarding "${inquiry.title}".\n\nWe will review your request and get back to you shortly.\n\nBest regards,\nConnieNail Team`)
    setSmsMessage(`Hi ${inquiry.customerName}, thanks for contacting ConnieNail. We received your inquiry and will respond soon.`)
    setEditEmail(inquiry.email)
    setEditPhone(inquiry.phoneNumber)
    setIsEditing(false)
  }

  const handleSendEmail = async () => {
    if (!selectedInquiry || isEmailSending) return
    
    setIsEmailSending(true)
    
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: editEmail,
          subject: `Re: ${selectedInquiry.title} - ConnieNail Salon`,
          message: emailMessage,
          customerName: selectedInquiry.customerName
        })
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: 'Email Sent Successfully',
          description: `Email sent to ${editEmail}`,
        })
        
        // Update inquiry status
        setInquiries(prev => prev.map(inq => 
          inq.id === selectedInquiry.id 
            ? { ...inq, status: 'in_progress' as const }
            : inq
        ))
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send email')
      }
    } catch (error: any) {
      console.error('Email sending error:', error)
      toast({
        title: 'Email Failed',
        description: `Failed to send email: ${error.message}`,
        variant: 'destructive'
      })
    } finally {
      setIsEmailSending(false)
    }
  }

  const handleSendSMS = async () => {
    if (!selectedInquiry || isSMSSending) return
    
    setIsSMSSending(true)
    
    try {
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: editPhone,
          message: smsMessage,
          customerName: selectedInquiry.customerName
        })
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: 'SMS Sent Successfully',
          description: `SMS sent to ${editPhone}`,
        })
        
        // Update inquiry status
        setInquiries(prev => prev.map(inq => 
          inq.id === selectedInquiry.id 
            ? { ...inq, status: 'in_progress' as const }
            : inq
        ))
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send SMS')
      }
    } catch (error: any) {
      console.error('SMS sending error:', error)
      toast({
        title: 'SMS Failed',
        description: `Failed to send SMS: ${error.message}`,
        variant: 'destructive'
      })
    } finally {
      setIsSMSSending(false)
    }
  }

  const handleSaveContactInfo = async () => {
    if (!selectedInquiry) return
    
    try {
      // Update the inquiry with new contact info
      setInquiries(prev => prev.map(inq => 
        inq.id === selectedInquiry.id 
          ? { ...inq, email: editEmail, phoneNumber: editPhone }
          : inq
      ))
      
      // Update selected inquiry
      setSelectedInquiry({
        ...selectedInquiry,
        email: editEmail,
        phoneNumber: editPhone
      })
      
      setIsEditing(false)
      
      toast({
        title: 'Contact Information Updated',
        description: 'Customer contact details have been updated successfully',
      })
    } catch (error) {
      console.error('Update contact info error:', error)
      toast({
        title: 'Update Failed',
        description: 'Failed to update contact information',
        variant: 'destructive'
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'urgent': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Inquiries</h2>
          <p className="text-gray-600">Manage customer inquiries and responses</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          New Inquiry
        </Button>
      </div>

      {/* Demo Message for missing table */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
            <div>
              <h3 className="font-medium text-yellow-800">Customer Inquiry System Preparing</h3>
              <p className="text-yellow-700 text-sm mt-1">
                Real inquiry data will be displayed once the customer_inquiries table is created in the database.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sample Data for demonstration */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-500" />
                <div className="text-2xl font-bold">{inquiries.length}</div>
              </div>
              <p className="text-sm text-gray-600">Total Inquiries</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <div className="text-2xl font-bold">{inquiries.filter(i => i.status === 'new').length}</div>
              </div>
              <p className="text-sm text-gray-600">New Inquiries</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <div className="text-2xl font-bold">{inquiries.filter(i => i.status === 'in_progress').length}</div>
              </div>
              <p className="text-sm text-gray-600">In Progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div className="text-2xl font-bold">{inquiries.filter(i => i.status === 'resolved').length}</div>
              </div>
              <p className="text-sm text-gray-600">Resolved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <div className="text-2xl font-bold">{inquiries.filter(i => i.status === 'urgent').length}</div>
              </div>
              <p className="text-sm text-gray-600">Urgent</p>
            </CardContent>
          </Card>
        </div>

        {/* Dynamic inquiry cards */}
        <div className="grid gap-4">
          {inquiries.map((inquiry) => (
            <Card key={inquiry.id} className={`border-l-4 ${
              inquiry.status === 'urgent' ? 'border-l-red-500' :
              inquiry.status === 'in_progress' ? 'border-l-yellow-500' :
              inquiry.status === 'resolved' ? 'border-l-green-500' :
              'border-l-blue-500'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-gray-900">{inquiry.title}</h3>
                      <Badge className={getStatusBadge(inquiry.status)}>
                        {inquiry.status === 'new' ? 'New' :
                         inquiry.status === 'in_progress' ? 'In Progress' :
                         inquiry.status === 'resolved' ? 'Resolved' : 'Urgent'}
                      </Badge>
                      <Badge className={getPriorityBadge(inquiry.priority)}>
                        {inquiry.priority === 'urgent' ? 'Urgent' :
                         inquiry.priority === 'high' ? 'High' : 'Normal'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {inquiry.customerName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {formatPhoneNumber(inquiry.phoneNumber)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {inquiry.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {inquiry.createdAt}
                      </span>
                    </div>
                    <p className="text-gray-800">{inquiry.message}</p>
                    {inquiry.assignedTo && (
                      <p className="text-sm text-purple-600 mt-2">
                        Assigned: {inquiry.assignedTo}
                      </p>
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleViewDetails(inquiry)}
                    data-testid={`button-view-details-${inquiry.id}`}
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View Details Dialog */}
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Inquiry Details
              </DialogTitle>
              <DialogDescription>
                Respond to customer inquiry with email or SMS
              </DialogDescription>
            </DialogHeader>
            
            {selectedInquiry && (
              <div className="space-y-6">
                {/* Customer Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="font-medium">Name</Label>
                        <p className="text-gray-800">{selectedInquiry.customerName}</p>
                      </div>
                      <div>
                        <Label className="font-medium">Phone</Label>
                        {isEditing ? (
                          <Input
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            className="mt-1"
                            data-testid="input-edit-phone"
                          />
                        ) : (
                          <p className="text-gray-800">{editPhone}</p>
                        )}
                      </div>
                      <div>
                        <Label className="font-medium">Email</Label>
                        {isEditing ? (
                          <Input
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            className="mt-1"
                            data-testid="input-edit-email"
                          />
                        ) : (
                          <p className="text-gray-800">{editEmail}</p>
                        )}
                      </div>
                      <div>
                        <Label className="font-medium">Status</Label>
                        <Badge className={getStatusBadge(selectedInquiry.status)}>
                          {selectedInquiry.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-end mt-4 gap-2">
                      {isEditing ? (
                        <>
                          <Button
                            size="sm"
                            onClick={handleSaveContactInfo}
                            className="bg-green-600 hover:bg-green-700"
                            data-testid="button-save-contact"
                          >
                            Save Changes
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setIsEditing(false)
                              setEditEmail(selectedInquiry.email)
                              setEditPhone(selectedInquiry.phoneNumber)
                            }}
                            data-testid="button-cancel-edit"
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsEditing(true)}
                          data-testid="button-edit-contact"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit Contact Info
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Original Message */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{selectedInquiry.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-800 whitespace-pre-wrap">{selectedInquiry.message}</p>
                    <p className="text-sm text-gray-500 mt-2">Received: {selectedInquiry.createdAt}</p>
                  </CardContent>
                </Card>

                {/* Response Options */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Email Response */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Email Response
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="email-to">To</Label>
                        <Input 
                          id="email-to" 
                          value={editEmail} 
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="bg-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email-message">Message</Label>
                        <Textarea
                          id="email-message"
                          value={emailMessage}
                          onChange={(e) => setEmailMessage(e.target.value)}
                          rows={8}
                          placeholder="Type your email response..."
                        />
                      </div>
                      <Button 
                        onClick={handleSendEmail}
                        disabled={isEmailSending}
                        className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                        data-testid="button-send-email"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {isEmailSending ? 'Sending...' : 'Send Email'}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* SMS Response */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MessageCircle className="h-5 w-5" />
                        SMS Response
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="sms-to">To</Label>
                        <Input 
                          id="sms-to" 
                          value={formatPhoneNumber(editPhone)} 
                          onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="(571)531-8278"
                          className="bg-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="sms-message">Message</Label>
                        <Textarea
                          id="sms-message"
                          value={smsMessage}
                          onChange={(e) => setSmsMessage(e.target.value)}
                          rows={4}
                          placeholder="Type your SMS response..."
                          maxLength={160}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {smsMessage.length}/160 characters
                        </p>
                      </div>
                      <Button 
                        onClick={handleSendSMS}
                        disabled={isSMSSending}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
                        data-testid="button-send-sms"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        {isSMSSending ? 'Sending...' : 'Send SMS'}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}