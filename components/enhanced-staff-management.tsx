'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { format, isToday, parseISO } from 'date-fns'
import { 
  Users, 
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Plus,
  Edit,
  Eye,
  History,
  Star,
  Award,
  Briefcase,
  GraduationCap,
  UserPlus,
  UserMinus,
  Plane,
  Coffee,
  TrendingUp,
  CalendarDays,
  DollarSign,
  Search,
  Filter
} from 'lucide-react'

interface Staff {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  role: string
  skills: string[]
  hireDate: string
  isActive: boolean
  workDays: number[]
  hourlyRate: number
  profileImageUrl?: string
  bio?: string
  specializations?: string[]
  languages?: string[]
  certifications?: string[]
}

interface WorkHistoryEvent {
  id: string
  staffId: string
  eventType: 'hire' | 'resignation' | 'vacation' | 'home_visit' | 'promotion' | 'training'
  eventDate: string
  endDate?: string
  title: string
  description?: string
  notes?: string
  attachments?: string[]
  createdAt: string
}

interface StaffService {
  id: string
  staffId: string
  customerId: string
  customerName: string
  serviceName: string
  serviceDate: string
  duration: number
  price: number
  status: string
  type: 'booking' | 'treatment' | 'rebooking'
  notes?: string
}

interface StaffStats {
  totalStaff: number
  activeStaff: number
  onVacation: number
  newHires: number
  totalServices: number
  avgRating: number
}

interface EnhancedStaffManagementProps {
  currentUser?: any
}

