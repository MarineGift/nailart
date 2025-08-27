'use client'

import React, { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Mail, MessageSquare, Phone, User, Calendar, DollarSign } from 'lucide-react'
import CustomerCRMModal from './customer-crm-modal'

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

interface CustomerSheetViewProps {
  onBack: () => void
}

export default function CustomerSheetView({ onBack }: CustomerSheetViewProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isCRMModalOpen, setIsCRMModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCustomers()
  }, [])

  useEffect(() => {
    const filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    setFilteredCustomers(filtered)
  }, [customers, searchTerm])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/customers')
      if (response.ok) {
        const data = await response.json()
        
        // Transform customer data to include additional fields
        const transformedData = data.map((customer: any) => ({
          ...customer,
          registrationDate: customer.registrationDate || '2024-01-01',
          totalBookings: Math.floor(Math.random() * 20) + 1, // Mock data
          totalSpent: Math.floor(Math.random() * 500000) + 50000, // Mock data
          lastVisit: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: Math.random() > 0.1 ? 'active' : 'inactive',
          notes: Math.random() > 0.7 ? 'VIP customer' : ''
        }))
        
        setCustomers(transformedData)
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCustomerClick = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsCRMModalOpen(true)
  }

  const getStatusBadge = (status: string) => {
    return status === 'active' 
      ? <Badge className="bg-green-100 text-green-800">활성</Badge>
      : <Badge className="bg-gray-100 text-gray-800">비활성</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">customer information를 불러오는 중...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack} data-testid="button-back">
            ← 대시보드로 돌아가기
          </Button>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <User className="h-6 w-6 text-purple-600" />
            customer management
          </h1>
        </div>
        
        {/* Search */}
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="이름, 전화번호, 이메일로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-customer-search"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">전체 customer</p>
                <p className="text-2xl font-bold">{customers.length}</p>
              </div>
              <User className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">활성 customer</p>
                <p className="text-2xl font-bold">{customers.filter(c => c.status === 'active').length}</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">이번 달 신규</p>
                <p className="text-2xl font-bold">{Math.floor(customers.length * 0.15)}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">평균 구매액</p>
                <p className="text-2xl font-bold">${Math.floor(customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length || 0).toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>customer 목록 ({filteredCustomers.length}명)</span>
            <div className="text-sm text-gray-500">
              클릭하여 상세information 및 마케팅 기능 이용
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>전화번호</TableHead>
                <TableHead>이메일</TableHead>
                <TableHead>가입일</TableHead>
                <TableHead>booking횟수</TableHead>
                <TableHead>총 구매액</TableHead>
                <TableHead>최근방문</TableHead>
                <TableHead>status</TableHead>
                <TableHead>메모</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow 
                  key={customer.id} 
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleCustomerClick(customer)}
                  data-testid={`row-customer-${customer.id}`}
                >
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell className="text-blue-600">{customer.email || '-'}</TableCell>
                  <TableCell>{customer.registrationDate}</TableCell>
                  <TableCell className="text-center">{customer.totalBookings}</TableCell>
                  <TableCell>${customer.totalSpent.toLocaleString()}</TableCell>
                  <TableCell>{customer.lastVisit || '-'}</TableCell>
                  <TableCell>{getStatusBadge(customer.status)}</TableCell>
                  <TableCell>
                    {customer.notes && (
                      <Badge variant="outline" className="text-xs">
                        {customer.notes}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? '검색 결과가 없습니다.' : 'customer data가 없습니다.'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer CRM Modal */}
      {selectedCustomer && (
        <CustomerCRMModal
          isOpen={isCRMModalOpen}
          onClose={() => setIsCRMModalOpen(false)}
          customer={selectedCustomer}
        />
      )}
    </div>
  )
}