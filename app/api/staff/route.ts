// Staff management API
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    console.log(`=== STAFF API START ===`)
    console.log(`Date filter: ${date}`)

    // Query actual Supabase staff table
    const { data: staff, error } = await supabase
      .from('staff')
      .select('*')
      .order('first_name', { ascending: true })

    if (error) {
      console.error('Supabase staff query failed:', error)
      return NextResponse.json([])
    }

    // Map Supabase fields to frontend expected format
    const mappedStaff = staff?.map(member => ({
      id: member.id,
      firstName: member.first_name || `Staff`,
      lastName: member.last_name || `${member.id.slice(-4)}`,
      position: member.role || 'Nail Technician',
      specialties: member.specialties || ['Nail Specialist', 'Manicure', 'Pedicure'],
      working_hours: {
        start: '10:00',
        end: '20:00'
      },
      phone: member.phone,
      email: member.email,
      is_active: member.is_active
    })) || []

    console.log(`✅ Found ${mappedStaff.length} staff members from Supabase`)
    console.log('Staff data sample:', mappedStaff.slice(0, 2))
    return NextResponse.json(mappedStaff)
  } catch (error) {
    console.error('Error fetching staff:', error)
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { data: staff, error } = await supabase
      .from('staff')
      .insert([{
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email,
        phone: body.phone,
        role: body.role || 'staff',
        is_active: body.is_active ?? true,
        notes: body.notes
      }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(staff)
  } catch (error) {
    console.error('Error creating staff:', error)
    return NextResponse.json({ error: 'Failed to create staff' }, { status: 500 })
  }
}