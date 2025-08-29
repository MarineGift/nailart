'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, User, Briefcase, Users } from 'lucide-react'
import { StaffPersonalSales } from './staff-personal-sales'
import { StaffBasicInfo } from './staff-basic-info'
import { StaffWorkHistory } from './staff-work-history'
import { CustomerBookingDisplay } from './customer-booking-display'

interface StaffManagementProps {
  currentUser?: any
}

export function StaffManagement({ currentUser }: StaffManagementProps = {}) {
  const [activeTab, setActiveTab] = useState('personal-sales')

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Staff Management System
          </CardTitle>
          <CardDescription>
            Manage staff personal sales, basic information, and work history
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger 
            value="personal-sales" 
            className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
          >
            <TrendingUp className="h-4 w-4" />
            Personal Sales
          </TabsTrigger>
          <TabsTrigger 
            value="basic-info" 
            className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
          >
            <User className="h-4 w-4" />
            Basic Info
          </TabsTrigger>
          <TabsTrigger 
            value="work-history" 
            className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
          >
            <Briefcase className="h-4 w-4" />
            Work History
          </TabsTrigger>
          <TabsTrigger 
            value="customer-bookings" 
            className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
          >
            <Users className="h-4 w-4" />
            Customer Bookings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal-sales" className="space-y-4">
          <StaffPersonalSales />
        </TabsContent>

        <TabsContent value="basic-info" className="space-y-4">
          <StaffBasicInfo />
        </TabsContent>

        <TabsContent value="work-history" className="space-y-4">
          <StaffWorkHistory />
        </TabsContent>

        <TabsContent value="customer-bookings" className="space-y-4">
          <CustomerBookingDisplay currentUser={currentUser} />
        </TabsContent>
      </Tabs>
    </div>
  )
}