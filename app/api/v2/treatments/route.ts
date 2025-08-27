import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const booking_id = searchParams.get('booking_id')
    const staff_id = searchParams.get('staff_id')
    const date = searchParams.get('date')

    let query = supabase
      .from('treatments')
      .select(`
        *,
        bookings!inner (
          id, customer_id, customer_phone, booking_start, booking_end, status,
          customers (id, first_name, last_name, phone_raw)
        ),
        staff (id, first_name, last_name, role)
      `)
      .order('created_at', { ascending: false })

    if (booking_id) {
      query = query.eq('booking_id', booking_id)
    }

    if (staff_id) {
      query = query.eq('staff_id', staff_id)
    }

    if (date) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)
      
      query = query
        .gte('bookings.booking_start', startOfDay.toISOString())
        .lte('bookings.booking_start', endOfDay.toISOString())
    }

    const { data: treatments, error } = await query

    if (error) {
      console.error('Supabase treatments query failed:', error)
      return NextResponse.json({ error: 'Database query failed' }, { status: 500 })
    }

    // 각 트리트먼트의 상세 정보도 가져오기
    const treatmentsWithDetails = await Promise.all(
      (treatments || []).map(async (treatment) => {
        const { data: treatmentDetails } = await supabase
          .from('treatment_details')
          .select(`
            *,
            services (id, name, description, base_price_cents, duration_min)
          `)
          .eq('treatment_id', treatment.id)

        return {
          ...treatment,
          details: treatmentDetails || [],
          service_total_dollars: treatment.service_total_cents / 100,
          tip_dollars: treatment.tip_cents / 100,
          grand_total_dollars: treatment.grand_total_cents / 100
        }
      })
    )

    return NextResponse.json(treatmentsWithDetails)
  } catch (error) {
    console.error('Error fetching treatments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      booking_id, staff_id, service_total, tip_amount, 
      tip_included_in_card, satisfaction, notes, services = [] 
    } = body

    const service_total_cents = Math.round(service_total * 100)
    const tip_cents = Math.round(tip_amount * 100)
    const grand_total_cents = service_total_cents + tip_cents

    // 트리트먼트 생성
    const { data: treatment, error: treatmentError } = await supabase
      .from('treatments')
      .insert([{
        booking_id,
        staff_id,
        service_total_cents,
        tip_included_in_card: tip_included_in_card || false,
        tip_cents,
        grand_total_cents,
        satisfaction,
        notes
      }])
      .select()
      .single()

    if (treatmentError) {
      console.error('Supabase treatment insert failed:', treatmentError)
      return NextResponse.json({ error: 'Failed to create treatment' }, { status: 500 })
    }

    // 트리트먼트 상세 생성
    if (services.length > 0) {
      const treatmentDetails = services.map((service: any) => ({
        treatment_id: treatment.id,
        service_id: service.id,
        price_cents: Math.round((service.price || service.base_price_cents / 100) * 100),
        quantity: service.quantity || 1
      }))

      const { error: detailsError } = await supabase
        .from('treatment_details')
        .insert(treatmentDetails)

      if (detailsError) {
        console.error('Supabase treatment details insert failed:', detailsError)
        // 트리트먼트 롤백
        await supabase.from('treatments').delete().eq('id', treatment.id)
        return NextResponse.json({ error: 'Failed to create treatment details' }, { status: 500 })
      }
    }

    // 부킹 상태를 completed로 업데이트
    await supabase
      .from('bookings')
      .update({ status: 'completed' })
      .eq('id', booking_id)

    // Payment 레코드 생성 (카드 결제인 경우)
    if (tip_included_in_card) {
      // 고객 정보 가져오기
      const { data: booking } = await supabase
        .from('bookings')
        .select('customer_id')
        .eq('id', booking_id)
        .single()

      if (booking) {
        await supabase
          .from('payments')
          .insert([{
            customer_id: booking.customer_id,
            booking_id,
            method: 'card',
            status: 'captured',
            amount_cents: grand_total_cents,
            tip_cents,
            currency: 'USD'
          }])
      }
    } else {
      // 서비스 금액만 카드로 결제
      const { data: booking } = await supabase
        .from('bookings')
        .select('customer_id')
        .eq('id', booking_id)
        .single()

      if (booking) {
        await supabase
          .from('payments')
          .insert([{
            customer_id: booking.customer_id,
            booking_id,
            method: 'card',
            status: 'captured',
            amount_cents: service_total_cents,
            tip_cents: 0,
            currency: 'USD'
          }])
      }
    }

    return NextResponse.json(treatment, { status: 201 })
  } catch (error) {
    console.error('Error creating treatment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, service_total, tip_amount, tip_included_in_card, satisfaction, notes } = body

    if (!id) {
      return NextResponse.json({ error: 'Treatment ID is required' }, { status: 400 })
    }

    const service_total_cents = Math.round(service_total * 100)
    const tip_cents = Math.round(tip_amount * 100)
    const grand_total_cents = service_total_cents + tip_cents

    const { data: treatment, error } = await supabase
      .from('treatments')
      .update({
        service_total_cents,
        tip_included_in_card: tip_included_in_card || false,
        tip_cents,
        grand_total_cents,
        satisfaction,
        notes
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Supabase treatment update failed:', error)
      return NextResponse.json({ error: 'Failed to update treatment' }, { status: 500 })
    }

    return NextResponse.json(treatment)
  } catch (error) {
    console.error('Error updating treatment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}