// Customer management API
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const phoneNumber = searchParams.get('phone')

    console.log(`=== CUSTOMERS API START ===`)
    console.log(`Phone filter: ${phoneNumber}`)
    
    // Query actual Supabase customers table
    let query = supabase
      .from('customers')
      .select('*')

    if (phoneNumber) {
      // Use phone_raw column
      query = query.eq('phone_raw', phoneNumber)
    }

    const { data: customers, error } = await query
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase customers query failed:', error)
      return NextResponse.json([])
    }

    console.log(`✅ Found ${customers?.length || 0} customers from Supabase`)
    return NextResponse.json(customers || [])
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Insert into actual Supabase customers table - try different column names
    const { data: customer, error } = await supabase
      .from('customers')
      .insert([{
        first_name: body.first_name || '',
        last_name: body.last_name || '',
        email: body.email || '',
        phone_raw: body.phone_number || body.phone || '',
        notes: body.notes || ''
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating customer in Supabase:', error)
      return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 })
    }

    console.log('✅ Customer created successfully in Supabase:', customer)
    return NextResponse.json(customer)
  } catch (error) {
    console.error('Error creating customer:', error)
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 })
  }
}