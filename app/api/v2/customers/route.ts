import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone')
    const search = searchParams.get('search')

    let query = supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false })

    if (phone) {
      // Phone으로 검색 (정규화된 형태로)
      const normalizedPhone = phone.replace(/[^0-9]/g, '')
      query = query.eq('phone_e164', normalizedPhone)
    }

    if (search) {
      // 이름이나 전화번호로 검색
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,phone_raw.ilike.%${search}%`)
    }

    const { data: customers, error } = await query

    if (error) {
      console.error('Supabase customers query failed:', error)
      return NextResponse.json({ error: 'Database query failed' }, { status: 500 })
    }

    return NextResponse.json(customers || [])
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      phone_raw, first_name, last_name, workplace, 
      address_line1, address_line2, city, state, 
      postal_code, country, nationality, ethnicity 
    } = body

    // 전화번호 정규화 검사
    const normalizedPhone = phone_raw.replace(/[^0-9]/g, '')
    
    // 기존 고객 검사
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('phone_e164', normalizedPhone)
      .single()

    if (existingCustomer) {
      return NextResponse.json({ 
        error: 'Customer with this phone number already exists' 
      }, { status: 409 })
    }

    const { data: customer, error } = await supabase
      .from('customers')
      .insert([{
        phone_raw,
        first_name,
        last_name,
        workplace,
        address_line1,
        address_line2,
        city,
        state,
        postal_code,
        country,
        nationality,
        ethnicity
      }])
      .select()
      .single()

    if (error) {
      console.error('Supabase customer insert failed:', error)
      return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 })
    }

    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    console.error('Error creating customer:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}