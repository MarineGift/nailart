import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST() {
  try {
    const results = []

    // 1. Clear existing data and create 10 staff members
    console.log('Creating 10 staff members...')
    
    // Delete existing staff
    await supabase.from('staff').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    
    // Create new staff: 1 admin, 2 managers, 7 staff
    const staffData = [
      { first_name: 'Connie', last_name: 'Lee', role: 'admin', email: 'connie@connienail.com', phone: '202-555-0001' },
      { first_name: 'Sarah', last_name: 'Kim', role: 'manager', email: 'sarah@connienail.com', phone: '202-555-0002' },
      { first_name: 'Michelle', last_name: 'Park', role: 'manager', email: 'michelle@connienail.com', phone: '202-555-0003' },
      { first_name: 'Jessica', last_name: 'Wang', role: 'staff', email: 'jessica@connienail.com', phone: '202-555-0004' },
      { first_name: 'Amy', last_name: 'Chen', role: 'staff', email: 'amy@connienail.com', phone: '202-555-0005' },
      { first_name: 'Sophia', last_name: 'Williams', role: 'staff', email: 'sophia@connienail.com', phone: '202-555-0006' },
      { first_name: 'Emma', last_name: 'Davis', role: 'staff', email: 'emma@connienail.com', phone: '202-555-0007' },
      { first_name: 'Olivia', last_name: 'Johnson', role: 'staff', email: 'olivia@connienail.com', phone: '202-555-0008' },
      { first_name: 'Isabella', last_name: 'Martinez', role: 'staff', email: 'isabella@connienail.com', phone: '202-555-0009' },
      { first_name: 'Mia', last_name: 'Garcia', role: 'staff', email: 'mia@connienail.com', phone: '202-555-0010' }
    ]

    const { data: staffInserted, error: staffError } = await supabase
      .from('staff')
      .insert(staffData.map(staff => ({
        ...staff,
        is_active: true,
        created_at: new Date().toISOString()
      })))
      .select()

    if (staffError) {
      results.push({ step: 'staff_creation', error: staffError.message })
    } else {
      results.push({ step: 'staff_creation', count: staffInserted?.length || 0 })
    }

    // 2. Create 200 customers
    console.log('Creating 200 customers...')
    
    // Clear existing customers
    await supabase.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    
    const customers = []
    const firstNames = ['Jennifer', 'Sarah', 'Jessica', 'Emily', 'Ashley', 'Amanda', 'Stephanie', 'Nicole', 'Rachel', 'Heather', 'Amy', 'Michelle', 'Kimberly', 'Angela', 'Tiffany', 'Christina', 'Lisa', 'Melissa', 'Kelly', 'Crystal']
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin']
    
    for (let i = 1; i <= 200; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
      const phone = `202-555-${String(i).padStart(4, '0')}`
      
      customers.push({
        first_name: firstName,
        last_name: lastName,
        phone_raw: phone,
        phone_e164: `+1${phone.replace(/[^0-9]/g, '')}`,
        created_at: new Date().toISOString()
      })
    }

    // Insert customers in batches
    const batchSize = 50
    let customerCount = 0
    for (let i = 0; i < customers.length; i += batchSize) {
      const batch = customers.slice(i, i + batchSize)
      const { data, error } = await supabase
        .from('customers')
        .insert(batch)
        .select()
      
      if (!error) {
        customerCount += data?.length || 0
      }
    }
    
    results.push({ step: 'customers_creation', count: customerCount })

    // 3. Get staff and customer IDs for bookings
    const { data: allStaff } = await supabase.from('staff').select('id, first_name, last_name').eq('is_active', true)
    const { data: allCustomers } = await supabase.from('customers').select('id, phone_raw').limit(200)
    const { data: allServices } = await supabase.from('services').select('id, name, base_price_cents, duration_min')

    if (!allStaff || !allCustomers || !allServices) {
      return NextResponse.json({ error: 'Failed to get required data for bookings' }, { status: 500 })
    }

    // 4. Generate work schedule (using booking dates to represent staff availability)
    console.log('Generating bookings from Aug 20 to Sep 30...')
    
    // Clear existing bookings
    await supabase.from('booking_details').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('bookings').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    
    const startDate = new Date('2025-08-20')
    const endDate = new Date('2025-09-30')
    const bookings = []
    const bookingDetails = []
    
    let bookingCount = 0
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      // Skip weekends (Saturday = 6, Sunday = 0)
      if (date.getDay() === 0 || date.getDay() === 6) continue
      
      // 하루에 4-6개의 예약 생성
      const dailyBookings = 4 + Math.floor(Math.random() * 3) // 4-6개
      
      for (let b = 0; b < dailyBookings; b++) {
        const customer = allCustomers[Math.floor(Math.random() * allCustomers.length)]
        const staff = allStaff[Math.floor(Math.random() * allStaff.length)]
        
        // 10:00-19:00 사이 랜덤 시간
        const hour = 10 + Math.floor(Math.random() * 9)
        const minute = Math.random() < 0.5 ? 0 : 30
        
        const bookingStart = new Date(date)
        bookingStart.setHours(hour, minute, 0, 0)
        
        const bookingEnd = new Date(bookingStart)
        bookingEnd.setMinutes(bookingEnd.getMinutes() + 60) // 기본 1시간
        
        const bookingId = crypto.randomUUID()
        
        bookings.push({
          id: bookingId,
          customer_id: customer.id,
          customer_phone: customer.phone_raw,
          booking_start: bookingStart.toISOString(),
          booking_end: bookingEnd.toISOString(),
          status: Math.random() < 0.9 ? 'completed' : 'scheduled',
          notes: `Booking for ${customer.phone_raw}`,
          created_by: staff.id, // staff assignment
          created_at: new Date().toISOString()
        })

        // 1-3개의 서비스 추가
        const serviceCount = 1 + Math.floor(Math.random() * 3)
        for (let s = 0; s < serviceCount; s++) {
          const service = allServices[Math.floor(Math.random() * allServices.length)]
          
          bookingDetails.push({
            id: crypto.randomUUID(),
            booking_id: bookingId,
            service_id: service.id,
            price_cents: service.base_price_cents,
            quantity: 1,
            created_at: new Date().toISOString()
          })
        }
        
        bookingCount++
        if (bookingCount >= 200) break
      }
      
      if (bookingCount >= 200) break
    }

    // Insert bookings in batches
    let insertedBookings = 0
    for (let i = 0; i < bookings.length; i += 20) {
      const batch = bookings.slice(i, i + 20)
      const { data, error } = await supabase
        .from('bookings')
        .insert(batch)
        .select()
      
      if (!error) {
        insertedBookings += data?.length || 0
      }
    }

    // Insert booking details in batches
    let insertedDetails = 0
    for (let i = 0; i < bookingDetails.length; i += 30) {
      const batch = bookingDetails.slice(i, i + 30)
      const { data, error } = await supabase
        .from('booking_details')
        .insert(batch)
        .select()
      
      if (!error) {
        insertedDetails += data?.length || 0
      }
    }

    results.push({ 
      step: 'bookings_creation', 
      bookings: insertedBookings,
      booking_details: insertedDetails
    })

    return NextResponse.json({
      message: '완전한 테스트 데이터 생성 완료!',
      summary: {
        staff: '10명 (admin 1, manager 2, staff 7)',
        customers: '200명',
        bookings: `${insertedBookings}개 (Aug 20 - Sep 30)`,
        services_applied: `${insertedDetails}개 서비스 항목`,
        period: '2025-08-20 ~ 2025-09-30',
        work_schedule: '평일 10:00-19:00, 하루 4-6명 근무'
      },
      results: results
    })

  } catch (error) {
    console.error('Error generating data:', error)
    return NextResponse.json({ error: 'Failed to generate data' }, { status: 500 })
  }
}