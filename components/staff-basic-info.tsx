'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, Edit, Camera, Mail, Phone, MapPin, Calendar, Shield, FileText, Award, Star } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface StaffMember {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  role: 'staff' | 'manager'
  nationality: string
  visaStatus: string
  ssnNo: string
  experience: string
  profileImage: string
  address: string
  hireDate: string
  emergencyContact: string
  emergencyPhone: string
}

interface EmployeeSkill {
  id: string
  employee_id: string
  skill_id: string
  proficiency_level: string
  certification_date: string
  notes: string
  skills?: {
    id: string
    name: string
    description: string
    skill_level: string
    skill_categories?: {
      name: string
    }
  }
}

export function StaffBasicInfo() {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null)
  const [staffSkills, setStaffSkills] = useState<{[key: string]: EmployeeSkill[]}>({})
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'staff' as 'staff' | 'manager',
    nationality: '',
    visaStatus: '',
    ssnNo: '',
    experience: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: ''
  })

  // Sample staff data
  const sampleStaff: StaffMember[] = [
    {
      id: '1',
      firstName: 'Sarah',
      lastName: 'Kim',
      email: 'sarah.kim@connienail.com',
      phone: '(555) 123-4567',
      role: 'manager',
      nationality: 'Korean-American',
      visaStatus: 'US Citizen',
      ssnNo: '***-**-1234',
      experience: '8 years in nail art and salon management',
      profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      address: '123 Main St, Washington, DC 20001',
      hireDate: '2020-01-15',
      emergencyContact: 'John Kim (Husband)',
      emergencyPhone: '(555) 987-6543'
    },
    {
      id: '2',
      firstName: 'Emma',
      lastName: 'Johnson',
      email: 'emma.johnson@connienail.com',
      phone: '(555) 234-5678',
      role: 'staff',
      nationality: 'American',
      visaStatus: 'US Citizen',
      ssnNo: '***-**-5678',
      experience: '3 years in manicure and pedicure services',
      profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      address: '456 Oak Ave, Washington, DC 20002',
      hireDate: '2022-03-20',
      emergencyContact: 'Mary Johnson (Mother)',
      emergencyPhone: '(555) 345-6789'
    },
    {
      id: '3',
      firstName: 'Lisa',
      lastName: 'Chen',
      email: 'lisa.chen@connienail.com',
      phone: '(555) 345-6789',
      role: 'staff',
      nationality: 'Chinese',
      visaStatus: 'H1B Visa',
      ssnNo: '***-**-9012',
      experience: '5 years in nail art design and acrylics',
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      address: '789 Pine St, Washington, DC 20003',
      hireDate: '2021-06-10',
      emergencyContact: 'Wei Chen (Brother)',
      emergencyPhone: '(555) 456-7890'
    },
    {
      id: '4',
      firstName: 'Maria',
      lastName: 'Garcia',
      email: 'maria.garcia@connienail.com',
      phone: '(555) 456-7890',
      role: 'staff',
      nationality: 'Mexican',
      visaStatus: 'Green Card',
      ssnNo: '***-**-3456',
      experience: '4 years in pedicure and spa services',
      profileImage: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=150&h=150&fit=crop&crop=face',
      address: '321 Elm St, Washington, DC 20004',
      hireDate: '2022-01-08',
      emergencyContact: 'Carlos Garcia (Husband)',
      emergencyPhone: '(555) 567-8901'
    }
  ]

  useEffect(() => {
    setStaffMembers(sampleStaff)
    setSelectedStaff(sampleStaff[0])
    fetchStaffSkills()
  }, [])

  const fetchStaffSkills = async () => {
    try {
      // Note: employee-skills API temporarily disabled due to missing Supabase table
      // const response = await fetch('/api/employee-skills')
      
      // Using mock skills data for now
      const mockSkills: {[key: string]: EmployeeSkill[]} = {
        '1': [
          { 
            id: '1', 
            employee_id: '1', 
            skill_id: '1', 
            proficiency_level: 'Expert',
            certification_date: '2023-01-01',
            notes: 'Advanced manicure techniques'
          }
        ],
        '2': [
          {
            id: '2',
            employee_id: '2', 
            skill_id: '2',
            proficiency_level: 'Expert',
            certification_date: '2023-02-01',
            notes: 'Nail art specialist'
          }
        ]
      }
      
      setStaffSkills(mockSkills)
    } catch (error) {
      console.error('Failed to fetch staff skills:', error)
    }
  }

  const openEditDialog = (staff: StaffMember) => {
    setSelectedStaff(staff)
    setFormData({
      firstName: staff.firstName,
      lastName: staff.lastName,
      email: staff.email,
      phone: staff.phone,
      role: staff.role,
      nationality: staff.nationality,
      visaStatus: staff.visaStatus,
      ssnNo: staff.ssnNo,
      experience: staff.experience,
      address: staff.address,
      emergencyContact: staff.emergencyContact,
      emergencyPhone: staff.emergencyPhone
    })
    setIsEditDialogOpen(true)
  }

  const handleSave = async () => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      if (selectedStaff) {
        const updatedStaff = staffMembers.map(staff => 
          staff.id === selectedStaff.id 
            ? { ...staff, ...formData }
            : staff
        )
        setStaffMembers(updatedStaff)
        setSelectedStaff({ ...selectedStaff, ...formData })
      }
      toast({
        title: 'Success',
        description: 'Staff information updated successfully'
      })
      setIsEditDialogOpen(false)
      setLoading(false)
    }, 1000)
  }

  const getRoleBadge = (role: string) => {
    return role === 'manager' 
      ? 'bg-purple-100 text-purple-800'
      : 'bg-blue-100 text-blue-800'
  }

  const getVisaStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'us citizen':
        return 'bg-green-100 text-green-800'
      case 'green card':
        return 'bg-blue-100 text-blue-800'
      case 'h1b visa':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!selectedStaff) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Staff Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            직원 기본정보
          </CardTitle>
          <CardDescription>
            직원의 개인정보, 자격, 연락처 등 기본 정보 관리
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <Select 
              value={selectedStaff.id} 
              onValueChange={(value) => {
                const staff = staffMembers.find(s => s.id === value)
                if (staff) setSelectedStaff(staff)
              }}
            >
              <SelectTrigger className="w-[300px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {staffMembers.map((staff) => (
                  <SelectItem key={staff.id} value={staff.id}>
                    {staff.firstName} {staff.lastName} - {staff.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => openEditDialog(selectedStaff)} variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              정보 수정
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Staff Profile Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Profile Picture and Basic Info */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={selectedStaff.profileImage} alt={selectedStaff.firstName} />
                  <AvatarFallback className="text-2xl">
                    {selectedStaff.firstName[0]}{selectedStaff.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <Button size="sm" variant="outline" className="absolute -bottom-2 -right-2 rounded-full p-2">
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">
                  {selectedStaff.firstName} {selectedStaff.lastName}
                </h3>
                <Badge className={getRoleBadge(selectedStaff.role)}>
                  {selectedStaff.role === 'manager' ? 'Manager' : 'Staff'}
                </Badge>
                <p className="text-sm text-gray-600">
                  입사일: {new Date(selectedStaff.hireDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Middle: Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">연락처 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">이메일</p>
                <p className="font-medium">{selectedStaff.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">전화번호</p>
                <p className="font-medium">{selectedStaff.phone}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">주소</p>
                <p className="font-medium">{selectedStaff.address}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-sm mb-2">긴급 연락처</h4>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="text-gray-600">연락처:</span> {selectedStaff.emergencyContact}
                </p>
                <p className="text-sm">
                  <span className="text-gray-600">전화:</span> {selectedStaff.emergencyPhone}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right: Professional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">전문 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">국적</p>
                <p className="font-medium">{selectedStaff.nationality}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">비자 상태</p>
                <Badge className={getVisaStatusBadge(selectedStaff.visaStatus)}>
                  {selectedStaff.visaStatus}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">SSN</p>
                <p className="font-medium font-mono">{selectedStaff.ssnNo}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-sm mb-2">경력</h4>
              <p className="text-sm text-gray-700">{selectedStaff.experience}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skills Information */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-blue-500" />
            Professional Skills & Certifications
          </CardTitle>
          <CardDescription>
            Skills and expertise areas for {selectedStaff.firstName} {selectedStaff.lastName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {staffSkills[selectedStaff.id] && staffSkills[selectedStaff.id].length > 0 ? (
            <div className="space-y-4">
              {staffSkills[selectedStaff.id].map((employeeSkill) => (
                <div key={employeeSkill.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-lg">{employeeSkill.skills?.name || 'Unknown Skill'}</h4>
                        <Badge 
                          variant={
                            employeeSkill.proficiency_level === 'expert' ? 'default' :
                            employeeSkill.proficiency_level === 'intermediate' ? 'secondary' : 'outline'
                          }
                          className="text-xs"
                        >
                          {employeeSkill.proficiency_level}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {employeeSkill.skills?.skill_categories?.name || 'General'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {employeeSkill.skills?.description || 'No description available'}
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Skill Level:</span>
                          <p className="text-gray-600">{employeeSkill.skills?.skill_level || 'Not specified'}</p>
                        </div>
                        {employeeSkill.certification_date && (
                          <div>
                            <span className="font-medium text-gray-700">Certified Date:</span>
                            <p className="text-gray-600">
                              {new Date(employeeSkill.certification_date).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                      {employeeSkill.notes && (
                        <div className="mt-2">
                          <span className="font-medium text-gray-700">Notes:</span>
                          <p className="text-sm text-gray-600">{employeeSkill.notes}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Award className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No skills recorded for this staff member</p>
              <p className="text-sm">Skills information will be displayed when available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>직원 정보 수정</DialogTitle>
            <DialogDescription>
              직원의 기본 정보를 수정합니다.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div>
              <Label htmlFor="firstName">이름 *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="lastName">성 *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="email">이메일 *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="phone">전화번호 *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="role">직급</Label>
              <Select value={formData.role} onValueChange={(value: 'staff' | 'manager') => setFormData(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="nationality">국적</Label>
              <Input
                id="nationality"
                value={formData.nationality}
                onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="visaStatus">비자 상태</Label>
              <Input
                id="visaStatus"
                value={formData.visaStatus}
                onChange={(e) => setFormData(prev => ({ ...prev, visaStatus: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="ssnNo">SSN</Label>
              <Input
                id="ssnNo"
                value={formData.ssnNo}
                onChange={(e) => setFormData(prev => ({ ...prev, ssnNo: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="address">주소</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="emergencyContact">긴급 연락처</Label>
              <Input
                id="emergencyContact"
                value={formData.emergencyContact}
                onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="emergencyPhone">긴급 전화번호</Label>
              <Input
                id="emergencyPhone"
                value={formData.emergencyPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, emergencyPhone: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="experience">경력</Label>
              <Textarea
                id="experience"
                value={formData.experience}
                onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? '저장 중...' : '저장'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}