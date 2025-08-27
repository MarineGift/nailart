import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 날짜 유틸리티 함수
function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6 // Sunday = 0, Saturday = 6
}

function getRandomTimeSlot(): string {
  const timeSlots = [
    '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00'
  ]
  return timeSlots[Math.floor(Math.random() * timeSlots.length)]
}

function getRandomServices(): number[] {
  // 1-3개의 서비스 랜덤 선택
  const serviceCount = Math.floor(Math.random() * 3) + 1
  const allServiceIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]
  
  const selectedServices: number[] = []
  for (let i = 0; i < serviceCount; i++) {
    const randomService = allServiceIds[Math.floor(Math.random() * allServiceIds.length)]
    if (!selectedServices.includes(randomService)) {
      selectedServices.push(randomService)
    }
  }
  
  return selectedServices
}

export async function POST(request: NextRequest) {
  try {
    console.log('📅 Generating bookings from 2025-08-25 to 2025-09-10...')
    
    // 고객과 직원 데이터 가져오기
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('id')
    
    if (customersError) {
      console.error('❌ Error fetching customers:', customersError)
      return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
    }

    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .select('id')
    
    if (staffError) {
      console.error('❌ Error fetching staff:', staffError)
      return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 })
    }

    console.log(`👥 Found ${customers?.length} customers and ${staff?.length} staff`)
    
    if (!customers || customers.length === 0) {
      return NextResponse.json({ error: 'No customers found' }, { status: 400 })
    }
    
    if (!staff || staff.length === 0) {
      return NextResponse.json({ error: 'No staff found' }, { status: 400 })
    }

    // 날짜 범위 생성 (8월 25일부터 9월 10일까지, 토일 제외)
    const startDate = new Date('2025-08-25')
    const endDate = new Date('2025-09-10')
    
    const workingDays: Date[] = []
    const currentDate = new Date(startDate)
    
    while (currentDate <= endDate) {
      if (!isWeekend(currentDate)) {
        workingDays.push(new Date(currentDate))
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    console.log(`📅 Generated ${workingDays.length} working days`)

    // 20-30개의 예약 생성
    const bookingCount = Math.floor(Math.random() * 11) + 20 // 20~30개
    console.log(`📋 Generating ${bookingCount} bookings...`)
    
    const bookingsToInsert = []
    const bookingDetailsToInsert = []
    
    for (let i = 0; i < bookingCount; i++) {
      // 랜덤 고객과 직원 선택
      const randomCustomer = customers[Math.floor(Math.random() * customers.length)]
      const randomStaff = staff[Math.floor(Math.random() * staff.length)]
      const randomDate = workingDays[Math.floor(Math.random() * workingDays.length)]
      const randomTime = getRandomTimeSlot()
      
      const bookingId = crypto.randomUUID()
      const services = getRandomServices()
      
      // 예약 데이터
      const booking = {
        id: bookingId,
        customer_id: randomCustomer.id,
        booking_time: `${randomDate.toISOString().split('T')[0]}T${randomTime}:00+00:00`,
        status: 'scheduled',
        source: 'Homepage',
        prepay: false,
        prepay_cents: 0,
        duration_minutes: 60,
        notes: `| Assigned Staff: ${randomStaff.id}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        cancelled_at: null,
        cancellation_reason: null,
        is_noshow: false,
        discount_cents: 0,
        original_booking_id: null,
        rebooking_reason: null,
        actual_customer_id: null
      }
      
      bookingsToInsert.push(booking)
      
      // 각 서비스에 대한 booking_details 생성
      for (const serviceId of services) {
        const bookingDetail = {
          booking_id: bookingId,
          service_id: serviceId,
          quantity: 1,
          price_cents: Math.floor(Math.random() * 5000) + 2000, // $20-$70 랜덤 가격
          notes: 'Service selected during booking',
          created_at: new Date().toISOString()
        }
        
        bookingDetailsToInsert.push(bookingDetail)
      }
    }
    
    console.log(`📝 Inserting ${bookingsToInsert.length} bookings...`)
    
    // 예약 데이터 삽입
    const { error: bookingsError } = await supabase
      .from('bookings')
      .insert(bookingsToInsert)
    
    if (bookingsError) {
      console.error('❌ Bookings insertion error:', bookingsError)
      return NextResponse.json({ 
        error: 'Failed to insert bookings', 
        details: bookingsError 
      }, { status: 500 })
    }
    
    console.log(`📋 Inserting ${bookingDetailsToInsert.length} booking details...`)
    
    // 예약 상세 데이터 삽입
    const { error: detailsError } = await supabase
      .from('booking_details')
      .insert(bookingDetailsToInsert)
    
    if (detailsError) {
      console.error('❌ Booking details insertion error:', detailsError)
      return NextResponse.json({ 
        error: 'Failed to insert booking details', 
        details: detailsError 
      }, { status: 500 })
    }
    
    console.log(`✅ Successfully generated ${bookingsToInsert.length} bookings with ${bookingDetailsToInsert.length} details`)
    
    return NextResponse.json({ 
      success: true,
      bookingsGenerated: bookingsToInsert.length,
      detailsGenerated: bookingDetailsToInsert.length,
      workingDaysCount: workingDays.length,
      message: 'Bookings generated successfully'
    })

  } catch (error) {
    console.error('❌ Booking generation error:', error)
    return NextResponse.json({ 
      error: 'Booking generation failed', 
      details: error 
    }, { status: 500 })
  }
}