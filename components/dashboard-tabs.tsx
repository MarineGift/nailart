'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { CustomerBookingFlow } from '@/components/customer-booking-flow'
import { AdminBookingInterface } from '@/components/admin-booking-interface-new'

import { AdminDashboardOverview } from '@/components/admin-dashboard-overview'
import { AdminPaymentAnalytics } from '@/components/admin-payment-analytics'
import { StaffDashboard } from '@/components/staff-dashboard'
import { CustomerInquiries } from '@/components/customer-inquiries'
import { NewsManager } from '@/components/news-manager'
import { AdminManagement } from '@/components/admin-management'
import { CustomerCRM } from '@/components/customer-crm'
import CustomerSheetView from './customer-sheet-view'
import { CustomerTimeSlotInterface } from './customer-time-slot-interface'
import CustomerManagementSheet from './customer-management-sheet'
import { AdminSettingsEnhanced } from './admin-settings-enhanced'
import { ARNailTryOn } from '@/components/ar-nail-tryon'
import { NailDesignManager } from '@/components/nail-design-manager'
import { AdminBookingCalendar } from '@/components/admin-booking-calendar'
import { AdminCalendarAssignment } from '@/components/admin-calendar-assignment'
import { AdminAssignmentInterface } from '@/components/admin-assignment-interface'
import { CustomerSheetManagement } from '@/components/customer-sheet-management'
import { CRMManagement } from '@/components/crm-management'
import { StaffManagement } from '@/components/staff-management'
import { ServicesManagement } from '@/components/services-management'
import { TreatmentManagement } from '@/components/treatment-management'
import { EnhancedAssignmentInterface } from '@/components/enhanced-assignment-interface'
import { HolidayManagement } from '@/components/holiday-management'
import { Users, Image, Newspaper, BarChart3, Shield, Calendar, CalendarIcon, UserCheck, Package, Sparkles, Settings, Camera, Palette, LogOut, CreditCard, TrendingUp, Star, User, Mail, Menu, X, ClipboardCheck, MessageSquare } from 'lucide-react'

interface DashboardTabsProps {
  currentUser: any
}

interface DashboardStats {
  todaysBookings: number
  totalCustomers: number
  completedToday: number
  scheduledToday: number
  activeStaff: number
  monthlyRevenueUsd: number
}

