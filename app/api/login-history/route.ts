import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('login_history')
      .select('*')
      .order('login_timestamp', { ascending: false })
      .limit(100)

    if (error) {
      console.error('Database query failed:', error)
      return NextResponse.json({ error: 'Database query failed' }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error fetching login history:', error)
    return NextResponse.json({ error: 'Failed to fetch login history' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, username, ip_address, user_agent, input_person } = body

    const { data, error } = await supabase
      .from('login_history')
      .insert({
        user_id,
        username,
        ip_address,
        user_agent,
        input_person,
        login_timestamp: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Database insert failed:', error)
      return NextResponse.json({ error: 'Failed to create login history' }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating login history:', error)
    return NextResponse.json({ error: 'Failed to create login history' }, { status: 500 })
  }
}