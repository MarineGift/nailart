'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Clock, User, Calendar, Plus, Filter, Search } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'

interface LoginHistoryEntry {
  id: string
  user_id: string
  username: string
  login_timestamp: string
  ip_address: string
  user_agent: string
  input_person: string
  created_at: string
}

interface StaffWorkHistoryEntry {
  id: string
  staff_id: string
  staff_name: string
  event_type: string
  event_date: string
  notes: string
  input_person: string
  input_timestamp: string
  created_at: string
}

const eventTypeLabels = {
  hire: 'Hire',
  resign: 'Resign',
  vacation_start: 'Vacation Start',
  vacation_return: 'Vacation Return',
  marriage: 'Marriage',
  return_from_abroad: 'Return from Abroad'
}

const eventTypeColors = {
  hire: 'bg-green-500',
  resign: 'bg-red-500',
  vacation_start: 'bg-blue-500',
  vacation_return: 'bg-green-500',
  marriage: 'bg-pink-500',
  return_from_abroad: 'bg-purple-500'
}

export function LogHistory() {
  const [loginHistory, setLoginHistory] = useState<LoginHistoryEntry[]>([])
  const [staffWorkHistory, setStaffWorkHistory] = useState<StaffWorkHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'login' | 'staff'>('login')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all')
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    staff_id: '',
    staff_name: '',
    event_type: 'hire',
    event_date: '',
    notes: '',
    input_person: 'Admin'
  })

  useEffect(() => {
    fetchLoginHistory()
    fetchStaffWorkHistory()
  }, [])

  const fetchLoginHistory = async () => {
    try {
      const response = await fetch('/api/login-history')
      if (response.ok) {
        const data = await response.json()
        setLoginHistory(data)
      }
    } catch (error) {
      console.error('Failed to fetch login history:', error)
      toast({
        title: 'Error',
        description: 'Failed to load login history',
        variant: 'destructive'
      })
    }
  }

  const fetchStaffWorkHistory = async () => {
    try {
      const response = await fetch('/api/staff-work-history')
      if (response.ok) {
        const data = await response.json()
        setStaffWorkHistory(data)
      }
    } catch (error) {
      console.error('Failed to fetch staff work history:', error)
      toast({
        title: 'Error',
        description: 'Failed to load staff work history',
        variant: 'destructive'
      })
    }
    setLoading(false)
  }

  const handleAddWorkHistory = async () => {
    if (!formData.staff_name || !formData.event_date) {
      toast({
        title: 'Error',
        description: 'Please fill in required fields',
        variant: 'destructive'
      })
      return
    }

    try {
      const response = await fetch('/api/staff-work-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          staff_id: formData.staff_id || crypto.randomUUID()
        })
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Work history entry added successfully'
        })
        setShowAddDialog(false)
        setFormData({
          staff_id: '',
          staff_name: '',
          event_type: 'hire',
          event_date: '',
          notes: '',
          input_person: 'Admin'
        })
        fetchStaffWorkHistory()
      }
    } catch (error) {
      console.error('Failed to add work history:', error)
      toast({
        title: 'Error',
        description: 'Failed to add work history entry',
        variant: 'destructive'
      })
    }
  }

  const filteredStaffHistory = staffWorkHistory.filter(entry => {
    const matchesSearch = entry.staff_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEventType = eventTypeFilter === 'all' || entry.event_type === eventTypeFilter
    return matchesSearch && matchesEventType
  })

  const filteredLoginHistory = loginHistory.filter(entry =>
    entry.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.ip_address?.includes(searchTerm)
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Log History Management
          </CardTitle>
          <CardDescription>
            Track login history and staff work events
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'login'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              Login History
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'staff'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              Staff Work History
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={activeTab === 'login' ? 'Search by username or IP...' : 'Search by staff name or notes...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {activeTab === 'staff' && (
              <>
                <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    {Object.entries(eventTypeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Entry
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Work History Entry</DialogTitle>
                      <DialogDescription>
                        Record a new staff work event
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="staff_name">Staff Name *</Label>
                          <Input
                            id="staff_name"
                            value={formData.staff_name}
                            onChange={(e) => setFormData(prev => ({ ...prev, staff_name: e.target.value }))}
                            placeholder="Enter staff name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="event_type">Event Type</Label>
                          <Select
                            value={formData.event_type}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, event_type: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(eventTypeLabels).map(([key, label]) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="event_date">Event Date *</Label>
                          <Input
                            id="event_date"
                            type="date"
                            value={formData.event_date}
                            onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="input_person">Input Person</Label>
                          <Input
                            id="input_person"
                            value={formData.input_person}
                            onChange={(e) => setFormData(prev => ({ ...prev, input_person: e.target.value }))}
                            placeholder="Who is recording this"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Input
                          id="notes"
                          value={formData.notes}
                          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Additional details..."
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddWorkHistory}>
                        Add Entry
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>

          {/* Content */}
          {activeTab === 'login' ? (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Login Time</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Input Person</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLoginHistory.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.username}</TableCell>
                      <TableCell>
                        {format(new Date(entry.login_timestamp), 'MMM dd, yyyy HH:mm')}
                      </TableCell>
                      <TableCell>{entry.ip_address}</TableCell>
                      <TableCell>{entry.input_person}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Name</TableHead>
                    <TableHead>Event Type</TableHead>
                    <TableHead>Event Date</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Input Person</TableHead>
                    <TableHead>Input Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaffHistory.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.staff_name}</TableCell>
                      <TableCell>
                        <Badge className={`${eventTypeColors[entry.event_type as keyof typeof eventTypeColors]} text-white`}>
                          {eventTypeLabels[entry.event_type as keyof typeof eventTypeLabels]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(entry.event_date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{entry.notes}</TableCell>
                      <TableCell>{entry.input_person}</TableCell>
                      <TableCell>
                        {format(new Date(entry.input_timestamp), 'MMM dd, HH:mm')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}