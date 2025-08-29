import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { staff_members } = body

    if (!staff_members || !Array.isArray(staff_members)) {
      return NextResponse.json({ error: 'staff_members array is required' }, { status: 400 })
    }

    console.log('=== BULK STAFF CREATION START ===')
    console.log('Creating', staff_members.length, 'staff members')

    const { data: newStaff, error } = await supabase
      .from('staff')
      .insert(staff_members)
      .select()

    if (error) {
      console.error('Bulk staff creation failed:', error)
      return NextResponse.json({ error: 'Failed to create staff members', details: error }, { status: 500 })
    }

    console.log('✅ Successfully created', newStaff.length, 'staff members')
    return NextResponse.json({ 
      success: true, 
      created_count: newStaff.length,
      staff: newStaff 
    })
  } catch (error) {
    console.error('Error in bulk staff creation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}