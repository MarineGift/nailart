import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Test data generation endpoint based on actual database structure
export async function POST(request: NextRequest) {
  try {
    const database = db()
    if (!database) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 })
    }

    const body = await request.json()
    const { action } = body

    if (action === 'generate-all') {
      // Generate all test data
      await generateStaffs(database)
      await generateCustomers(database)
      await generateServices(database)
      await generateBookings(database)
      await generateTreatments(database)
      
      return NextResponse.json({ 
        success: true, 
        message: 'All test data generated successfully'
      })
    }

    if (action === 'clear-all') {
      // Clear all data in correct order (due to foreign key constraints)
      await database.execute('DELETE FROM treatments')
      await database.execute('DELETE FROM bookings')
      await database.execute('DELETE FROM customers')
      await database.execute('DELETE FROM services')
      await database.execute('DELETE FROM staff')
      
      return NextResponse.json({ 
        success: true, 
        message: 'All data cleared successfully'
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error managing test data:', error)
    return NextResponse.json({ error: 'Failed to manage test data' }, { status: 500 })
  }
}

// Generate 10 staff (1 admin, 2 managers, 7 staff) based on actual DB structure
async function generateStaffs(database: any) {
  // Get role IDs first
  const rolesResult = await database.execute('SELECT id, name FROM roles')
  const roles = rolesResult.rows || []
  console.log('Roles found:', roles)
  const adminRoleId = roles.find((r: any) => r.name === 'admin')?.id || '35eedbce-adcd-4d53-82d0-dc8210f7c87f'
  const managerRoleId = roles.find((r: any) => r.name === 'manager')?.id || 'd7d56f7a-5958-44f2-ac97-9c2caa5db1ab'
  const staffRoleId = roles.find((r: any) => r.name === 'staff')?.id || '5e91e69f-8501-48de-a729-2ebc160b21bc'
  console.log('Role IDs:', { adminRoleId, managerRoleId, staffRoleId })

  const staff = [
    {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      staff_number: 'EMP001',
      first_name: 'Admin',
      last_name: 'User',
      email: 'admin@connienail.com',
      phone_number: '010-1234-5678',
      position: 'System Administrator',
      role: 'admin',
      role_id: adminRoleId,
      department: 'Management',
      status: 'active',
      hire_date: '2023-01-01',
      salary: 8000000
    },
    {
      id: 'b2c3d4e5-f6g7-8901-bcde-f23456789012',
      staff_number: 'EMP002',
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane.smith@connienail.com',
      phone_number: '010-2345-6789',
      position: 'Salon Manager',
      role: 'manager',
      role_id: managerRoleId,
      department: 'Operations',
      status: 'active',
      hire_date: '2023-02-01',
      salary: 6000000
    },
    {
      id: 'c3d4e5f6-g7h8-9012-cdef-345678901234',
      staff_number: 'EMP003',
      first_name: 'Michael',
      last_name: 'Johnson',
      email: 'michael.johnson@connienail.com',
      phone_number: '010-3456-7890',
      position: 'Assistant Manager',
      role: 'manager',
      role_id: managerRoleId,
      department: 'Operations',
      status: 'active',
      hire_date: '2023-03-01',
      salary: 5500000
    },
    {
      id: 'd4e5f6g7-h8i9-0123-defg-456789012345',
      staff_number: 'EMP004',
      first_name: 'Sarah',
      last_name: 'Kim',
      email: 'sarah.kim@connienail.com',
      phone_number: '010-4567-8901',
      position: 'Senior Nail Technician',
      role: 'staff',
      role_id: staffRoleId,
      department: 'Service',
      status: 'active',
      hire_date: '2023-04-01',
      salary: 4500000
    },
    {
      id: 'e5f6g7h8-i9j0-1234-efgh-567890123456',
      staff_number: 'EMP005',
      first_name: 'Jessica',
      last_name: 'Lee',
      email: 'jessica.lee@connienail.com',
      phone_number: '010-5678-9012',
      position: 'Nail Technician',
      role: 'staff',
      role_id: staffRoleId,
      department: 'Service',
      status: 'active',
      hire_date: '2023-05-01',
      salary: 4000000
    },
    {
      id: 'f6g7h8i9-j0k1-2345-fghi-678901234567',
      staff_number: 'EMP006',
      first_name: 'Amy',
      last_name: 'Chen',
      email: 'amy.chen@connienail.com',
      phone_number: '010-6789-0123',
      position: 'Nail Technician',
      role: 'staff',
      role_id: staffRoleId,
      department: 'Service',
      status: 'active',
      hire_date: '2023-06-01',
      salary: 3800000
    },
    {
      id: 'g7h8i9j0-k1l2-3456-ghij-789012345678',
      staff_number: 'EMP007',
      first_name: 'Emily',
      last_name: 'Wang',
      email: 'emily.wang@connienail.com',
      phone_number: '010-7890-1234',
      position: 'Junior Nail Technician',
      role: 'staff',
      role_id: staffRoleId,
      department: 'Service',
      status: 'active',
      hire_date: '2023-07-01',
      salary: 3500000
    },
    {
      id: 'h8i9j0k1-l2m3-4567-hijk-890123456789',
      staff_number: 'EMP008',
      first_name: 'Lisa',
      last_name: 'Park',
      email: 'lisa.park@connienail.com',
      phone_number: '010-8901-2345',
      position: 'Nail Technician',
      role: 'staff',
      role_id: staffRoleId,
      department: 'Service',
      status: 'active',
      hire_date: '2023-08-01',
      salary: 4000000
    },
    {
      id: 'i9j0k1l2-m3n4-5678-ijkl-901234567890',
      staff_number: 'EMP009',
      first_name: 'Maria',
      last_name: 'Garcia',
      email: 'maria.garcia@connienail.com',
      phone_number: '010-9012-3456',
      position: 'Nail Artist',
      role: 'staff',
      role_id: staffRoleId,
      department: 'Service',
      status: 'active',
      hire_date: '2023-09-01',
      salary: 4200000
    },
    {
      id: 'j0k1l2m3-n4o5-6789-jklm-012345678901',
      staff_number: 'EMP010',
      first_name: 'Anna',
      last_name: 'Wilson',
      email: 'anna.wilson@connienail.com',
      phone_number: '010-0123-4567',
      position: 'Nail Technician',
      role: 'staff',
      role_id: staffRoleId,
      department: 'Service',
      status: 'active',
      hire_date: '2023-10-01',
      salary: 3900000
    }
  ]

  // Insert staff one by one to avoid bulk errors
  for (const emp of staff) {
    await database.execute(`
      INSERT INTO staff (id, staff_number, first_name, last_name, email, phone_number, position, role, role_id, department, status, hire_date, salary)
      VALUES ('${emp.id}', '${emp.staff_number}', '${emp.first_name}', '${emp.last_name}', '${emp.email}', '${emp.phone_number}', '${emp.position}', '${emp.role}', '${emp.role_id}', '${emp.department}', '${emp.status}', '${emp.hire_date}', ${emp.salary})
      ON CONFLICT (id) DO NOTHING
    `)
  }
}

// Generate 200 customers with required phone and lastName
async function generateCustomers(database: any) {
  const firstNames = ['김민수', '이영희', '박철수', '최영수', '정미영', '강현진', '조지은', '윤준호', '장수진', '임태현', 'Sarah', 'Emily', 'Jessica', 'Anna', 'Lisa', 'Maria', 'Jennifer', 'Michelle', 'Amanda', 'Rachel']
  const lastNames = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez']
  
  for (let i = 1; i <= 200; i++) {
    const randomFirst = firstNames[Math.floor(Math.random() * firstNames.length)]
    const randomLast = lastNames[Math.floor(Math.random() * lastNames.length)]
    const phone = `010-${String(Math.floor(1000 + Math.random() * 9000))}-${String(Math.floor(1000 + Math.random() * 9000))}`
    const email = Math.random() > 0.3 ? `customer${i}@email.com` : null
    const totalSpent = (Math.random() * 500000).toFixed(2)
    const vipLevel = i % 10 === 0 ? 'Gold' : i % 5 === 0 ? 'Silver' : 'Bronze'
    
    await database.execute(`
      INSERT INTO customers (first_name, last_name, phone_number, email, total_spent, vip_level, total_visits)
      VALUES ('${randomFirst}', '${randomLast}', '${phone}', ${email ? `'${email}'` : 'NULL'}, ${totalSpent}, '${vipLevel}', ${Math.floor(Math.random() * 20)})
    `)
  }
}

// Generate services
async function generateServices(database: any) {
  const services = [
    { name: 'Classic Manicure', description: '기본 매니큐어', duration: 45, price: 35000, category: 'Manicure' },
    { name: 'Gel Manicure', description: '젤 매니큐어', duration: 60, price: 45000, category: 'Manicure' },
    { name: 'French Manicure', description: '프렌치 매니큐어', duration: 50, price: 40000, category: 'Manicure' },
    { name: 'Nail Art', description: '네일 아트', duration: 90, price: 65000, category: 'Art' },
    { name: 'Acrylic Extensions', description: '아크릴 연장', duration: 120, price: 80000, category: 'Extensions' },
    { name: 'Basic Pedicure', description: '기본 페디큐어', duration: 60, price: 40000, category: 'Pedicure' },
    { name: 'Premium Pedicure', description: '프리미엄 페디큐어', duration: 90, price: 60000, category: 'Pedicure' },
    { name: 'Nail Repair', description: '네일 보수', duration: 30, price: 25000, category: 'Repair' }
  ]
  
  for (const service of services) {
    await database.execute(`
      INSERT INTO services (name, description, duration, price, category, is_active)
      VALUES ('${service.name}', '${service.description}', ${service.duration}, ${service.price}, '${service.category}', true)
    `)
  }
}

// Generate bookings based on work schedules
async function generateBookings(database: any) {
  // First generate work schedules for staff (Mon-Fri, 10:00-19:00)
  const staffIds = [
    'b2c3d4e5-f6g7-8901-bcde-f23456789012', // Jane (Manager)
    'c3d4e5f6-g7h8-9012-cdef-345678901234', // Michael (Manager)
    'd4e5f6g7-h8i9-0123-defg-456789012345', // Sarah
    'e5f6g7h8-i9j0-1234-efgh-567890123456', // Jessica
    'f6g7h8i9-j0k1-2345-fghi-678901234567', // Amy
    'g7h8i9j0-k1l2-3456-ghij-789012345678', // Emily
    'h8i9j0k1-l2m3-4567-hijk-890123456789', // Lisa
    'i9j0k1l2-m3n4-5678-ijkl-901234567890', // Maria
    'j0k1l2m3-n4o5-6789-jklm-012345678901'  // Anna
  ]
  
  const startDate = new Date('2025-08-01')
  const endDate = new Date('2025-12-31')
  
  // Generate work schedules and bookings
  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    const dayOfWeek = date.getDay()
    
    // Skip weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) continue
    
    const dateString = date.toISOString().split('T')[0]
    
    // Select 5-7 random staff for each day
    const dailyStaffCount = 5 + Math.floor(Math.random() * 3)
    const dailyStaff = shuffleArray([...staffIds]).slice(0, dailyStaffCount)
    
    // Generate bookings for each working staff
    for (const staffId of dailyStaff) {
      const dailyBookings = 3 + Math.floor(Math.random() * 4) // 3-6 bookings per staff
      
      for (let i = 0; i < dailyBookings; i++) {
        const customerId = Math.floor(Math.random() * 200) + 1
        const serviceId = Math.floor(Math.random() * 8) + 1
        const timeSlots = ['10:00', '11:30', '13:00', '14:30', '16:00', '17:30']
        const timeSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)]
        const status = Math.random() > 0.7 ? 'completed' : 'confirmed'
        const price = 25000 + Math.floor(Math.random() * 60000)
        
        await database.execute(`
          INSERT INTO bookings (customer_id, service_id, staff_id, booking_date, time_slot, status, price, duration)
          VALUES (${customerId}, ${serviceId}, '${staffId}', '${dateString}', '${timeSlot}', '${status}', ${price}, 60)
        `)
      }
    }
  }
}

