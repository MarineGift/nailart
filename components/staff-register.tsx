'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { UserPlus, Edit, Trash2, Save, X } from 'lucide-react'

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
}

export function StaffRegister() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null)
  
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
        title: "오류",
        description: "staff information를 불러오는데 실패했습니다.",
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
    setIsEditing(false)
    setEditingEmployeeId(null)
  }

  const handleSubmit = async () => {
    if (!firstName || !lastName || !position) {
      toast({
        title: "필수 입력",
        description: "이름, 성, 직책은 필수 입력 사항입니다.",
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
      workingEndTime
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
          title: "성공",
          description: isEditing ? "staff information가 edit되었습니다." : "새 staff이 register되었습니다.",
        })
        resetForm()
        fetchStaff()
      } else {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} staff`)
      }
    } catch (error) {
      console.error('Error saving staff:', error)
      toast({
        title: "오류",
        description: isEditing ? "staff information edit에 실패했습니다." : "staff register에 실패했습니다.",
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
    setIsEditing(true)
    setEditingEmployeeId(staff.id)
  }

  const handleDelete = async (staffId: string) => {
    if (!confirm('정말로 이 staff을 delete하시겠습니까?')) {
      return
    }

    try {
      const response = await fetch(`/api/staff/${staffId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "성공",
          description: "staff이 delete되었습니다.",
        })
        fetchStaff()
      } else {
        throw new Error('Failed to delete staff')
      }
    } catch (error) {
      console.error('Error deleting staff:', error)
      toast({
        title: "오류",
        description: "staff delete에 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* staff register/edit 폼 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            {isEditing ? 'staff information edit' : '새 staff register'}
          </CardTitle>
          <CardDescription>
            {isEditing ? 'staff information를 edit해주세요.' : '새로운 staff을 register해주세요.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">이름 *</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="이름을 입력하세요"
              />
            </div>
            <div>
              <Label htmlFor="lastName">성 *</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="성을 입력하세요"
              />
            </div>
            <div>
              <Label htmlFor="position">직책 *</Label>
              <Select value={position} onValueChange={setPosition}>
                <SelectTrigger>
                  <SelectValue placeholder="직책을 select하세요" />
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
            <div>
              <Label htmlFor="phone">전화번호</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010-1234-5678"
              />
            </div>
            <div>
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>
            <div>
              <Label htmlFor="employeeNumber">staff번호</Label>
              <Input
                id="employeeNumber"
                value={employeeNumber}
                onChange={(e) => setEmployeeNumber(e.target.value)}
                placeholder="EMP001"
              />
            </div>
            <div>
              <Label htmlFor="hireDate">입사일</Label>
              <Input
                id="hireDate"
                type="date"
                value={hireDate}
                onChange={(e) => setHireDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="workingStartTime">근무 시작 time</Label>
              <Input
                id="workingStartTime"
                type="time"
                value={workingStartTime}
                onChange={(e) => setWorkingStartTime(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="workingEndTime">근무 종료 time</Label>
              <Input
                id="workingEndTime"
                type="time"
                value={workingEndTime}
                onChange={(e) => setWorkingEndTime(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="specialties">전문분야 (쉼표로 구분)</Label>
              <Textarea
                id="specialties"
                value={specialties}
                onChange={(e) => setSpecialties(e.target.value)}
                placeholder="네일아트, 젤매니큐어, 페디큐어"
                rows={2}
              />
            </div>
          </div>
          
          <div className="flex gap-2 mt-6">
            <Button onClick={handleSubmit} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {isEditing ? 'edit' : 'register'}
            </Button>
            {isEditing && (
              <Button variant="outline" onClick={resetForm} className="flex items-center gap-2">
                <X className="h-4 w-4" />
                cancelled
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* staff 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>staff 목록</CardTitle>
          <CardDescription>
            register된 모든 staff의 information입니다. edit이나 delete가 가능합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>이름</TableHead>
                  <TableHead>직책</TableHead>
                  <TableHead>전화번호</TableHead>
                  <TableHead>근무time</TableHead>
                  <TableHead>전문분야</TableHead>
                  <TableHead>work</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell className="font-medium">
                      {staff.firstName} {staff.lastName}
                    </TableCell>
                    <TableCell>{staff.position}</TableCell>
                    <TableCell>{staff.phone || '-'}</TableCell>
                    <TableCell>
                      {staff.workingStartTime} - {staff.workingEndTime}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {staff.specialties?.map((specialty, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(staff)}
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(staff.id)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                          delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {staff.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      register된 staff이 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}