export function DashboardTabs({ currentUser }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<string>('dashboard')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [showCustomerSheet, setShowCustomerSheet] = useState(false)
  const [showCustomerManagement, setShowCustomerManagement] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    todaysBookings: 0,
    totalCustomers: 0,
    completedToday: 0,
    scheduledToday: 0,
    activeStaff: 0,
    monthlyRevenueUsd: 0
  })
  const [todayWorkingStaff, setTodayWorkingStaff] = useState<any[]>([])
  const [todaysBookings, setTodaysBookings] = useState<any[]>([])

  // Fetch real dashboard statistics - use consistent data source
  useEffect(() => {
    fetchUnifiedDashboardStats()
    fetchTodayWorkingStaff()
  }, [])

  const fetchUnifiedDashboardStats = async () => {
    try {
      // Use consistent date formatting
      const today = new Date()
      const todayStr = today.getFullYear() + '-' + 
                      String(today.getMonth() + 1).padStart(2, '0') + '-' +
                      String(today.getDate()).padStart(2, '0')
      
      console.log('=== DASHBOARD STATS DEBUG ===')
      console.log('Today string for API:', todayStr)
      
      // Fetch all data with consistent date format
      const [bookingsResponse, customersResponse, staffResponse, monthlyResponse] = await Promise.all([
        fetch(`/api/bookings?date=${todayStr}`),
        fetch('/api/customers'),
        fetch(`/api/staff?date=${todayStr}`),
        fetch('/api/treatments?period=month')
      ])

      const bookings = bookingsResponse.ok ? await bookingsResponse.json() : []
      const customers = customersResponse.ok ? await customersResponse.json() : []
      const workingStaff = staffResponse.ok ? await staffResponse.json() : []
      const monthlyTreatments = monthlyResponse.ok ? await monthlyResponse.json() : []

      console.log('Dashboard fetched data:')
      console.log('- Bookings:', bookings)
      console.log('- Bookings count:', bookings.length)
      console.log('- Customers count:', customers.length)
      console.log('- Working staff count:', workingStaff.length)

      // Calculate statistics using exact same logic as AdminDashboardOverview
      const todaysBookingsCount = bookings.length
      const completedToday = bookings.filter((b: any) => b.status === 'completed').length
      const scheduledToday = bookings.filter((b: any) => 
        b.status === 'confirmed' || b.status === 'pending' || b.status === 'scheduled'
      ).length
      
      console.log('Calculated stats:')
      console.log('- Total bookings:', todaysBookingsCount)
      console.log('- Completed today:', completedToday)
      console.log('- Scheduled today:', scheduledToday)
      
      const monthlyRevenue = monthlyTreatments.reduce((sum: number, t: any) => 
        sum + (t.grand_total_cents || 0), 0) / 100

      setDashboardStats({
        todaysBookings: todaysBookingsCount,
        totalCustomers: customers.length,
        completedToday,
        scheduledToday,
        activeStaff: workingStaff.length,
        monthlyRevenueUsd: monthlyRevenue
      })

      setTodaysBookings(bookings)
      console.log('=== END DASHBOARD STATS DEBUG ===')
    } catch (error) {
      console.error('Error fetching unified dashboard stats:', error)
    }
  }

  const fetchTodayWorkingStaff = async () => {
    try {
      const today = new Date()
      const todayDate = today.getFullYear() + '-' + 
                        String(today.getMonth() + 1).padStart(2, '0') + '-' +
                        String(today.getDate()).padStart(2, '0')
      
      // Fetch working staff for today
      const staffResponse = await fetch(`/api/staff?date=${todayDate}`)
      const workingStaff = staffResponse.ok ? await staffResponse.json() : []
      
      // Note: staff-skills API temporarily disabled due to missing Supabase table
      // const skillsResponse = await fetch('/api/staff-skills')
      // const staffSkills = skillsResponse.ok ? await skillsResponse.json() : []
      
      // Combine staff with mock skills for now
      const staffWithSkills = workingStaff.map((staff: any) => {
        return {
          ...staff,
          skills: [
            { name: 'Manicure', level: 'Expert' },
            { name: 'Pedicure', level: 'Advanced' },
            { name: 'Nail Art', level: 'Intermediate' }
          ]
        }
      })
      
      setTodayWorkingStaff(staffWithSkills)
    } catch (error) {
      console.error('Error fetching working staff:', error)
      setTodayWorkingStaff([])
    }
  }

  // Mock role change for demo purposes
  const handleRoleChange = (role: string) => {
    console.log(`Role change requested to: ${role}`)
    // In a real app, this would trigger authentication flow
  }

  // Role-based rendering - redirect customers to booking flow
  if (currentUser.role === 'staff') {
    // Staff only see their assigned bookings and simple schedule
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-purple-200">
          <CardHeader>
            <CardTitle className="text-xl">Staff Dashboard</CardTitle>
            <CardDescription>
              Today's schedule for {currentUser.firstName} {currentUser.lastName}
            </CardDescription>
          </CardHeader>
        </Card>
        <StaffDashboard currentUser={{
          id: currentUser.id.toString(),
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          position: currentUser.position,
          specialties: ['Nail Art', 'Gel Nails'],
          experience_years: 3,
          rating: 4.8
        }} />
      </div>
    )
  }

  if (currentUser.role === 'customer') {
    return (
      <div className="space-y-6">
        {/* Customer Header */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">ConnieNail Booking System</CardTitle>
                <CardDescription>Premium nail salon appointments made easy</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleRoleChange('staff')}>
                  Staff Login
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleRoleChange('admin')}>
                  Admin Login
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Customer Booking Interface */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Booking Schedule</h2>
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              data-testid="input-customer-date-picker"
            />
          </div>
          <CustomerTimeSlotInterface selectedDate={selectedDate} />
        </div>
      </div>
    )
  }

  // Show Customer Sheet View if requested
  if (showCustomerSheet) {
    return (
      <CustomerSheetView onBack={() => setShowCustomerSheet(false)} />
    )
  }

  // Show Customer Management Sheet if requested
  if (showCustomerManagement) {
    return (
      <CustomerManagementSheet onBack={() => setShowCustomerManagement(false)} />
    )
  }

  // Admin Dashboard (for admin and manager roles)
  return (
    <div className="space-y-6">


      {/* Admin Tabs - 바로 상단 카드 아래 배치 */}
      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        {/* Desktop Tabs - Enhanced styling for better differentiation */}
        <div className="hidden lg:block">
          <TabsList className="grid w-full grid-cols-11 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 p-2 rounded-2xl shadow-lg border border-purple-200">
          <TabsTrigger 
            value="dashboard" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 text-sm px-3 py-2 rounded-lg"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger 
            value="calendar"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 text-sm px-3 py-2 rounded-lg"
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Booking
          </TabsTrigger>
          <TabsTrigger 
            value="assign"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 text-sm px-3 py-2 rounded-lg"
          >
            <Users className="h-4 w-4 mr-2" />
            Assignment
          </TabsTrigger>
          <TabsTrigger 
            value="customer-management"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 text-sm px-3 py-2 rounded-lg"
          >
            <User className="h-4 w-4 mr-2" />
            Customers
          </TabsTrigger>
          <TabsTrigger 
            value="staff"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 text-sm px-3 py-2 rounded-lg"
          >
            <UserCheck className="h-4 w-4 mr-2" />
            Staff
          </TabsTrigger>
          <TabsTrigger 
            value="crm"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 text-sm px-3 py-2 rounded-lg"
          >
            <Mail className="h-4 w-4 mr-2" />
            CRM
          </TabsTrigger>
          <TabsTrigger 
            value="payments"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 text-sm px-3 py-2 rounded-lg"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Payments
          </TabsTrigger>
          <TabsTrigger 
            value="treatment"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 text-sm px-3 py-2 rounded-lg"
          >
            <ClipboardCheck className="h-4 w-4 mr-2" />
            Treatment
          </TabsTrigger>
          <TabsTrigger 
            value="inquiries"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 text-sm px-3 py-2 rounded-lg"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Inquiries
          </TabsTrigger>
          <TabsTrigger 
            value="settings"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 text-sm px-3 py-2 rounded-lg"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>
        </div>

        {/* Mobile Tab Selector - Enhanced styling */}
        <div className="lg:hidden">
          <Button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-full justify-between bg-gradient-to-r from-blue-600 to-purple-700 text-white hover:from-blue-700 hover:to-purple-800 shadow-lg border-0 h-14 text-lg font-semibold rounded-xl"
          >
            <span className="flex items-center gap-2">
              {activeTab === 'dashboard' && <><BarChart3 className="h-4 w-4" /> Dashboard</>}
              {activeTab === 'calendar' && <><CalendarIcon className="h-4 w-4" /> Booking</>}
              {activeTab === 'assign' && <><Users className="h-4 w-4" /> Assignment</>}
              {activeTab === 'customer-management' && <><User className="h-4 w-4" /> Customers</>}
              {activeTab === 'staff' && <><UserCheck className="h-4 w-4" /> Staff</>}
              {activeTab === 'crm' && <><Mail className="h-4 w-4" /> CRM</>}
              {activeTab === 'payments' && <><CreditCard className="h-4 w-4" /> Payments</>}
              {activeTab === 'treatment' && <><ClipboardCheck className="h-4 w-4" /> Treatment</>}
              {activeTab === 'inquiries' && <><MessageSquare className="h-4 w-4" /> Inquiries</>}
              {activeTab === 'settings' && <><Settings className="h-4 w-4" /> Settings</>}
            </span>
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
          
          {isMobileMenuOpen && (
            <div className="mt-4 p-4 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl border-2 border-purple-200 grid grid-cols-2 gap-3">
              <Button variant="ghost" size="sm" onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false) }}
                className={activeTab === 'dashboard' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md' : 'hover:bg-gray-100'}>
                <BarChart3 className="h-4 w-4 mr-2" /> Dashboard
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { setActiveTab('calendar'); setIsMobileMenuOpen(false) }}
                className={activeTab === 'calendar' ? 'bg-purple-100 text-purple-800' : ''}>
                <CalendarIcon className="h-4 w-4 mr-2" /> Booking
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { setActiveTab('assign'); setIsMobileMenuOpen(false) }}
                className={activeTab === 'assign' ? 'bg-purple-100 text-purple-800' : ''}>
                <Users className="h-4 w-4 mr-2" /> Assignment
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { setActiveTab('customer-management'); setIsMobileMenuOpen(false) }}
                className={activeTab === 'customer-management' ? 'bg-purple-100 text-purple-800' : ''}>
                <User className="h-4 w-4 mr-2" /> Customers
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { setActiveTab('staff'); setIsMobileMenuOpen(false) }}
                className={activeTab === 'staff' ? 'bg-purple-100 text-purple-800' : ''}>
                <UserCheck className="h-4 w-4 mr-2" /> Staff
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { setActiveTab('crm'); setIsMobileMenuOpen(false) }}
                className={activeTab === 'crm' ? 'bg-purple-100 text-purple-800' : ''}>
                <Mail className="h-4 w-4 mr-2" /> CRM
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { setActiveTab('payments'); setIsMobileMenuOpen(false) }}
                className={activeTab === 'payments' ? 'bg-purple-100 text-purple-800' : ''}>
                <CreditCard className="h-4 w-4 mr-2" /> Payments
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { setActiveTab('treatment'); setIsMobileMenuOpen(false) }}
                className={activeTab === 'treatment' ? 'bg-purple-100 text-purple-800' : ''}>
                <ClipboardCheck className="h-4 w-4 mr-2" /> Treatment
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { setActiveTab('inquiries'); setIsMobileMenuOpen(false) }}
                className={activeTab === 'inquiries' ? 'bg-purple-100 text-purple-800' : ''}>
                <MessageSquare className="h-4 w-4 mr-2" /> Inquiries
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false) }}
                className={activeTab === 'settings' ? 'bg-purple-100 text-purple-800' : ''}>
                <Settings className="h-4 w-4 mr-2" /> Settings
              </Button>
            </div>
          )}
        </div>

        {/* Tab Content */}
        <TabsContent value="dashboard" className="space-y-6">
          <AdminDashboardOverview />
          
          {/* Today's Bookings List & Working Staff */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            {/* Today's Bookings List */}
            <div className="bg-white rounded-xl p-6 shadow-lg border-0">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                  Today's Bookings ({todaysBookings.length})
                </h2>
                <p className="text-sm text-gray-500">{format(new Date(), 'MMM dd, yyyy')}</p>
              </div>
              
              {/* Bookings List */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {todaysBookings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No bookings scheduled for today</p>
                  </div>
                ) : (
                  todaysBookings.map((booking: any, index) => (
                    <div key={booking.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {booking.time_slot || 'Unknown'} - {booking.customer_name || booking.customers?.last_name || 'Unknown Customer'}
                          </p>
                          <p className="text-sm text-gray-600">{booking.serviceName || booking.service_name || booking.services || 'Unknown Service'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          booking.status === 'completed' ? 'bg-green-100 text-green-600' :
                          booking.status === 'confirmed' ? 'bg-blue-100 text-blue-600' :
                          'bg-orange-100 text-orange-600'
                        }`}>
                          {booking.status === 'completed' ? 'Completed' :
                           booking.status === 'confirmed' ? 'Confirmed' : 
                           booking.status === 'scheduled' ? 'Scheduled' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Today's Working Staff */}
            <div className="bg-white rounded-xl p-6 shadow-lg border-0">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-amber-600" />
                  Today's Working Staff ({todayWorkingStaff.length})
                </h2>
                <p className="text-sm text-gray-500">Active Staff</p>
              </div>
              
              {/* Staff List */}
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {todayWorkingStaff.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No staff working today</p>
                  </div>
                ) : (
                  todayWorkingStaff.map((staff: any, index) => (
                    <div key={staff.id || index} className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {(staff.firstName || staff.first_name || staff.name || 'U')[0]}{(staff.lastName || staff.last_name || '')[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">
                              {staff.firstName || staff.first_name || staff.name} {staff.lastName || staff.last_name}
                            </p>
                            <p className="text-sm text-amber-600">{staff.position || staff.role}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                            Active
                          </span>
                        </div>
                      </div>
                      
                      {/* Skills Display */}
                      <div className="mt-3">
                        <p className="text-xs font-medium text-gray-600 mb-2">Skills & Specialties:</p>
                        <div className="flex flex-wrap gap-1">
                          {staff.skills && staff.skills.length > 0 ? (
                            staff.skills.map((skill: any, skillIndex: number) => (
                              <span 
                                key={skillIndex}
                                className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200"
                              >
                                {skill.name} 
                              </span>
                            ))
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {['Nail Care', 'Manicure'].map((specialty: string, specIndex: number) => (
                                <span key={specIndex} className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                                  {specialty}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Working Hours */}
                      <div className="mt-2 text-xs text-amber-600">
                        Hours: {staff.workingStartTime || '10:00'} - {staff.workingEndTime || '19:00'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </TabsContent>


        <TabsContent value="calendar" className="space-y-6">
          <AdminBookingCalendar currentUser={currentUser} />
        </TabsContent>

        <TabsContent value="assign" className="space-y-6">
          <EnhancedAssignmentInterface />
        </TabsContent>

        <TabsContent value="customer-management" className="space-y-6">
          <CustomerSheetManagement />
        </TabsContent>

        <TabsContent value="staff" className="space-y-6">
          <StaffManagement currentUser={currentUser} />
        </TabsContent>

        <TabsContent value="crm" className="space-y-6">
          <CRMManagement />
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <AdminPaymentAnalytics />
        </TabsContent>

        <TabsContent value="treatment" className="space-y-6">
          <TreatmentManagement selectedDate={selectedDate} />
        </TabsContent>


        <TabsContent value="inquiries" className="space-y-6">
          <CustomerInquiries />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <AdminSettingsEnhanced currentUser={currentUser} />
        </TabsContent>
      </Tabs>
    </div>
  )
}