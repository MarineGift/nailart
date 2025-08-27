// Mock data for the salon management system with comprehensive payment and service tracking

export const mockCustomers = [
  { 
    id: 1, 
    name: 'Emma Johnson', 
    phoneNumber: '010-1234-5678', 
    email: 'emma@email.com', 
    totalVisits: 12, 
    vipLevel: 'Gold' as const,
    address: '123 Main St, Seoul',
    lastVisit: '2025-08-10',
    preferredServices: ['Gel Manicure', 'Nail Art']
  },
  { 
    id: 2, 
    name: 'Sarah Kim', 
    phoneNumber: '010-2345-6789', 
    email: 'sarah@email.com', 
    totalVisits: 8, 
    vipLevel: 'Silver' as const,
    address: '456 Oak Ave, Seoul',
    lastVisit: '2025-08-05',
    preferredServices: ['Basic Manicure']
  },
  { 
    id: 3, 
    name: 'Lisa Chen', 
    phoneNumber: '010-3456-7890', 
    email: 'lisa@email.com', 
    totalVisits: 5, 
    vipLevel: 'Bronze' as const,
    address: '789 Pine St, Seoul',
    lastVisit: '2025-07-28',
    preferredServices: ['Gel Manicure', 'Pedicure']
  },
  { 
    id: 4, 
    name: 'Anna Smith', 
    phoneNumber: '010-4567-8901', 
    email: 'anna@email.com', 
    totalVisits: 15, 
    vipLevel: 'Platinum' as const,
    address: '321 Elm Dr, Seoul',
    lastVisit: '2025-08-12',
    preferredServices: ['Nail Art', 'Premium Care']
  },
  { 
    id: 5, 
    name: 'Maria Garcia', 
    phoneNumber: '010-5678-9012', 
    email: 'maria@email.com', 
    totalVisits: 3, 
    vipLevel: 'Bronze' as const,
    address: '654 Maple Ln, Seoul',
    lastVisit: '2025-08-01',
    preferredServices: ['Basic Manicure']
  },
  { 
    id: 6, 
    name: 'Jennifer Lee', 
    phoneNumber: '010-6789-0123', 
    email: 'jennifer@email.com', 
    totalVisits: 7, 
    vipLevel: 'Silver' as const,
    address: '987 Cedar Rd, Seoul',
    lastVisit: '2025-08-08',
    preferredServices: ['Gel Manicure']
  },
  { 
    id: 7, 
    name: 'Michelle Brown', 
    phoneNumber: '010-7890-1234', 
    email: 'michelle@email.com', 
    totalVisits: 1, 
    vipLevel: 'Bronze' as const,
    address: '147 Birch St, Seoul',
    lastVisit: undefined,
    preferredServices: []
  }
]

export const mockServices = [
  { id: 1, name: 'Basic Manicure', duration: 60, price: 35000, description: 'Basic nail care service', category: 'Manicure' },
  { id: 2, name: 'Gel Manicure', duration: 90, price: 45000, description: 'Long-lasting gel polish', category: 'Manicure' },
  { id: 3, name: 'Nail Art', duration: 120, price: 55000, description: 'Custom nail art design', category: 'Art' },
  { id: 4, name: 'Premium Care', duration: 150, price: 75000, description: 'Complete nail and hand care', category: 'Premium' },
  { id: 5, name: 'Pedicure', duration: 90, price: 40000, description: 'Foot and nail care', category: 'Pedicure' }
]

export const mockEmployees = [
  { 
    id: '1', 
    firstName: '김', 
    lastName: '미영', 
    position: 'Senior Nail Artist', 
    specialties: ['Gel', 'Art'], 
    workingHours: { start: '09:00', end: '20:00' },
    rating: 4.9,
    experienceYears: 8,
    status: 'working' as const
  },
  { 
    id: '2', 
    firstName: '박', 
    lastName: '지은', 
    position: 'Nail Technician', 
    specialties: ['Manicure'], 
    workingHours: { start: '09:00', end: '20:00' },
    rating: 4.7,
    experienceYears: 5,
    status: 'working' as const
  },
  { 
    id: '3', 
    firstName: '이', 
    lastName: '수진', 
    position: 'Nail Technician', 
    specialties: ['Art', 'Care'], 
    workingHours: { start: '09:00', end: '20:00' },
    rating: 4.8,
    experienceYears: 6,
    status: 'break' as const
  },
  { 
    id: '4', 
    firstName: '최', 
    lastName: '영희', 
    position: 'Junior Nail Technician', 
    specialties: ['Basic'], 
    workingHours: { start: '09:00', end: '20:00' },
    rating: 4.5,
    experienceYears: 2,
    status: 'working' as const
  },
  { 
    id: '5', 
    firstName: '정', 
    lastName: '현주', 
    position: 'Nail Technician', 
    specialties: ['Gel', 'Manicure'], 
    workingHours: { start: '09:00', end: '20:00' },
    rating: 4.6,
    experienceYears: 4,
    status: 'working' as const
  }
]

