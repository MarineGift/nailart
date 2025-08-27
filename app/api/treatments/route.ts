import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('=== TREATMENTS GET API CALLED ===')
    
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    
    console.log('Requested date:', date)

    let query = supabase
      .from('treatments')
      .select('*')
      .order('created_at', { ascending: false })

    if (date) {
      // Filter by treatment date
      query = query.eq('treatment_date', date)
    }

    const { data: treatments, error } = await query

    if (error) {
      console.error('Supabase treatments query error:', error)
      return NextResponse.json({ error: 'Failed to fetch treatments' }, { status: 500 })
    }

    console.log(`✅ Found ${treatments?.length || 0} treatments${date ? ` for ${date}` : ''} from Supabase`)
    return NextResponse.json(treatments || [])

  } catch (error) {
    console.error('Error in treatments GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== TREATMENTS POST API CALLED ===')
    
    const body = await request.json()
    console.log('Treatment data received:', body)
    
    // Insert into treatments table
    const { data: treatment, error } = await supabase
      .from('treatments')
      .insert([{
        booking_id: body.booking_id,
        customer_id: body.customer_id,
        staff_id: body.staff_id,
        service_ids: JSON.stringify(body.service_ids || []),
        total_price_cents: body.total_price_cents || 0,
        notes: body.notes || '',
        treatment_date: body.treatment_date,
        status: 'completed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select('*')
      .single()

    if (error) {
      console.error('Error creating treatment in Supabase:', error)
      return NextResponse.json({ error: 'Failed to create treatment', details: error }, { status: 500 })
    }

    console.log('✅ Treatment created successfully in Supabase:', treatment)
    return NextResponse.json(treatment)

  } catch (error) {
    console.error('Error creating treatment:', error)
    return NextResponse.json({ error: 'Failed to create treatment' }, { status: 500 })
  }
}