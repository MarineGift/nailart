import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active')

    let query = supabase
      .from('services')
      .select('*')
      .order('name', { ascending: true })

    if (active === 'true') {
      query = query.eq('is_active', true)
    }

    const { data: services, error } = await query

    if (error) {
      console.error('Supabase services query failed:', error)
      // 테이블이 없으면 빈 배열 반환
      return NextResponse.json([])
    }

    // cents를 dollars로 변환
    const servicesWithPrice = (services || []).map(service => ({
      ...service,
      price: service.base_price_cents / 100,
      duration: service.duration_min
    }))

    return NextResponse.json(servicesWithPrice)
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, name, description, price, duration_min } = body

    const { data: service, error } = await supabase
      .from('services')
      .insert([{
        code,
        name,
        description,
        base_price_cents: Math.round(price * 100), // dollars to cents
        duration_min,
        is_active: true
      }])
      .select()
      .single()

    if (error) {
      console.error('Supabase service insert failed:', error)
      return NextResponse.json({ error: 'Failed to create service' }, { status: 500 })
    }

    return NextResponse.json({
      ...service,
      price: service.base_price_cents / 100,
      duration: service.duration_min
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}