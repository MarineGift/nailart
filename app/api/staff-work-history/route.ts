import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('staff_work_history')
      .select('*')
      .order('event_date', { ascending: false })
      .order('input_timestamp', { ascending: false })

    if (error) {
      console.error('Database query failed:', error)
      return NextResponse.json({ error: 'Database query failed' }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error fetching staff work history:', error)
    return NextResponse.json({ error: 'Failed to fetch staff work history' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { staff_id, staff_name, event_type, event_date, notes, input_person } = body

    const { data, error } = await supabase
      .from('staff_work_history')
      .insert({
        staff_id,
        staff_name,
        event_type,
        event_date,
        notes,
        input_person,
        input_timestamp: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Database insert failed:', error)
      return NextResponse.json({ error: 'Failed to create staff work history' }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating staff work history:', error)
    return NextResponse.json({ error: 'Failed to create staff work history' }, { status: 500 })
  }
}