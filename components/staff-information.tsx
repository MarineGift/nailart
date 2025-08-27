'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { UserPlus, Edit, Trash2, Save, X, User, Phone, Mail, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

interface Staff {
  id: string
  firstName: string
  lastName: string
  position: string
  phone?: string
  email?: string
  staff_number?: string
  hire_date?: string
  specialties?: string[]
  workingStartTime?: string
  workingEndTime?: string
  photo_url?: string
}

const ITEMS_PER_PAGE = 10

export function StaffInformation() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  
  // Form states
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [position, setPosition] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [employeeNumber, setEmployeeNumber] = useState('')
  const [hireDate, setHireDate] = useState('')
  const [specialties, setSpecialties] = useState('')
  const [workingStartTime, setWorkingStartTime] = useState('10:00')
  const [workingEndTime, setWorkingEndTime] = useState('19:00')
  const [photoUrl, setPhotoUrl] = useState('')

  const { toast } = useToast()

  useEffect(() => {
    fetchStaff()
  }, [])

  const fetchStaff = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/staff')
      if (response.ok) {
        const data = await response.json()
        setStaff(data)
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
      toast({
        title: "Error",
        description: "Failed to load staff information",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFirstName('')
    setLastName('')
    setPosition('')
    setPhone('')
    setEmail('')
    setEmployeeNumber('')
    setHireDate('')
    setSpecialties('')
    setWorkingStartTime('10:00')
    setWorkingEndTime('19:00')
    setPhotoUrl('')
    setIsEditing(false)
    setEditingEmployeeId(null)
    setShowDialog(false)
  }

  const handleSubmit = async () => {
    if (!firstName || !lastName || !position) {
      toast({
        title: "Required Fields",
        description: "First name, last name, and position are required.",
        variant: "destructive",
      })
      return
    }

    const employeeData = {
      firstName,
      lastName,
      position,
      phone,
      email,
      staff_number: employeeNumber,
      hire_date: hireDate,
      specialties: specialties.split(',').map(s => s.trim()).filter(s => s),
      workingStartTime,
      workingEndTime,
      photo_url: photoUrl
    }

    try {
      const url = isEditing && editingEmployeeId 
        ? `/api/staff/${editingEmployeeId}` 
        : '/api/staff'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffData)
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: isEditing ? "Staff information updated." : "New staff registered.",
        })
        resetForm()
        fetchStaff()
      } else {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} staff`)
      }
    } catch (error) {
      console.error('Error saving staff:', error)
      toast({
        title: "Error",
        description: isEditing ? "Failed to update staff information." : "Failed to register staff.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (staff: Employee) => {
    setFirstName(staff.firstName)
    setLastName(staff.lastName)
    setPosition(staff.position)
    setPhone(staff.phone || '')
    setEmail(staff.email || '')
    setEmployeeNumber(staff.staff_number || '')
    setHireDate(staff.hire_date || '')
    setSpecialties(staff.specialties?.join(', ') || '')
    setWorkingStartTime(staff.workingStartTime || '10:00')
    setWorkingEndTime(staff.workingEndTime || '19:00')
    setPhotoUrl(staff.photo_url || '')
    setIsEditing(true)
    setEditingEmployeeId(staff.id)
    setShowDialog(true)
  }

  const handleDelete = async (staffId: string) => {
    if (!confirm('Are you sure you want to delete this staff?')) {
      return
    }

    try {
      const response = await fetch(`/api/staff/${staffId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Staff deleted successfully.",
        })
        fetchStaff()
      } else {
        throw new Error('Failed to delete staff')
      }
    } catch (error) {
      console.error('Error deleting staff:', error)
      toast({
        title: "Error",
        description: "Failed to delete staff.",
        variant: "destructive",
      })
    }
  }

  // Pagination logic
  const totalPages = Math.ceil(staff.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentEmployees = staff.slice(startIndex, endIndex)

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Staff Information Management
              </CardTitle>
              <CardDescription>
                Manage staff profiles and personal information
              </CardDescription>
            </div>
            <Button onClick={() => setShowDialog(true)} className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Add New Employee
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {loading ? (
          Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
            <Card key={index} className="h-80">
              <div className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded-t-lg"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          currentEmployees.map((staff) => (
            <Card key={staff.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                {/* Photo */}
                <div className="h-32 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                  {staff.photo_url ? (
                    <img 
                      src={staff.photo_url} 
                      alt={`${staff.firstName} ${staff.lastName}`}
                      className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-md"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center border-4 border-white shadow-md">
                      <User className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                
                {/* Action buttons */}
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(staff)}
                    className="h-8 w-8 p-0 bg-white/80 backdrop-blur-sm"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(staff.id)}
                    className="h-8 w-8 p-0 bg-white/80 backdrop-blur-sm text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Name and Position */}
                  <div className="text-center">
                    <h3 className="font-semibold text-lg">
                      {staff.firstName} {staff.lastName}
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      {staff.position}
                    </Badge>
                  </div>
                  
                  {/* Contact Info */}
                  <div className="space-y-2 text-sm text-gray-600">
                    {staff.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        <span className="truncate">{staff.phone}</span>
                      </div>
                    )}
                    {staff.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{staff.email}</span>
                      </div>
                    )}
                    {staff.hire_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>Hired: {new Date(staff.hire_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Working Hours */}
                  {staff.workingStartTime && staff.workingEndTime && (
                    <div className="text-center text-xs text-gray-500">
                      {staff.workingStartTime} - {staff.workingEndTime}
                    </div>
                  )}
                  
                  {/* Specialties */}
                  {staff.specialties && staff.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-center">
                      {staff.specialties.slice(0, 2).map((specialty, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                      {staff.specialties.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{staff.specialties.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Empty State */}
      {!loading && staff.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Employees Found</h3>
            <p className="text-gray-500 mb-4">
              Get started by adding your first staff
            </p>
            <Button onClick={() => setShowDialog(true)} className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Add New Employee
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div className="text-sm text-gray-500">
              Showing {startIndex + 1} to {Math.min(endIndex, staff.length)} of {staff.length} employees
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-10"
                  >
                    {page}
                  </Button>
                ))}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Staff Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              {isEditing ? 'Edit Staff Information' : 'Add New Employee'}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update the staff information below.' : 'Enter the new staff information below.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter last name"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="position">Position *</Label>
              <Select value={position} onValueChange={setPosition}>
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Senior Nail Technician">Senior Nail Technician</SelectItem>
                  <SelectItem value="Nail Technician">Nail Technician</SelectItem>
                  <SelectItem value="Gel Specialist">Gel Specialist</SelectItem>
                  <SelectItem value="Nail Artist">Nail Artist</SelectItem>
                  <SelectItem value="Manicurist">Manicurist</SelectItem>
                  <SelectItem value="Pedicure Specialist">Pedicure Specialist</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="010-1234-5678"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employeeNumber">Staff Number</Label>
                <Input
                  id="employeeNumber"
                  value={employeeNumber}
                  onChange={(e) => setEmployeeNumber(e.target.value)}
                  placeholder="EMP001"
                />
              </div>
              <div>
                <Label htmlFor="hireDate">Hire Date</Label>
                <Input
                  id="hireDate"
                  type="date"
                  value={hireDate}
                  onChange={(e) => setHireDate(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="workingStartTime">Work Start Time</Label>
                <Input
                  id="workingStartTime"
                  type="time"
                  value={workingStartTime}
                  onChange={(e) => setWorkingStartTime(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="workingEndTime">Work End Time</Label>
                <Input
                  id="workingEndTime"
                  type="time"
                  value={workingEndTime}
                  onChange={(e) => setWorkingEndTime(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="photoUrl">Photo URL</Label>
              <Input
                id="photoUrl"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
              />
            </div>
            
            <div>
              <Label htmlFor="specialties">Specialties (comma separated)</Label>
              <Textarea
                id="specialties"
                value={specialties}
                onChange={(e) => setSpecialties(e.target.value)}
                placeholder="Nail Art, Gel Manicure, Pedicure"
                rows={2}
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
    </div>
  )
}