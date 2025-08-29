'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Calendar, Plus, Trash2, CalendarDays } from 'lucide-react'
import { format } from 'date-fns'

interface NonWorkingDay {
  id: number
  date: string
  day_type: string
  name: string
  description: string
  created_by: string
  created_at: string
}

export function HolidayManagement() {
  const [nonWorkingDays, setNonWorkingDays] = useState<NonWorkingDay[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedYear, setSelectedYear] = useState('2025')
  const [showAddDialog, setShowAddDialog] = useState(false)
  
  // Add new holiday form states
  const [newDate, setNewDate] = useState('')
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newDayType, setNewDayType] = useState('custom')

  const { toast } = useToast()

  const fetchNonWorkingDays = async (year: string = selectedYear) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/non-working-days?year=${year}`)
      if (response.ok) {
        const data = await response.json()
        setNonWorkingDays(data)
      }
    } catch (error) {
      console.error('Error fetching non-working days:', error)
      toast({
        title: "Error",
        description: "Failed to load holiday data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNonWorkingDays()
  }, [selectedYear])

  const handleAddHoliday = async () => {
    if (!newDate) {
      toast({
        title: "Input Error",
        description: "Please select a date.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch('/api/non-working-days', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: newDate,
          day_type: newDayType,
          name: newName || 'Holiday',
          description: newDescription
        })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "New holiday has been added.",
        })
        setShowAddDialog(false)
        setNewDate('')
        setNewName('')
        setNewDescription('')
        setNewDayType('custom')
        fetchNonWorkingDays()
      } else {
        const errorData = await response.json()
        toast({
          title: "Add Failed",
          description: errorData.error || "Failed to add holiday.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error adding holiday:', error)
      toast({
        title: "Error",
        description: "An error occurred while adding holiday.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteHoliday = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete the holiday "${name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/non-working-days?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "Deleted",
          description: "Holiday has been deleted.",
        })
        fetchNonWorkingDays()
      } else {
        toast({
          title: "Delete Failed",
          description: "Failed to delete holiday.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error deleting holiday:', error)
      toast({
        title: "Error",
        description: "An error occurred while deleting holiday.",
        variant: "destructive",
      })
    }
  }

  const getDayTypeBadge = (dayType: string) => {
    const variants = {
      weekend: 'secondary',
      holiday: 'destructive',
      custom: 'default'
    } as const

    const labels = {
      weekend: 'Weekend',
      holiday: 'Holiday',
      custom: 'Off Day'
    }

    return (
      <Badge variant={variants[dayType as keyof typeof variants] || 'default'}>
        {labels[dayType as keyof typeof labels] || 'Other'}
      </Badge>
    )
  }

  const groupedDays = nonWorkingDays.reduce((acc, day) => {
    const month = day.date.substring(5, 7)
    if (!acc[month]) acc[month] = []
    acc[month].push(day)
    return acc
  }, {} as Record<string, NonWorkingDay[]>)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Holiday Management
          </CardTitle>
          <CardDescription>
            Manage weekends, holidays, and additional off days to restrict bookings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Label htmlFor="year-select">Select Year:</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2" data-testid="button-add-holiday">
                  <Plus className="h-4 w-4" />
                  Add Holiday
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Holiday</DialogTitle>
                  <DialogDescription>
                    Add dates when bookings should not be accepted.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="new-date">Date</Label>
                    <Input
                      id="new-date"
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      data-testid="input-holiday-date"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="new-type">Type</Label>
                    <Select value={newDayType} onValueChange={setNewDayType}>
                      <SelectTrigger data-testid="select-holiday-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="custom">Off Day</SelectItem>
                        <SelectItem value="holiday">Holiday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="new-name">Name</Label>
                    <Input
                      id="new-name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g., Temporary closure, Training day"
                      data-testid="input-holiday-name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="new-description">Description (Optional)</Label>
                    <Input
                      id="new-description"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Reason for closure or additional notes"
                      data-testid="input-holiday-description"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleAddHoliday} data-testid="button-save-holiday">
                      Add
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-6">
            {Object.keys(groupedDays).sort().map(month => (
              <div key={month}>
                <h3 className="text-lg font-semibold mb-3">Month {month}</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupedDays[month].map(day => (
                      <TableRow key={day.id}>
                        <TableCell className="font-mono">
                          {format(new Date(day.date), 'yyyy-MM-dd (E)', { locale: undefined })}
                        </TableCell>
                        <TableCell>
                          {getDayTypeBadge(day.day_type)}
                        </TableCell>
                        <TableCell>{day.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {day.description}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{day.created_by}</Badge>
                        </TableCell>
                        <TableCell>
                          {day.created_by !== 'system' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteHoliday(day.id, day.name)}
                              data-testid={`button-delete-holiday-${day.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}
          </div>

          {Object.keys(groupedDays).length === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              No holidays registered for {selectedYear}.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}