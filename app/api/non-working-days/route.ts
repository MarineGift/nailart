import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year') || '2025'
    const month = searchParams.get('month')
    
    let query = supabase
      .from('non_working_days')
      .select('*')
      .gte('date', `${year}-01-01`)
      .lte('date', `${year}-12-31`)
      .order('date', { ascending: true })

    if (month) {
      const monthStr = month.padStart(2, '0')
      query = query
        .gte('date', `${year}-${monthStr}-01`)
        .lte('date', `${year}-${monthStr}-31`)
    }

    const { data: nonWorkingDays, error } = await query

    if (error) {
      console.error('Non-working days query failed:', error)
      return NextResponse.json([])
    }

    return NextResponse.json(nonWorkingDays || [])
  } catch (error) {
    console.error('Error fetching non-working days:', error)
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, day_type, name, description } = body

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 })
    }

    const { data: newNonWorkingDay, error } = await supabase
      .from('non_working_days')
      .insert({
        date,
        day_type: day_type || 'custom',
        name: name || '휴무일',
        description: description || '',
        created_by: 'admin'
      })
      .select()
      .single()

    if (error) {
      console.error('Non-working day insert failed:', error)
      return NextResponse.json({ error: 'Failed to create non-working day' }, { status: 500 })
    }

    return NextResponse.json(newNonWorkingDay)
  } catch (error) {
    console.error('Error creating non-working day:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('non_working_days')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Non-working day delete failed:', error)
      return NextResponse.json({ error: 'Failed to delete non-working day' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting non-working day:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}