export default function EnhancedStaffManagement({ currentUser }: EnhancedStaffManagementProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [staff, setStaff] = useState<Staff[]>([])
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [workHistory, setWorkHistory] = useState<WorkHistoryEvent[]>([])
  const [staffServices, setStaffServices] = useState<StaffService[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showStaffDialog, setShowStaffDialog] = useState(false)
  const [showHistoryDialog, setShowHistoryDialog] = useState(false)
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)
  const [newHistoryEvent, setNewHistoryEvent] = useState<Partial<WorkHistoryEvent>>({
    eventType: 'vacation',
    eventDate: format(new Date(), 'yyyy-MM-dd'),
    title: '',
    description: '',
    notes: ''
  })
  
  const [staffStats, setStaffStats] = useState<StaffStats>({
    totalStaff: 0,
    activeStaff: 0,
    onVacation: 0,
    newHires: 0,
    totalServices: 0,
    avgRating: 0
  })

  useEffect(() => {
    loadStaff()
    loadStaffStats()
  }, [])

  useEffect(() => {
    if (selectedStaff) {
      loadWorkHistory(selectedStaff.id)
      loadStaffServices(selectedStaff.id)
    }
  }, [selectedStaff, selectedDate, dateFrom, dateTo])

  const loadStaff = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/staff')
      if (response.ok) {
        const data = await response.json()
        setStaff(data)
      }
    } catch (error) {
      console.error('Error loading staff:', error)
      toast({
        title: "Error",
        description: "Failed to load staff",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadStaffStats = async () => {
    try {
      const response = await fetch('/api/staff/stats')
      if (response.ok) {
        const data = await response.json()
        setStaffStats(data)
      }
    } catch (error) {
      console.error('Error loading staff stats:', error)
    }
  }

  const loadWorkHistory = async (staffId: string) => {
    try {
      const response = await fetch(`/api/staff/${staffId}/work-history`)
      if (response.ok) {
        const data = await response.json()
        setWorkHistory(data)
      }
    } catch (error) {
      console.error('Error loading work history:', error)
    }
  }

  const loadStaffServices = async (staffId: string) => {
    try {
      let url = `/api/staff/${staffId}/services`
      const params = new URLSearchParams()
      
      if (selectedDate) params.append('date', selectedDate)
      if (dateFrom) params.append('from', dateFrom)
      if (dateTo) params.append('to', dateTo)
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setStaffServices(data)
      }
    } catch (error) {
      console.error('Error loading staff services:', error)
    }
  }

  const addWorkHistoryEvent = async () => {
    if (!selectedStaff || !newHistoryEvent.title || !newHistoryEvent.eventDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch('/api/work-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newHistoryEvent,
          staffId: selectedStaff.id
        })
      })

      if (response.ok) {
        await loadWorkHistory(selectedStaff.id)
        setShowHistoryDialog(false)
        setNewHistoryEvent({
          eventType: 'vacation',
          eventDate: format(new Date(), 'yyyy-MM-dd'),
          title: '',
          description: '',
          notes: ''
        })
        toast({
          title: "Success",
          description: "Work history event added successfully",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add work history event",
        variant: "destructive",
      })
    }
  }

  const getWorkDaysText = (workDays: number[] | undefined) => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    if (!workDays || workDays.length === 0) {
      return 'Not set'
    }
    return workDays.map(day => dayNames[day] || 'Unknown').join(', ')
  }

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      'manager': { color: 'bg-purple-100 text-purple-800', icon: Star },
      'senior': { color: 'bg-blue-100 text-blue-800', icon: Award },
      'specialist': { color: 'bg-green-100 text-green-800', icon: GraduationCap },
      'technician': { color: 'bg-gray-100 text-gray-800', icon: User },
    }
    
    const config = roleConfig[(role || '').toLowerCase() as keyof typeof roleConfig] || roleConfig.technician
    const Icon = config.icon
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {role}
      </Badge>
    )
  }

  const getEventTypeIcon = (eventType: string) => {
    const iconMap = {
      'hire': UserPlus,
      'resignation': UserMinus,
      'vacation': Coffee,
      'home_visit': Plane,
      'promotion': TrendingUp,
      'training': GraduationCap
    }
    
    return iconMap[eventType as keyof typeof iconMap] || CalendarDays
  }

  const getEventTypeBadge = (eventType: string) => {
    const typeConfig = {
      'hire': { color: 'bg-green-100 text-green-800', label: 'Hired' },
      'resignation': { color: 'bg-red-100 text-red-800', label: 'Resigned' },
      'vacation': { color: 'bg-blue-100 text-blue-800', label: 'Vacation' },
      'home_visit': { color: 'bg-purple-100 text-purple-800', label: 'Home Visit' },
      'promotion': { color: 'bg-yellow-100 text-yellow-800', label: 'Promotion' },
      'training': { color: 'bg-indigo-100 text-indigo-800', label: 'Training' }
    }
    
    const config = typeConfig[eventType as keyof typeof typeConfig] || typeConfig.vacation
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = selectedRole === 'all' || member.role.toLowerCase() === selectedRole.toLowerCase()
    
    return matchesSearch && matchesRole
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Staff Management</h2>
          <p className="text-muted-foreground">
            Manage staff information, work history, and daily service tracking
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={!selectedStaff} data-testid="button-add-history">
                <Plus className="h-4 w-4 mr-2" />
                Add History
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Work History Event</DialogTitle>
                <DialogDescription>
                  Record a new work history event for {selectedStaff?.firstName} {selectedStaff?.lastName}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="event-type">Event Type</Label>
                    <Select
                      value={newHistoryEvent.eventType}
                      onValueChange={(value) => setNewHistoryEvent(prev => ({ ...prev, eventType: value as any }))}
                    >
                      <SelectTrigger data-testid="select-event-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hire">Hire</SelectItem>
                        <SelectItem value="resignation">Resignation</SelectItem>
                        <SelectItem value="vacation">Vacation</SelectItem>
                        <SelectItem value="home_visit">Home Visit</SelectItem>
                        <SelectItem value="promotion">Promotion</SelectItem>
                        <SelectItem value="training">Training</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="event-date">Event Date</Label>
                    <Input
                      id="event-date"
                      type="date"
                      value={newHistoryEvent.eventDate}
                      onChange={(e) => setNewHistoryEvent(prev => ({ ...prev, eventDate: e.target.value }))}
                      data-testid="input-event-date"
                    />
                  </div>
                </div>

                {(newHistoryEvent.eventType === 'vacation' || newHistoryEvent.eventType === 'home_visit') && (
                  <div>
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={newHistoryEvent.endDate || ''}
                      onChange={(e) => setNewHistoryEvent(prev => ({ ...prev, endDate: e.target.value }))}
                      data-testid="input-end-date"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newHistoryEvent.title}
                    onChange={(e) => setNewHistoryEvent(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Brief title for this event"
                    data-testid="input-title"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newHistoryEvent.description}
                    onChange={(e) => setNewHistoryEvent(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed description"
                    data-testid="textarea-description"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newHistoryEvent.notes}
                    onChange={(e) => setNewHistoryEvent(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes"
                    data-testid="textarea-notes"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowHistoryDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={addWorkHistoryEvent} data-testid="button-save-history">
                    Add Event
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Staff Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Staff</p>
                <p className="text-2xl font-bold">{staffStats.totalStaff}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active Today</p>
                <p className="text-2xl font-bold">{staffStats.activeStaff}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Coffee className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">On Vacation</p>
                <p className="text-2xl font-bold">{staffStats.onVacation}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserPlus className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">New Hires</p>
                <p className="text-2xl font-bold">{staffStats.newHires}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-4 w-4 text-indigo-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Services Today</p>
                <p className="text-2xl font-bold">{staffStats.totalServices}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold">{staffStats.avgRating.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="search">Search Staff</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name or email"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                  data-testid="input-staff-search"
                />
              </div>
            </div>

            <div className="min-w-[150px]">
              <Label htmlFor="role-filter">Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger data-testid="select-staff-role">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                  <SelectItem value="specialist">Specialist</SelectItem>
                  <SelectItem value="technician">Technician</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="min-w-[130px]">
              <Label htmlFor="selected-date">Selected Date</Label>
              <Input
                id="selected-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                data-testid="input-selected-date"
              />
            </div>

            <div className="min-w-[130px]">
              <Label htmlFor="date-from">From Date</Label>
              <Input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                data-testid="input-date-from"
              />
            </div>

            <div className="min-w-[130px]">
              <Label htmlFor="date-to">To Date</Label>
              <Input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                data-testid="input-date-to"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staff List and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Staff List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Staff List ({filteredStaff.length})
              <Badge variant="secondary">{filteredStaff.length} staff members</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredStaff.map((member) => (
                <div
                  key={member.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedStaff?.id === member.id ? 'border-purple-500 bg-purple-50' : ''
                  }`}
                  onClick={() => setSelectedStaff(member)}
                  data-testid={`staff-card-${member.id}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{member.firstName} {member.lastName}</h4>
                        <p className="text-sm text-gray-600">{member.email}</p>
                      </div>
                    </div>
                    {getRoleBadge(member.role)}
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {member.phoneNumber}
                    </div>
                    <div className="flex justify-between">
                      <span>Work Days: {getWorkDaysText(member.workDays)}</span>
                      <Badge variant={member.isActive ? 'default' : 'secondary'}>
                        {member.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Hired: {member.hireDate ? format(new Date(member.hireDate), 'MMM dd, yyyy') : 'Not set'}</span>
                      <span>${member.hourlyRate || 0}/hr</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredStaff.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No staff members found matching your criteria
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Staff Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {selectedStaff ? 'Staff Details' : 'Select a Staff Member'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedStaff ? (
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="info">Info</TabsTrigger>
                  <TabsTrigger value="services">Services</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                  <TabsTrigger value="schedule">Schedule</TabsTrigger>
                </TabsList>

                {/* Staff Information */}
                <TabsContent value="info" className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{selectedStaff.firstName} {selectedStaff.lastName}</h3>
                      {getRoleBadge(selectedStaff.role)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Email:</span>
                      <p>{selectedStaff.email}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Phone:</span>
                      <p>{selectedStaff.phoneNumber}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Hire Date:</span>
                      <p>{selectedStaff.hireDate ? format(new Date(selectedStaff.hireDate), 'MMM dd, yyyy') : 'Not set'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Hourly Rate:</span>
                      <p>${selectedStaff.hourlyRate || 0}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Work Days:</span>
                      <p>{getWorkDaysText(selectedStaff.workDays)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Status:</span>
                      <Badge variant={selectedStaff.isActive ? 'default' : 'secondary'}>
                        {selectedStaff.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>

                  {selectedStaff.skills && selectedStaff.skills.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-600">Skills:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedStaff.skills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedStaff.bio && (
                    <div>
                      <span className="font-medium text-gray-600">Bio:</span>
                      <p className="text-sm">{selectedStaff.bio}</p>
                    </div>
                  )}
                </TabsContent>

                {/* Daily Services */}
                <TabsContent value="services" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">
                      Services for {isToday(parseISO(selectedDate)) ? 'Today' : format(parseISO(selectedDate), 'MMM dd, yyyy')}
                    </h4>
                    <Badge variant="secondary">{staffServices.length} services</Badge>
                  </div>

                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {staffServices.map((service) => (
                      <div key={service.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{service.serviceName}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {service.type}
                            </Badge>
                            <Badge 
                              variant={service.status === 'completed' ? 'default' : 'secondary'}
                              className={
                                service.status === 'completed' ? 'bg-green-100 text-green-800' :
                                service.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }
                            >
                              {service.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex justify-between">
                            <span>Customer: {service.customerName}</span>
                            <span>${service.price}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{format(new Date(service.serviceDate), 'h:mm a')}</span>
                            <span>{service.duration} min</span>
                          </div>
                          {service.notes && (
                            <p className="text-xs bg-gray-50 p-2 rounded">{service.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {staffServices.length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        No services found for this date
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Work History */}
                <TabsContent value="history" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Work History</h4>
                    <Badge variant="secondary">{workHistory.length} events</Badge>
                  </div>

                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {workHistory.map((event) => {
                      const EventIcon = getEventTypeIcon(event.eventType)
                      return (
                        <div key={event.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <EventIcon className="h-4 w-4 text-gray-600" />
                              <span className="font-medium">{event.title}</span>
                            </div>
                            {getEventTypeBadge(event.eventType)}
                          </div>
                          
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex justify-between">
                              <span>Date: {format(new Date(event.eventDate), 'MMM dd, yyyy')}</span>
                              {event.endDate && (
                                <span>End: {format(new Date(event.endDate), 'MMM dd, yyyy')}</span>
                              )}
                            </div>
                            {event.description && (
                              <p className="text-xs">{event.description}</p>
                            )}
                            {event.notes && (
                              <p className="text-xs bg-gray-50 p-2 rounded">{event.notes}</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                    
                    {workHistory.length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        No work history events found
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Schedule */}
                <TabsContent value="schedule" className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Work Schedule</h4>
                    <div className="text-sm text-gray-600">
                      <p>Work Days: {getWorkDaysText(selectedStaff.workDays)}</p>
                      <p>Hourly Rate: ${selectedStaff.hourlyRate}</p>
                      <p>Status: {selectedStaff.isActive ? 'Active' : 'Inactive'}</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Select a staff member from the list to view details and work history</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}