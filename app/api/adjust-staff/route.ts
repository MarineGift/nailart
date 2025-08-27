import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST() {
  try {
    // 1. Get all current staff
    const { data: allStaff, error: fetchError } = await supabase
      .from('staff')
      .select('id, first_name, last_name, role')
      .eq('is_active', true)

    if (fetchError || !allStaff) {
      return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 })
    }

    console.log(`Current active staff: ${allStaff.length}`)

    // 2. Clear all existing staff first
    const { error: clearError } = await supabase
      .from('staff')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (clearError) {
      console.error('Failed to clear staff:', clearError)
    }

    // 3. Create exactly 6 active staff members
    const newStaff = [
      { first_name: 'Connie', last_name: 'Lee', role: 'admin', email: 'connie@connienail.com', phone: '202-555-0001', is_active: true },
      { first_name: 'Sarah', last_name: 'Kim', role: 'manager', email: 'sarah@connienail.com', phone: '202-555-0002', is_active: true },
      { first_name: 'Michelle', last_name: 'Park', role: 'manager', email: 'michelle@connienail.com', phone: '202-555-0003', is_active: true },
      { first_name: 'Jessica', last_name: 'Wang', role: 'staff', email: 'jessica@connienail.com', phone: '202-555-0004', is_active: true },
      { first_name: 'Amy', last_name: 'Chen', role: 'staff', email: 'amy@connienail.com', phone: '202-555-0005', is_active: true },
      { first_name: 'Sophia', last_name: 'Williams', role: 'staff', email: 'sophia@connienail.com', phone: '202-555-0006', is_active: true }
    ]

    const { data: insertedStaff, error: insertError } = await supabase
      .from('staff')
      .insert(newStaff)
      .select()

    if (insertError) {
      return NextResponse.json({ error: `Failed to create staff: ${insertError.message}` }, { status: 500 })
    }

    // 4. Update existing bookings to assign to these new staff members
    if (insertedStaff && insertedStaff.length > 0) {
      // Get all bookings
      const { data: bookings } = await supabase
        .from('bookings')
        .select('id')

      if (bookings && bookings.length > 0) {
        // Randomly assign bookings to active staff
        for (const booking of bookings) {
          const randomStaff = insertedStaff[Math.floor(Math.random() * insertedStaff.length)]
          await supabase
            .from('bookings')
            .update({ created_by: randomStaff.id })
            .eq('id', booking.id)
        }
      }
    }

    return NextResponse.json({
      message: '직원 수 조정 완료!',
      summary: {
        previous_count: allStaff.length,
        new_active_count: 6,
        staff_list: newStaff.map(s => `${s.first_name} ${s.last_name} (${s.role})`)
      },
      inserted: insertedStaff?.length || 0
    })

  } catch (error) {
    console.error('Error adjusting staff:', error)
    return NextResponse.json({ error: 'Failed to adjust staff' }, { status: 500 })
  }
}