'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Calendar as CalendarIcon, Clock, Plus, Edit, Trash2, Save, X, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths } from 'date-fns'

interface Staff {
  id: string
  firstName: string
  lastName: string
  position: string
}

interface ScheduleEntry {
  id: string
  staffId: string
  date: string
  startTime: string
  endTime: string
  isWorking: boolean
  notes?: string
  staffName?: string
}

export function StaffSchedule() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([])
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [showBulkDialog, setShowBulkDialog] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null)
  
  // Form states
  const [selectedStaff, setSelectedEmployee] = useState('')
  const [scheduleDate, setScheduleDate] = useState('')
  const [startTime, setStartTime] = useState('10:00')
  const [endTime, setEndTime] = useState('19:00')
  const [isWorking, setIsWorking] = useState(true)
  const [notes, setNotes] = useState('')
  
  // Bulk schedule states
  const [bulkEmployee, setBulkEmployee] = useState('')
  const [bulkStartDate, setBulkStartDate] = useState('')
  const [bulkEndDate, setBulkEndDate] = useState('')
  const [bulkStartTime, setBulkStartTime] = useState('10:00')
  const [bulkEndTime, setBulkEndTime] = useState('19:00')
  const [bulkDaysOfWeek, setBulkDaysOfWeek] = useState<number[]>([1, 2, 3, 4, 5]) // Mon-Fri

  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [currentMonth])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch employees
      const staffRes = await fetch('/api/staff')
      if (staffRes.ok) {
        const staffData = await staffRes.json()
        setStaff(staffData)
      }

      // Fetch schedules for the month
      const startDate = startOfMonth(currentMonth)
      const endDate = endOfMonth(currentMonth)
      
      const schedulesRes = await fetch(`/api/schedules?start=${format(startDate, 'yyyy-MM-dd')}&end=${format(endDate, 'yyyy-MM-dd')}`)
      if (schedulesRes.ok) {
        const schedulesData = await schedulesRes.json()
        setSchedules(schedulesData)
      }
    } catch (error) {
      console.error('Error fetching schedule data:', error)
      toast({
        title: "Error",
        description: "Failed to load schedule data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSelectedEmployee('')
    setScheduleDate('')
    setStartTime('10:00')
    setEndTime('19:00')
    setIsWorking(true)
    setNotes('')
    setIsEditing(false)
    setEditingScheduleId(null)
    setShowDialog(false)
  }
  
  const resetBulkForm = () => {
    setBulkEmployee('')
    setBulkStartDate('')
    setBulkEndDate('')
    setBulkStartTime('10:00')
    setBulkEndTime('19:00')
    setBulkDaysOfWeek([1, 2, 3, 4, 5])
    setShowBulkDialog(false)
  }

  const handleSubmit = async () => {
    if (!selectedStaff || !scheduleDate) {
      toast({
        title: "Required Fields",
        description: "Please select staff and date.",
        variant: "destructive",
      })
      return
    }

    const scheduleData = {
      staffId: selectedStaff,
      date: scheduleDate,
      startTime,
      endTime,
      isWorking,
      notes
    }

    try {
      const url = isEditing && editingScheduleId 
        ? `/api/schedules/${editingScheduleId}` 
        : '/api/schedules'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleData)
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: isEditing ? "Schedule updated successfully." : "Schedule created successfully.",
        })
        resetForm()
        fetchData()
      } else {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} schedule`)
      }
    } catch (error) {
      console.error('Error saving schedule:', error)
      toast({
        title: "Error",
        description: isEditing ? "Failed to update schedule." : "Failed to create schedule.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (schedule: ScheduleEntry) => {
    setSelectedEmployee(schedule.staffId)
    setScheduleDate(schedule.date)
    setStartTime(schedule.startTime)
    setEndTime(schedule.endTime)
    setIsWorking(schedule.isWorking)
    setNotes(schedule.notes || '')
    setIsEditing(true)
    setEditingScheduleId(schedule.id)
    setShowDialog(true)
  }

  const handleDelete = async (scheduleId: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) {
      return
    }

    try {
      const response = await fetch(`/api/schedules/${scheduleId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Schedule deleted successfully.",
        })
        fetchData()
      } else {
        throw new Error('Failed to delete schedule')
      }
    } catch (error) {
      console.error('Error deleting schedule:', error)
      toast({
        title: "Error",
        description: "Failed to delete schedule.",
        variant: "destructive",
      })
    }
  }
  
  const handleBulkSchedule = async () => {
    if (!bulkStaff || !bulkStartDate || !bulkEndDate) {
      toast({
        title: "Required Fields",
        description: "Please fill all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      const startDate = new Date(bulkStartDate)
      const endDate = new Date(bulkEndDate)
      const schedulePromises = []
      
      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay() // Convert Sunday from 0 to 7
        
        if (bulkDaysOfWeek.includes(dayOfWeek)) {
          const scheduleData = {
            staffId: bulkEmployee,
            date: format(date, 'yyyy-MM-dd'),
            startTime: bulkStartTime,
            endTime: bulkEndTime,
            isWorking: true,
            notes: 'Bulk scheduled'
          }
          
          schedulePromises.push(
            fetch('/api/schedules', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(scheduleData)
            })
          )
        }
      }
      
      await Promise.all(schedulePromises)
      
      toast({
        title: "Success",
        description: `Bulk schedule created for ${schedulePromises.length} days.`,
      })
      resetBulkForm()
      fetchData()
      
    } catch (error) {
      console.error('Error creating bulk schedule:', error)
      toast({
        title: "Error",
        description: "Failed to create bulk schedule.",
        variant: "destructive",
      })
    }
  }

  const getMonthDates = () => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    return eachDayOfInterval({ start, end })
  }

  const getScheduleForEmployeeAndDate = (staffId: string, date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd')
    return schedules.find(s => s.staffId === staffId && s.date === dateString)
  }
  
  const getSchedulesForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd')
    return schedules.filter(s => s.date === dateString && s.isWorking)
  }

  const monthDates = getMonthDates()
  const today = new Date()
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const dayNamesKorean = ['일', '월', '화', '수', '목', '금', '토']

  return (
    <div className="space-y-6">
      {/* Month Navigation and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Work Schedule Management
          </CardTitle>
          <CardDescription>
            Manage monthly work schedules for all staff members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold min-w-[200px] text-center">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowBulkDialog(true)} variant="outline" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Bulk Schedule
              </Button>
              <Button onClick={() => setShowDialog(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Schedule
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Calendar View */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Schedule Calendar</CardTitle>
          <CardDescription>
            {format(currentMonth, 'MMMM yyyy')} work schedule overview
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Day Headers */}
                {dayNames.map((day) => (
                  <div key={day} className="p-2 text-center font-semibold text-gray-600 bg-gray-50 rounded">
                    {day}
                  </div>
                ))}
                
                {/* Empty cells for days before month start */}
                {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, index) => (
                  <div key={`empty-${index}`} className="p-2 h-24"></div>
                ))}
                
                {/* Month dates */}
                {monthDates.map((date) => {
                  const daySchedules = getSchedulesForDate(date)
                  const isCurrentMonth = isSameMonth(date, currentMonth)
                  const isCurrentDay = isToday(date)
                  
                  return (
                    <div
                      key={date.toISOString()}
                      className={`p-1 h-24 border border-gray-200 rounded cursor-pointer hover:bg-gray-50 ${
                        isCurrentDay ? 'bg-blue-50 border-blue-300' : ''
                      } ${!isCurrentMonth ? 'text-gray-400' : ''}`}
                      onClick={() => {
                        setSelectedDate(date)
                        setScheduleDate(format(date, 'yyyy-MM-dd'))
                        setShowDialog(true)
                      }}
                    >
                      <div className="text-xs font-medium mb-1">
                        {format(date, 'd')}
                      </div>
                      <div className="space-y-1 overflow-hidden">
                        {daySchedules.slice(0, 2).map((schedule) => {
                          const staff = staff.find(e => e.id === schedule.staffId)
                          return (
                            <div key={schedule.id} className="text-xs bg-blue-100 text-blue-800 rounded px-1 truncate">
                              {staff?.firstName} {schedule.startTime}
                            </div>
                          )
                        })}
                        {daySchedules.length > 2 && (
                          <div className="text-xs text-gray-500">+{daySchedules.length - 2} more</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schedule Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              {isEditing ? 'Edit Work Schedule' : 'Add New Schedule'}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update the existing work schedule.' : 'Create a new work schedule.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="staff">Select Staff *</Label>
              <Select value={selectedStaff} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an staff" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.firstName} {staff.lastName} ({staff.position})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="scheduleDate">Date *</Label>
              <Input
                id="scheduleDate"
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="isWorking">Work Status</Label>
              <Select value={isWorking.toString()} onValueChange={(value) => setIsWorking(value === 'true')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Working</SelectItem>
                  <SelectItem value="false">Off</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {isWorking && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}
            
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={resetForm}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              <Save className="h-4 w-4 mr-1" />
              {isEditing ? 'Update' : 'Save'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Bulk Schedule Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Bulk Schedule Creation
            </DialogTitle>
            <DialogDescription>
              Create work schedules for multiple days at once
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="bulkEmployee">Select Staff *</Label>
              <Select value={bulkEmployee} onValueChange={setBulkEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an staff" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.firstName} {staff.lastName} ({staff.position})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bulkStartDate">Start Date *</Label>
                <Input
                  id="bulkStartDate"
                  type="date"
                  value={bulkStartDate}
                  onChange={(e) => setBulkStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="bulkEndDate">End Date *</Label>
                <Input
                  id="bulkEndDate"
                  type="date"
                  value={bulkEndDate}
                  onChange={(e) => setBulkEndDate(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bulkStartTime">Work Start Time</Label>
                <Input
                  id="bulkStartTime"
                  type="time"
                  value={bulkStartTime}
                  onChange={(e) => setBulkStartTime(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="bulkEndTime">Work End Time</Label>
                <Input
                  id="bulkEndTime"
                  type="time"
                  value={bulkEndTime}
                  onChange={(e) => setBulkEndTime(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label>Working Days</Label>
              <div className="flex gap-2 mt-2">
                {dayNamesKorean.map((day, index) => {
                  const dayValue = index === 0 ? 7 : index // Convert Sunday to 7
                  return (
                    <Button
                      key={index}
                      variant={bulkDaysOfWeek.includes(dayValue) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (bulkDaysOfWeek.includes(dayValue)) {
                          setBulkDaysOfWeek(bulkDaysOfWeek.filter(d => d !== dayValue))
                        } else {
                          setBulkDaysOfWeek([...bulkDaysOfWeek, dayValue])
                        }
                      }}
                      className="w-10"
                    >
                      {day}
                    </Button>
                  )
                })}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={resetBulkForm}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button onClick={handleBulkSchedule}>
              <Save className="h-4 w-4 mr-1" />
              Create Schedules
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}