import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const status = searchParams.get('status')
    const customer_id = searchParams.get('customer_id')

    // bookings 테이블에서 직접 조회
    let query = supabase
      .from('bookings')
      .select(`
        id, customer_id, customer_phone, booking_start, booking_end, status, notes, prepay, prepay_cents,
        customers!inner (id, first_name, last_name, phone_e164)
      `)
      .order('booking_start', { ascending: true })

    if (date) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)
      
      query = query
        .gte('booking_start', startOfDay.toISOString())
        .lte('booking_start', endOfDay.toISOString())
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (customer_id) {
      query = query.eq('customer_id', customer_id)
    }

    const { data: bookings, error } = await query

    if (error) {
      console.error('Supabase bookings query failed:', error)
      // 테이블이 없으면 빈 배열 반환
      return NextResponse.json([])
    }

    // 각 부킹의 서비스 정보도 가져오기
    const bookingsWithServices = await Promise.all(
      (bookings || []).map(async (booking) => {
        const { data: bookingDetails } = await supabase
          .from('booking_details')
          .select(`
            *,
            services (id, name, description, base_price_cents, duration_min)
          `)
          .eq('booking_id', booking.id)

        return {
          ...booking,
          booking_id: booking.id,
          services: bookingDetails || [],
          total_amount: (bookingDetails || []).reduce((sum, detail) => 
            sum + (detail.price_cents * detail.quantity), 0
          ) / 100 // cents to dollars
        }
      })
    )

    return NextResponse.json(bookingsWithServices)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      customer_id, customer_phone, booking_start, booking_end, 
      notes, prepay, prepay_amount, services = [] 
    } = body

    // 트랜잭션으로 부킹과 부킹 상세 함께 생성
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert([{
        customer_id,
        customer_phone,
        booking_start,
        booking_end,
        notes,
        prepay: prepay || false,
        prepay_cents: prepay_amount ? Math.round(prepay_amount * 100) : 0,
        status: 'scheduled'
      }])
      .select()
      .single()

    if (bookingError) {
      console.error('Supabase booking insert failed:', bookingError)
      return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
    }

    // 부킹 상세 생성
    if (services.length > 0) {
      const bookingDetails = services.map((service: any) => ({
        booking_id: booking.id,
        service_id: service.id,
        price_cents: Math.round((service.price || service.base_price_cents / 100) * 100),
        quantity: service.quantity || 1
      }))

      const { error: detailsError } = await supabase
        .from('booking_details')
        .insert(bookingDetails)

      if (detailsError) {
        console.error('Supabase booking details insert failed:', detailsError)
        // 부킹 롤백
        await supabase.from('bookings').delete().eq('id', booking.id)
        return NextResponse.json({ error: 'Failed to create booking details' }, { status: 500 })
      }
    }

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, notes, booking_start, booking_end } = body

    if (!id) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 })
    }

    const { data: booking, error } = await supabase
      .from('bookings')
      .update({
        status,
        notes,
        booking_start,
        booking_end
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Supabase booking update failed:', error)
      return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}