// Generate comprehensive booking, payment, and service record data
const today = new Date()
const todayStr = today.toISOString().split('T')[0]

export const mockBookings = [
  // Today's bookings
  { id: 1, customerId: 1, serviceId: 1, employeeId: '1', bookingDate: todayStr, timeSlot: '10:00', status: 'confirmed' as const, price: 35000, duration: 60, notes: 'French manicure requested' },
  { id: 2, customerId: 2, serviceId: 2, employeeId: '2', bookingDate: todayStr, timeSlot: '10:00', status: 'confirmed' as const, price: 45000, duration: 90, notes: '' },
  { id: 3, customerId: 3, serviceId: 1, employeeId: null, bookingDate: todayStr, timeSlot: '11:00', status: 'confirmed' as const, price: 35000, duration: 60, notes: '' },
  { id: 4, customerId: 4, serviceId: 3, employeeId: '3', bookingDate: todayStr, timeSlot: '14:00', status: 'completed' as const, price: 55000, duration: 120, notes: 'Complex nail art design' },
  { id: 5, customerId: 5, serviceId: 2, employeeId: '4', bookingDate: todayStr, timeSlot: '15:00', status: 'confirmed' as const, price: 45000, duration: 90, notes: '' },
  { id: 6, customerId: 6, serviceId: 1, employeeId: '5', bookingDate: todayStr, timeSlot: '16:00', status: 'confirmed' as const, price: 35000, duration: 60, notes: '' },
  { id: 7, customerId: 7, serviceId: 2, employeeId: null, bookingDate: todayStr, timeSlot: '17:00', status: 'pending' as const, price: 45000, duration: 90, notes: 'New customer' },
  
  // Previous days this month
  { id: 8, customerId: 1, serviceId: 1, employeeId: '1', bookingDate: '2025-08-16', timeSlot: '10:00', status: 'completed' as const, price: 35000, duration: 60, notes: '' },
  { id: 9, customerId: 2, serviceId: 2, employeeId: '2', bookingDate: '2025-08-15', timeSlot: '14:00', status: 'completed' as const, price: 45000, duration: 90, notes: '' },
  { id: 10, customerId: 3, serviceId: 3, employeeId: '3', bookingDate: '2025-08-14', timeSlot: '11:00', status: 'completed' as const, price: 55000, duration: 120, notes: '' },
  { id: 11, customerId: 4, serviceId: 4, employeeId: '1', bookingDate: '2025-08-13', timeSlot: '15:00', status: 'completed' as const, price: 75000, duration: 150, notes: 'Premium treatment' },
  { id: 12, customerId: 5, serviceId: 1, employeeId: '2', bookingDate: '2025-08-12', timeSlot: '13:00', status: 'completed' as const, price: 35000, duration: 60, notes: '' },
  { id: 13, customerId: 6, serviceId: 2, employeeId: '4', bookingDate: '2025-08-11', timeSlot: '16:00', status: 'completed' as const, price: 45000, duration: 90, notes: '' },
  { id: 14, customerId: 1, serviceId: 3, employeeId: '5', bookingDate: '2025-08-10', timeSlot: '12:00', status: 'completed' as const, price: 55000, duration: 120, notes: 'Nail art for special event' },
  
  // Previous weeks
  { id: 15, customerId: 2, serviceId: 1, employeeId: '1', bookingDate: '2025-08-09', timeSlot: '14:00', status: 'completed' as const, price: 35000, duration: 60, notes: '' },
  { id: 16, customerId: 3, serviceId: 2, employeeId: '3', bookingDate: '2025-08-08', timeSlot: '10:00', status: 'completed' as const, price: 45000, duration: 90, notes: '' },
  { id: 17, customerId: 4, serviceId: 1, employeeId: '2', bookingDate: '2025-08-07', timeSlot: '15:00', status: 'completed' as const, price: 35000, duration: 60, notes: '' },
  { id: 18, customerId: 5, serviceId: 3, employeeId: '4', bookingDate: '2025-08-06', timeSlot: '11:00', status: 'completed' as const, price: 55000, duration: 120, notes: '' },
  { id: 19, customerId: 6, serviceId: 2, employeeId: '5', bookingDate: '2025-08-05', timeSlot: '16:00', status: 'completed' as const, price: 45000, duration: 90, notes: '' },
  
  // Previous months for yearly data
  { id: 20, customerId: 1, serviceId: 4, employeeId: '1', bookingDate: '2025-07-25', timeSlot: '14:00', status: 'completed' as const, price: 75000, duration: 150, notes: '' },
  { id: 21, customerId: 2, serviceId: 2, employeeId: '2', bookingDate: '2025-07-20', timeSlot: '10:00', status: 'completed' as const, price: 45000, duration: 90, notes: '' },
  { id: 22, customerId: 3, serviceId: 1, employeeId: '3', bookingDate: '2025-07-15', timeSlot: '13:00', status: 'completed' as const, price: 35000, duration: 60, notes: '' },
  { id: 23, customerId: 4, serviceId: 3, employeeId: '4', bookingDate: '2025-06-30', timeSlot: '16:00', status: 'completed' as const, price: 55000, duration: 120, notes: '' },
  { id: 24, customerId: 5, serviceId: 2, employeeId: '5', bookingDate: '2025-06-25', timeSlot: '11:00', status: 'completed' as const, price: 45000, duration: 90, notes: '' }
]

