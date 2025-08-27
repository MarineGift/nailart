import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('bookingId')

    let query = supabase
      .from('booking_history')
      .select('*')
      .order('created_at', { ascending: false })

    if (bookingId) {
      query = query.eq('booking_id', bookingId)
    } else {
      query = query.limit(100)
    }

    const { data: history, error } = await query

    if (error) {
      console.error('Supabase booking history query failed:', error)
      return NextResponse.json([])
    }

    return NextResponse.json(history || [])
  } catch (error) {
    console.error('Error fetching booking history:', error)
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { data, error } = await supabase
      .from('booking_history')
      .insert([body])
      .select()
      .single()

    if (error) {
      console.error('Supabase booking history insert failed:', error)
      return NextResponse.json({ error: 'Failed to create booking history' }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating booking history:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}