// Generate treatments from completed bookings
async function generateTreatments(database: any) {
  const completedBookingsResult = await database.execute('SELECT * FROM bookings WHERE status = \'completed\' LIMIT 500')
  const completedBookings = completedBookingsResult.rows || []
  
  for (const booking of completedBookings) {
    const tipAmount = Math.floor(Math.random() * 30000)
    const tipMethod = tipAmount > 0 ? (Math.random() > 0.5 ? 'card' : 'cash') : 'cash'
    
    let finalAmount = parseFloat(booking.price || '0')
    if (tipMethod === 'card') {
      finalAmount += tipAmount
    }
    
    const serviceDate = booking.booking_date || new Date().toISOString().split('T')[0]
    
    await database.execute(`
      INSERT INTO treatments (
        booking_id, customer_id, staff_id, service_id, 
        actual_price, tip_amount, tip_payment_method, final_amount,
        customer_satisfaction, service_notes, treatment_status, payment_status, service_date
      )
      VALUES (
        ${booking.id}, ${booking.customer_id}, '${booking.staff_id}', ${booking.service_id},
        ${booking.price}, ${tipAmount}, '${tipMethod}', ${finalAmount},
        ${4 + Math.floor(Math.random() * 2)}, 'Treatment completed successfully', 'completed', 'completed', '${serviceDate}'
      )
    `)
  }
}

// Utility function to shuffle array
function shuffleArray(array: any[]) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}