// Payment records corresponding to completed bookings
export const mockPayments = mockBookings
  .filter(booking => booking.status === 'completed')
  .map(booking => ({
    id: booking.id,
    bookingId: booking.id,
    customerId: booking.customerId,
    amount: booking.price,
    paymentMethod: Math.random() > 0.5 ? 'Card' : 'Cash',
    paymentStatus: 'completed' as const,
    transactionId: `TXN-${booking.id.toString().padStart(6, '0')}`,
    paymentDate: booking.bookingDate,
    notes: ''
  }))

// Service records for completed bookings with actual performance data
export const mockServiceRecords = mockBookings
  .filter(booking => booking.status === 'completed')
  .map(booking => {
    const actualDuration = booking.duration + Math.floor(Math.random() * 20 - 10) // ±10 minutes variation
    const actualPrice = booking.price // Keep price same for completed services
    return {
      id: booking.id,
      bookingId: booking.id,
      customerId: booking.customerId,
      employeeId: booking.employeeId!,
      serviceId: booking.serviceId,
      actualStartTime: `${booking.bookingDate}T${booking.timeSlot}:00`,
      actualEndTime: `${booking.bookingDate}T${addMinutesToTime(booking.timeSlot, actualDuration)}:00`,
      actualDuration,
      actualPrice,
      serviceNotes: `Service completed successfully. Duration: ${actualDuration} minutes.`,
      customerSatisfaction: Math.floor(Math.random() * 2) + 4, // 4-5 rating
      serviceDate: booking.bookingDate,
      status: 'completed' as const
    }
  })

// Helper function to add minutes to time string
function addMinutesToTime(timeString: string, minutes: number): string {
  const [hours, mins] = timeString.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, mins + minutes)
  return date.toTimeString().substring(0, 5)
}

// Employee work summary data
export const mockEmployeeWorkSummary = mockEmployees.map(employee => {
  const employeeRecords = mockServiceRecords.filter(record => record.employeeId === employee.id)
  const todayRecords = employeeRecords.filter(record => record.serviceDate === todayStr)
  const totalRevenue = todayRecords.reduce((sum, record) => sum + record.actualPrice, 0)
  const totalHours = todayRecords.reduce((sum, record) => sum + record.actualDuration, 0) / 60
  const avgRating = todayRecords.length > 0 ? 
    todayRecords.reduce((sum, record) => sum + record.customerSatisfaction, 0) / todayRecords.length : 0

  return {
    id: parseInt(employee.id),
    employeeId: employee.id,
    workDate: todayStr,
    totalCustomers: todayRecords.length,
    totalRevenue,
    totalHours: parseFloat(totalHours.toFixed(2)),
    servicesPerformed: todayRecords.map(record => ({
      serviceId: record.serviceId,
      customerId: record.customerId,
      duration: record.actualDuration,
      revenue: record.actualPrice,
      satisfaction: record.customerSatisfaction
    })),
    averageRating: parseFloat(avgRating.toFixed(2)),
    notes: `Worked ${todayRecords.length} appointments today`
  }
})

// Helper functions to get data by relationships
export const getCustomerName = (customerId: number) => {
  const customer = mockCustomers.find(c => c.id === customerId)
  return customer?.name || 'Unknown Customer'
}

export const getCustomer = (customerId: number) => {
  return mockCustomers.find(c => c.id === customerId)
}

export const getServiceName = (serviceId: number) => {
  const service = mockServices.find(s => s.id === serviceId)
  return service?.name || 'Unknown Service'
}

export const getService = (serviceId: number) => {
  return mockServices.find(s => s.id === serviceId)
}

export const getEmployeeName = (employeeId: string | null) => {
  if (!employeeId) return 'Unassigned'
  const employee = mockEmployees.find(e => e.id === employeeId)
  return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee'
}

export const getEmployee = (employeeId: string) => {
  return mockEmployees.find(e => e.id === employeeId)
}