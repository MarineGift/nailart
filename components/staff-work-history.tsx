'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Briefcase, Plus, Edit, Trash2, Calendar, User, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'

interface WorkHistoryEntry {
  id: string
  staff_id: string
  staff_name: string
  event_type: 'hire' | 'resign' | 'vacation_start' | 'vacation_return' | 'maternity_leave' | 'maternity_return' | 'return_from_abroad' | 'marriage'
  event_date: string
  notes: string
  input_person: string
  input_timestamp: string
  created_at: string
}

const eventTypeLabels = {
  hire: '입사',
  resign: '퇴사',
  vacation_start: '휴가 출발',
  vacation_return: '휴가 복귀',
  maternity_leave: '출산 휴가',
  maternity_return: '출산 휴가 복귀',
  marriage: '결혼',
  return_from_abroad: '귀국'
}

const eventTypeColors = {
  hire: 'bg-green-500',
  resign: 'bg-red-500',
  vacation_start: 'bg-blue-500',
  vacation_return: 'bg-green-500',
  maternity_leave: 'bg-purple-500',
  maternity_return: 'bg-green-500',
  marriage: 'bg-pink-500',
  return_from_abroad: 'bg-indigo-500'
}

export function StaffWorkHistory() {
  const [workHistory, setWorkHistory] = useState<WorkHistoryEntry[]>([])
  const [staffList, setStaffList] = useState<any[]>([])
  const [selectedStaff, setSelectedStaff] = useState<string>('all')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingEntry, setEditingEntry] = useState<WorkHistoryEntry | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    staff_id: '',
    staff_name: '',
    event_type: 'hire' as keyof typeof eventTypeLabels,
    event_date: '',
    notes: '',
    input_person: 'Admin'
  })

  // Sample data
  const sampleWorkHistory: WorkHistoryEntry[] = [
    {
      id: '1',
      staff_id: '1',
      staff_name: 'Sarah Kim',
      event_type: 'hire',
      event_date: '2020-01-15',
      notes: 'Hired as Senior Nail Technician with 8 years experience',
      input_person: 'Manager Park',
      input_timestamp: '2020-01-15T09:00:00Z',
      created_at: '2020-01-15T09:00:00Z'
    },
    {
      id: '2',
      staff_id: '2',
      staff_name: 'Emma Johnson',
      event_type: 'hire',
      event_date: '2022-03-20',
      notes: 'Hired as Manicurist, recent cosmetology school graduate',
      input_person: 'Manager Park',
      input_timestamp: '2022-03-20T10:30:00Z',
      created_at: '2022-03-20T10:30:00Z'
    },
    {
      id: '3',
      staff_id: '3',
      staff_name: 'Lisa Chen',
      event_type: 'vacation_start',
      event_date: '2024-07-15',
      notes: 'Summer vacation for 2 weeks to visit family in China',
      input_person: 'Manager Park',
      input_timestamp: '2024-07-14T16:00:00Z',
      created_at: '2024-07-14T16:00:00Z'
    },
    {
      id: '4',
      staff_id: '3',
      staff_name: 'Lisa Chen',
      event_type: 'vacation_return',
      event_date: '2024-07-29',
      notes: 'Returned from summer vacation, resuming regular schedule',
      input_person: 'Manager Park',
      input_timestamp: '2024-07-29T09:00:00Z',
      created_at: '2024-07-29T09:00:00Z'
    },
    {
      id: '5',
      staff_id: '4',
      staff_name: 'Maria Garcia',
      event_type: 'marriage',
      event_date: '2024-06-01',
      notes: 'Name changed from Maria Lopez to Maria Garcia after marriage',
      input_person: 'HR Admin',
      input_timestamp: '2024-06-03T14:00:00Z',
      created_at: '2024-06-03T14:00:00Z'
    },
    {
      id: '6',
      staff_id: '5',
      staff_name: 'Anna Lee',
      event_type: 'return_from_abroad',
      event_date: '2024-03-10',
      notes: 'Returned from Korea after family emergency, resuming work',
      input_person: 'Manager Park',
      input_timestamp: '2024-03-10T11:00:00Z',
      created_at: '2024-03-10T11:00:00Z'
    }
  ]

  const sampleStaffList = [
    { id: '1', name: 'Sarah Kim' },
    { id: '2', name: 'Emma Johnson' },
    { id: '3', name: 'Lisa Chen' },
    { id: '4', name: 'Maria Garcia' },
    { id: '5', name: 'Anna Lee' }
  ]

  useEffect(() => {
    setWorkHistory(sampleWorkHistory)
    setStaffList(sampleStaffList)
  }, [])

  const filteredHistory = selectedStaff === 'all' 
    ? workHistory 
    : workHistory.filter(entry => entry.staff_id === selectedStaff)

  const handleAdd = async () => {
    if (!formData.staff_name || !formData.event_date) {
      toast({
        title: 'Error',
        description: 'Please fill in required fields',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      const newEntry: WorkHistoryEntry = {
        id: String(Date.now()),
        ...formData,
        staff_id: formData.staff_id || String(Date.now()),
        input_timestamp: new Date().toISOString(),
        created_at: new Date().toISOString()
      }
      
      setWorkHistory(prev => [newEntry, ...prev])
      setFormData({
        staff_id: '',
        staff_name: '',
        event_type: 'hire',
        event_date: '',
        notes: '',
        input_person: 'Admin'
      })
      setShowAddDialog(false)
      toast({
        title: 'Success',
        description: 'Work history entry added successfully'
      })
      setLoading(false)
    }, 1000)
  }

  const handleEdit = (entry: WorkHistoryEntry) => {
    setEditingEntry(entry)
    setFormData({
      staff_id: entry.staff_id,
      staff_name: entry.staff_name,
      event_type: entry.event_type,
      event_date: entry.event_date,
      notes: entry.notes,
      input_person: entry.input_person
    })
    setShowAddDialog(true)
  }

  const handleDelete = async (id: string) => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setWorkHistory(prev => prev.filter(entry => entry.id !== id))
      toast({
        title: 'Success',
        description: 'Work history entry deleted successfully'
      })
      setLoading(false)
    }, 500)
  }

  const handleSave = async () => {
    if (editingEntry) {
      setLoading(true)
      // Simulate API call
      setTimeout(() => {
        setWorkHistory(prev => prev.map(entry => 
          entry.id === editingEntry.id 
            ? { ...entry, ...formData, input_timestamp: new Date().toISOString() }
            : entry
        ))
        setEditingEntry(null)
        setShowAddDialog(false)
        toast({
          title: 'Success',
          description: 'Work history entry updated successfully'
        })
        setLoading(false)
      }, 1000)
    } else {
      handleAdd()
    }
  }

  const resetForm = () => {
    setEditingEntry(null)
    setFormData({
      staff_id: '',
      staff_name: '',
      event_type: 'hire',
      event_date: '',
      notes: '',
      input_person: 'Admin'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                직원 근무정보 관리
              </CardTitle>
              <CardDescription>
                직원의 입사일, 휴가, 출산휴가, 귀국, 퇴사 등 근무 관련 히스토리 관리
              </CardDescription>
            </div>
            <Dialog open={showAddDialog} onOpenChange={(open) => {
              setShowAddDialog(open)
              if (!open) resetForm()
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  근무정보 추가
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingEntry ? '근무정보 수정' : '근무정보 추가'}
                  </DialogTitle>
                  <DialogDescription>
                    직원의 근무 관련 이벤트를 기록합니다.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="staff_name">직원 이름 *</Label>
                      <Input
                        id="staff_name"
                        value={formData.staff_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, staff_name: e.target.value }))}
                        placeholder="직원 이름 입력"
                      />
                    </div>
                    <div>
                      <Label htmlFor="event_type">이벤트 유형</Label>
                      <Select
                        value={formData.event_type}
                        onValueChange={(value: keyof typeof eventTypeLabels) => setFormData(prev => ({ ...prev, event_type: value }))}
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
                      <Label htmlFor="event_date">날짜 *</Label>
                      <Input
                        id="event_date"
                        type="date"
                        value={formData.event_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="input_person">입력자</Label>
                      <Input
                        id="input_person"
                        value={formData.input_person}
                        onChange={(e) => setFormData(prev => ({ ...prev, input_person: e.target.value }))}
                        placeholder="기록자 이름"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notes">메모</Label>
                    <Input
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="추가 정보나 메모"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setShowAddDialog(false)
                    resetForm()
                  }}>
                    취소
                  </Button>
                  <Button onClick={handleSave} disabled={loading}>
                    {loading ? '저장 중...' : (editingEntry ? '수정' : '추가')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div>
              <Label>직원 필터</Label>
              <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="직원 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 직원</SelectItem>
                  {staffList.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Work History Table */}
      <Card>
        <CardHeader>
          <CardTitle>근무정보 히스토리</CardTitle>
          <CardDescription>
            {selectedStaff === 'all' ? '전체 직원' : staffList.find(s => s.id === selectedStaff)?.name}의 근무 기록
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>직원명</TableHead>
                  <TableHead>이벤트 유형</TableHead>
                  <TableHead>날짜</TableHead>
                  <TableHead>메모</TableHead>
                  <TableHead>입력자</TableHead>
                  <TableHead>입력일시</TableHead>
                  <TableHead>작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      근무정보 기록이 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHistory.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.staff_name}</TableCell>
                      <TableCell>
                        <Badge className={`${eventTypeColors[entry.event_type]} text-white`}>
                          {eventTypeLabels[entry.event_type]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(entry.event_date), 'yyyy-MM-dd')}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{entry.notes}</TableCell>
                      <TableCell>{entry.input_person}</TableCell>
                      <TableCell>
                        {format(new Date(entry.input_timestamp), 'MM/dd HH:mm')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(entry)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(entry.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}