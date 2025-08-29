'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import { 
  User, Mail, MessageSquare, Phone, Calendar, DollarSign, 
  Send, Users, Clock, History, Edit, Save, X 
} from 'lucide-react'

interface Customer {
  id: number
  name: string
  phone: string
  email?: string
  registrationDate: string
  totalBookings: number
  totalSpent: number
  lastVisit?: string
  status: 'active' | 'inactive'
  notes?: string
}

interface CustomerCRMModalProps {
  isOpen: boolean
  onClose: () => void
  customer: Customer
}

export default function CustomerCRMModal({ isOpen, onClose, customer }: CustomerCRMModalProps) {
  const [editMode, setEditMode] = useState(false)
  const [editedCustomer, setEditedCustomer] = useState(customer)
  const [emailForm, setEmailForm] = useState({
    type: 'individual', // individual, group, period
    subject: '',
    content: '',
    recipients: '',
    startDate: '',
    endDate: ''
  })
  const [smsForm, setSmsForm] = useState({
    type: 'individual', // individual, all, period
    content: '',
    recipients: '',
    startDate: '',
    endDate: ''
  })

  const handleSaveCustomer = () => {
    // In real implementation, this would call API to update customer
    toast({
      title: "customer information edit completed",
      description: `${editedCustomer.name}님의 information가 edit되었습니다.`,
    })
    setEditMode(false)
  }

  const handleSendEmail = () => {
    toast({
      title: "이메일 발송 completed",
      description: `${emailForm.type === 'individual' ? '개인' : emailForm.type === 'group' ? '그룹' : '기간별'} 이메일이 발송되었습니다.`,
    })
    setEmailForm({
      type: 'individual',
      subject: '',
      content: '',
      recipients: '',
      startDate: '',
      endDate: ''
    })
  }

  const handleSendSMS = () => {
    toast({
      title: "SMS 발송 completed", 
      description: `${smsForm.type === 'individual' ? '개인' : smsForm.type === 'all' ? '전체' : '기간별'} SMS가 발송되었습니다.`,
    })
    setSmsForm({
      type: 'individual',
      content: '',
      recipients: '',
      startDate: '',
      endDate: ''
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] overflow-y-auto" data-testid="modal-customer-crm">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-purple-600" />
              customer CRM - {customer.name}
            </div>
            <Button
              variant="ghost"
              size="sm" 
              onClick={onClose}
              data-testid="button-close-crm"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            customer information management 및 마케팅 기능
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" data-testid="tab-profile">customerinformation</TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">booking내역</TabsTrigger>
            <TabsTrigger value="email" data-testid="tab-email">이메일 마케팅</TabsTrigger>
            <TabsTrigger value="sms" data-testid="tab-sms">SMS 마케팅</TabsTrigger>
          </TabsList>

          {/* Customer Profile */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>customer information</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditMode(!editMode)}
                    data-testid="button-edit-mode"
                  >
                    {editMode ? (
                      <>
                        <X className="h-4 w-4 mr-1" />
                        cancelled
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4 mr-1" />
                        edit
                      </>
                    )}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>이름</Label>
                    {editMode ? (
                      <Input
                        value={editedCustomer.name}
                        onChange={(e) => setEditedCustomer({...editedCustomer, name: e.target.value})}
                        data-testid="input-edit-name"
                      />
                    ) : (
                      <p className="mt-1 font-medium" data-testid="text-customer-name">{customer.name}</p>
                    )}
                  </div>
                  <div>
                    <Label>전화번호</Label>
                    {editMode ? (
                      <Input
                        value={editedCustomer.phone}
                        onChange={(e) => setEditedCustomer({...editedCustomer, phone: e.target.value})}
                        data-testid="input-edit-phone"
                      />
                    ) : (
                      <p className="mt-1 font-medium flex items-center gap-2">
                        <Phone className="h-4 w-4 text-green-600" />
                        {customer.phone}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>이메일</Label>
                    {editMode ? (
                      <Input
                        value={editedCustomer.email || ''}
                        onChange={(e) => setEditedCustomer({...editedCustomer, email: e.target.value})}
                        data-testid="input-edit-email"
                      />
                    ) : (
                      <p className="mt-1 font-medium flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-600" />
                        {customer.email || '미register'}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>status</Label>
                    {editMode ? (
                      <Select
                        value={editedCustomer.status}
                        onValueChange={(value: 'active' | 'inactive') => 
                          setEditedCustomer({...editedCustomer, status: value})
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">활성</SelectItem>
                          <SelectItem value="inactive">비활성</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="mt-1">
                        <Badge className={customer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {customer.status === 'active' ? '활성' : '비활성'}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-600">가입일</span>
                    </div>
                    <p className="font-bold text-blue-800">{customer.registrationDate}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <History className="h-4 w-4 text-purple-600" />
                      <span className="text-sm text-purple-600">총 booking횟수</span>
                    </div>
                    <p className="font-bold text-purple-800">{customer.totalBookings}회</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">총 구매액</span>
                    </div>
                    <p className="font-bold text-green-800">${customer.totalSpent.toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <Label>메모</Label>
                  {editMode ? (
                    <Textarea
                      value={editedCustomer.notes || ''}
                      onChange={(e) => setEditedCustomer({...editedCustomer, notes: e.target.value})}
                      placeholder="customer 관련 메모를 입력하세요..."
                      data-testid="textarea-edit-notes"
                    />
                  ) : (
                    <p className="mt-1 text-gray-700">{customer.notes || '메모 없음'}</p>
                  )}
                </div>

                {editMode && (
                  <div className="flex justify-end">
                    <Button onClick={handleSaveCustomer} data-testid="button-save-customer">
                      <Save className="h-4 w-4 mr-2" />
                      save
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Booking History */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>booking 내역</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  booking 내역을 불러오는 중...
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Marketing */}
          <TabsContent value="email" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  이메일 마케팅
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>발송 유형</Label>
                  <Select value={emailForm.type} onValueChange={(value) => setEmailForm({...emailForm, type: value})}>
                    <SelectTrigger data-testid="select-email-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">개인 발송</SelectItem>
                      <SelectItem value="group">그룹 발송</SelectItem>
                      <SelectItem value="period">기간별 customer 발송</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {emailForm.type === 'period' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>시작일</Label>
                      <Input
                        type="date"
                        value={emailForm.startDate}
                        onChange={(e) => setEmailForm({...emailForm, startDate: e.target.value})}
                        data-testid="input-email-start-date"
                      />
                    </div>
                    <div>
                      <Label>종료일</Label>
                      <Input
                        type="date"
                        value={emailForm.endDate}
                        onChange={(e) => setEmailForm({...emailForm, endDate: e.target.value})}
                        data-testid="input-email-end-date"
                      />
                    </div>
                  </div>
                )}

                {emailForm.type === 'group' && (
                  <div>
                    <Label>수신자 (쉼표로 구분)</Label>
                    <Input
                      placeholder="email1@example.com, email2@example.com"
                      value={emailForm.recipients}
                      onChange={(e) => setEmailForm({...emailForm, recipients: e.target.value})}
                      data-testid="input-email-recipients"
                    />
                  </div>
                )}

                <div>
                  <Label>제목</Label>
                  <Input
                    placeholder="이메일 제목을 입력하세요"
                    value={emailForm.subject}
                    onChange={(e) => setEmailForm({...emailForm, subject: e.target.value})}
                    data-testid="input-email-subject"
                  />
                </div>

                <div>
                  <Label>content</Label>
                  <Textarea
                    placeholder="이메일 content을 입력하세요"
                    value={emailForm.content}
                    onChange={(e) => setEmailForm({...emailForm, content: e.target.value})}
                    rows={8}
                    data-testid="textarea-email-content"
                  />
                </div>

                <Button 
                  onClick={handleSendEmail} 
                  className="w-full"
                  data-testid="button-send-email"
                >
                  <Send className="h-4 w-4 mr-2" />
                  이메일 발송
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SMS Marketing */}
          <TabsContent value="sms" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                  SMS 마케팅
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>발송 유형</Label>
                  <Select value={smsForm.type} onValueChange={(value) => setSmsForm({...smsForm, type: value})}>
                    <SelectTrigger data-testid="select-sms-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">개인 발송</SelectItem>
                      <SelectItem value="all">전체 발송</SelectItem>
                      <SelectItem value="period">기간별 customer 발송</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {smsForm.type === 'period' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>시작일</Label>
                      <Input
                        type="date"
                        value={smsForm.startDate}
                        onChange={(e) => setSmsForm({...smsForm, startDate: e.target.value})}
                        data-testid="input-sms-start-date"
                      />
                    </div>
                    <div>
                      <Label>종료일</Label>
                      <Input
                        type="date"
                        value={smsForm.endDate}
                        onChange={(e) => setSmsForm({...smsForm, endDate: e.target.value})}
                        data-testid="input-sms-end-date"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <Label>메시지 content (90자 이내)</Label>
                  <Textarea
                    placeholder="SMS content을 입력하세요"
                    value={smsForm.content}
                    onChange={(e) => setSmsForm({...smsForm, content: e.target.value.slice(0, 90)})}
                    rows={4}
                    data-testid="textarea-sms-content"
                  />
                  <div className="text-right text-sm text-gray-500 mt-1">
                    {smsForm.content.length}/90자
                  </div>
                </div>

                <Button 
                  onClick={handleSendSMS} 
                  className="w-full"
                  data-testid="button-send-sms"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  SMS 발송
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}